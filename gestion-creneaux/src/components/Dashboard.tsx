import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Booking, DashboardProps, RoomDTO, UserBookingSlot } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/components/Dashboard.css';
import { getAllRooms, getMyBookedSlots } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC<DashboardProps> = (/*{ currentUser }*/) => { // currentUser from props might be stale, useAuth is better
  const { t, language, isTranslationsLoaded } = useLanguage();
  const { user: currentUser, token } = useAuth(); // Get user and token from AuthContext
  const [upcomingBookings, setUpcomingBookings] = useState<UserBookingSlot[]>([]); // Use UserBookingSlot
  const [allRooms, setAllRooms] = useState<RoomDTO[]>([]); // State for all rooms
  const [availableRoomsSummary, setAvailableRoomsSummary] = useState<{
    [key: string]: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || !token || !currentUser.name) { // Ensure currentUser.name is present
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Fetch actual data
        const [roomsResponse, bookingsResponse] = await Promise.all([
          getAllRooms(),
          getMyBookedSlots(currentUser.name), // currentUser.name is now guaranteed to be a string
        ]);

        if (roomsResponse && Array.isArray(roomsResponse.rooms)) {
          setAllRooms(roomsResponse.rooms);
          // Calculate available rooms summary (simple count for now)
          // This could be more sophisticated, e.g. checking actual availability for "today"
          const regularRooms = roomsResponse.rooms.filter(r => !r.roomLetter.toUpperCase().startsWith('A')).length; // Example: Non-Amphi
          const amphitheaters = roomsResponse.rooms.filter(r => r.roomLetter.toUpperCase().startsWith('A')).length; // Example: Amphi
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
            .filter(slot => new Date(slot.startTime) > now && slot.reserved) // Filter for future and reserved bookings
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()); // Sort by start time
          setUpcomingBookings(upcoming);
        } else {
          console.error('Failed to parse bookings data:', bookingsResponse);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty states or error messages for UI
        setUpcomingBookings([]);
        setAllRooms([]);
        setAvailableRoomsSummary({ 'Regular Rooms': 0, Amphitheaters: 0, Total: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    if (isTranslationsLoaded && currentUser && token) { // Ensure translations and user are loaded
        fetchDashboardData();
    } else if (!currentUser || !token) {
        setIsLoading(false); // Not logged in, stop loading
    }
    // Add isTranslationsLoaded, currentUser, and token to dependency array
  }, [currentUser, token, isTranslationsLoaded]); 

  const getTimeRemaining = (dateStr: string, timeStr?: string /* timeStr is part of dateStr for UserBookingSlot */) => {
    const now = new Date();
    // For UserBookingSlot, startTime is a full ISO string
    const bookingDate = new Date(dateStr); 
    
    const diffTime = bookingDate.getTime() - now.getTime();

    if (diffTime <= 0) return t('dashboard.now'); // Use translation

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
    if (diffMinutes > 0 || (diffDays === 0 && diffHours === 0)) { // Show minutes if it's the smallest unit or only unit
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

  // Add a translate function that uses t
  const translate = (key: string): string => {
    return t(key);
  };

  if (!isTranslationsLoaded || isLoading) { // Combined loading state
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <LoadingSpinner /> 
          <p>{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) { // If not logged in after loading, prompt to login
    return (
        <div className="dashboard-container">
            <p>{t('auth.pleaseLogin')}</p>
            <Link to="/login">{t('login.title')}</Link>
        </div>
    );
  }

  // Calculate bookings for today
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
          {t('dashboard.welcome')}, {currentUser.name || 'User'} {/* Fallback to 'User' if name is not available */}
        </h1>
        <p className="current-date">
          {translate('dashboard.currentDate')}{' '}
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
        {/* Quick Actions Card */}
        <div className="dashboard-card quick-actions">
          <h2>{translate('dashboard.quickActions')}</h2>
          <div className="action-buttons">
            <button
              className="action-button"
              onClick={() => navigate('/reserve')}
            >
              <span className="action-icon">+</span>
              {translate('dashboard.bookRoom')}
            </button>
            <button
              className="action-button"
              onClick={() => navigate('/bookings')}
            >
              <span className="action-icon">📋</span>
              {translate('dashboard.viewBookings')}
            </button>
          </div>
        </div>

        {/* Upcoming Bookings Card */}
        <div className="dashboard-card upcoming-bookings">
          <h2>{t('dashboard.upcomingBookings')}</h2>
          {/* Conditional rendering for bookings list or empty state */}
          {upcomingBookings.length === 0 ? (
            <div className="empty-state">
              <p>{translate('dashboard.noUpcomingBookings')}</p>
              <Link to="/reserve">{translate('dashboard.bookNow')}</Link>
            </div>
          ) : (
            <div className="bookings-list">
              {upcomingBookings.slice(0, 5).map((booking) => ( // Displaying first 5 upcoming
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

        {/* Rooms Availability Card */}
        <div className="dashboard-card rooms-availability">
          <h2>{translate('dashboard.availability')}</h2>
          <div className="availability-stats">
            {Object.entries(availableRoomsSummary).map(([roomType, count]) => {
              const translatedRoomType =
                roomType === 'Regular Rooms'
                  ? translate('slots.regularRooms')
                  : roomType === 'Amphitheaters'
                  ? translate('slots.amphitheaters')
                  : roomType === 'Total'
                  ? translate('dashboard.total')
                  : roomType;

              return (
                <div key={roomType} className="availability-item">
                  <div>{translatedRoomType}</div>
                  <div>
                    {count} {translate('dashboard.availableRooms')}
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/timeslots" className="check-availability-link">
            {translate('dashboard.checkAvailability')} →
          </Link>
        </div>

        {/* Activity Summary Card */}
        <div className="dashboard-card recent-activity">
          <h2>{translate('dashboard.activitySummary')}</h2>
          <div className="activity-summary">
            <div className="activity-stat">
              <div className="stat-value">{upcomingBookings.length}</div>
              <div className="stat-label">{t('dashboard.upcomingCount')}</div>
            </div>
            <div className="activity-stat">
              <div className="stat-value">{bookingsToday}</div> {/* Use calculated bookingsToday */}
              <div className="stat-label">{t('dashboard.bookingsToday')}</div>
            </div>
            <div className="activity-stat">
              <div className="stat-value">0</div>
              <div className="stat-label">
                {translate('dashboard.bookingsToday')}
              </div>
            </div>
            <div className="activity-stat">
              <div className="stat-value">0</div>
              <div className="stat-label">
                {translate('dashboard.pendingApprovals')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
