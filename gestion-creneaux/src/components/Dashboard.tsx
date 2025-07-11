import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardProps, UserBookingSlot } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/components/Dashboard.css';
import { getAllRooms, getMyBookedSlots } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC<DashboardProps> = () => {
  const { t, language } = useLanguage();
  const { user: currentUser, token } = useAuth();  const navigate = useNavigate();
  const [upcomingBookings, setUpcomingBookings] = useState<UserBookingSlot[]>([]);
  const [availableRoomsSummary, setAvailableRoomsSummary] = useState<{
    [key: string]: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || !token || !currentUser.name) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [roomsResponse, bookingsResponse] = await Promise.all([
          getAllRooms(),
          getMyBookedSlots(currentUser.name),
        ]);        if (roomsResponse && Array.isArray(roomsResponse.rooms)) {
          const regularRooms = roomsResponse.rooms.filter(r => !r.roomLetter.toUpperCase().startsWith('A')).length;
          const amphitheaters = roomsResponse.rooms.filter(r => r.roomLetter.toUpperCase().startsWith('A')).length;
          setAvailableRoomsSummary({
            'Regular Rooms': regularRooms,
            Amphitheaters: amphitheaters,
            Total: roomsResponse.rooms.length,
          });
        } else {
          console.error('Failed to parse rooms data:', roomsResponse);
          setAvailableRoomsSummary({ 'Regular Rooms': 0, Amphitheaters: 0, Total: 0 });
        }

        if (bookingsResponse && Array.isArray(bookingsResponse.slots)) {
          const now = new Date();
          const upcoming = bookingsResponse.slots
            .filter(slot => new Date(slot.startTime) > now && slot.reserved)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          setUpcomingBookings(upcoming);
        } else {
          console.error('Failed to parse bookings data:', bookingsResponse);
        }      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setUpcomingBookings([]);
        setAvailableRoomsSummary({ 'Regular Rooms': 0, Amphitheaters: 0, Total: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && token) {
        fetchDashboardData();
    } else if (!currentUser || !token) {
        setIsLoading(false);
    }
  }, [currentUser, token]);

  const getTimeRemaining = (dateStr: string) => {
    const now = new Date();
    const bookingDate = new Date(dateStr);

    const diffTime = bookingDate.getTime() - now.getTime();

    if (diffTime <= 0) return t('dashboard.now');

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    let remainingString = '';

    if (diffDays > 0) {
      remainingString += `${diffDays}${t('dashboard.daysSuffix')} `;
    }
    if (diffHours > 0) {
      remainingString += `${diffHours}${t(diffDays > 0 ? 'dashboard.hoursSuffixShort' : 'dashboard.hoursSuffix')} `;
    }
    if (diffMinutes > 0 || (diffDays === 0 && diffHours === 0)) {
      remainingString += `${diffMinutes}${t(diffHours > 0 || diffDays > 0 ? 'dashboard.minutesSuffixShort' : 'dashboard.minutesSuffix')}`;
    }

    return remainingString.trim();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <LoadingSpinner /> 
          <p>{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
        <div className="dashboard-container">
            <p>{t('auth.pleaseLogin')}</p>
            <Link to="/login">{t('login.title')}</Link>
        </div>
    );
  }

  const bookingsToday = upcomingBookings.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    const today = new Date();
    return bookingDate.getFullYear() === today.getFullYear() &&
           bookingDate.getMonth() === today.getMonth() &&
           bookingDate.getDate() === today.getDate();
  }).length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>
          {t('dashboard.welcome')}, {currentUser.name || 'User'}
        </h1>
        <p className="current-date">
          {t('dashboard.currentDate')}{' '}
          {new Date().toLocaleDateString(
            language === 'fr' ? 'fr-FR' : 'en-US',
            {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            },
          )}
        </p>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card quick-actions">
          <h2>{t('dashboard.quickActions')}</h2>
          <div className="action-buttons">
            <button
              className="action-button"
              onClick={() => navigate('/reserve')}
            >
              <span className="action-icon">+</span>
              {t('dashboard.bookRoom')}
            </button>
            <button
              className="action-button"
              onClick={() => navigate('/bookings')}
            >
              <span className="action-icon">📋</span>
              {t('dashboard.viewBookings')}
            </button>
          </div>
        </div>

        <div className="dashboard-card upcoming-bookings">
          <h2>{t('dashboard.upcomingBookings')}</h2>
          {upcomingBookings.length === 0 ? (
            <div className="empty-state">
              <p>{t('dashboard.noUpcomingBookings')}</p>
              <Link to="/reserve">{t('dashboard.bookNow')}</Link>
            </div>
          ) : (
            <div className="bookings-list">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-date">
                    {formatDate(booking.startTime)}
                  </div>
                  <div className="booking-hours">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </div>
                  <div className="time-remaining">
                    {t('dashboard.timeRemainingPrefix')}{' '}{getTimeRemaining(booking.startTime)}
                  </div>
                  <div className="booking-title">{booking.room.roomName}</div>
                  <div className="booking-room">
                    {t('bookings.description')}: {booking.owner.userName}
                  </div>
                </div>
              ))}
              {upcomingBookings.length > 5 && (
                <Link to="/bookings" className="view-all-link">
                  {t('dashboard.viewAll')} ({upcomingBookings.length}) →
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="dashboard-card rooms-availability">
          <h2>{t('dashboard.availability')}</h2>
          <div className="availability-stats">
            {Object.entries(availableRoomsSummary).map(([roomType, count]) => {
              const translatedRoomType =
                roomType === 'Regular Rooms'
                  ? t('slots.regularRooms')
                  : roomType === 'Amphitheaters'
                  ? t('slots.amphitheaters')
                  : roomType === 'Total'
                  ? t('dashboard.total')
                  : roomType;

              return (
                <div key={roomType} className="availability-item">
                  <div>{translatedRoomType}</div>
                  <div>
                    {count} {t('dashboard.availableRooms')}
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/timeslots" className="check-availability-link">
            {t('dashboard.checkAvailability')} →
          </Link>
        </div>

        <div className="dashboard-card recent-activity">
          <h2>{t('dashboard.activitySummary')}</h2>
          <div className="activity-summary">
            <div className="activity-stat">
              <div className="stat-value">{upcomingBookings.length}</div>
              <div className="stat-label">{t('dashboard.upcomingCount')}</div>
            </div>
            <div className="activity-stat">
              <div className="stat-value">{bookingsToday}</div>
              <div className="stat-label">{t('dashboard.bookingsToday')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
