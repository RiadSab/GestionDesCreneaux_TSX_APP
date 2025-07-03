import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserBookingSlot, User, Booking } from '../types/types';
import '../styles/components/MyBookings.css';
import EmailConfirmation from './EmailConfirmation';
import LoadingSpinner from './LoadingSpinner';
import { getMyBookedSlots, cancelSlot } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmationModal from './ConfirmationModal';

interface MyBookingsProps {
  currentUser: Partial<User>;
}

const MyBookings: React.FC<MyBookingsProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState<UserBookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'reserved' | 'cancelled'
  >('all');
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(
    null,
  );
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [selectedBookingForEmail, setSelectedBookingForEmail] = useState<UserBookingSlot | null>(null);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);

  const handleModalCancelAction = () => {
    console.log('[MyBookings] handleModalCancelAction CALLED. Closing modal.');
    setShowCancelConfirmModal(false);
    setBookingToCancel(null);
  };

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (currentUser && currentUser.name) {
        setIsLoading(true);
        try {
          const response = await getMyBookedSlots(currentUser.name);
          setUserBookings(response.slots || []);
        } catch (error) {
          console.error('Error fetching user bookings:', error);
          setUserBookings([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserBookings([]);
        setIsLoading(false);
      }
    };

    fetchUserBookings();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(inputValue.toLowerCase().trim());
  };

  const filteredAndSortedBookings = useMemo(() => {
    let result = [...userBookings];

    if (filterStatus !== 'all') {
      if (filterStatus === 'reserved') {
        result = result.filter((booking) => booking.reserved);
      } else if (filterStatus === 'cancelled') {
        result = result.filter((booking) => !booking.reserved);
      }
    }

    if (searchTerm) {
      result = result.filter(
        (booking) =>
          booking.room.roomName.toLowerCase().includes(searchTerm) ||
          booking.owner.userName.toLowerCase().includes(searchTerm),
      );
    }

    result.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    return result;
  }, [userBookings, filterStatus, searchTerm]);

  const handleCancelBookingRequest = (slotId: number) => {
    console.log('[MyBookings] handleCancelBookingRequest called with slotId:', slotId);
    setBookingToCancel(slotId);
    setShowCancelConfirmModal(true);
  };

  const confirmCancelBooking = async () => {
    console.log('[MyBookings] confirmCancelBooking function INVOKED.');
    console.log('[MyBookings] Current bookingToCancel (slotId) state:', bookingToCancel);

    if (bookingToCancel === null) {
      console.error('[MyBookings] bookingToCancel (slotId) is null. Cannot proceed.');
      setShowCancelConfirmModal(false);
      return;
    }

    console.log('[MyBookings] Attempting to cancel booking with slot ID:', bookingToCancel);
    setIsLoading(true);

    try {
      console.log('[MyBookings] PRE-AWAIT: Calling cancelSlot API service for slotId:', bookingToCancel);
      await cancelSlot(bookingToCancel);
      console.log('[MyBookings] POST-AWAIT: cancelSlot call completed with result:');

      setUserBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingToCancel ? { ...booking, reserved: false } : booking
        )
      );

      alert(t('alerts.bookingCancelled'));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMessage = error instanceof Error && (error as any).response?.data?.message
        ? (error as any).response.data.message
        : t('alerts.bookingCancelError');
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setShowCancelConfirmModal(false);
      setBookingToCancel(null);
    }
  };

  const toggleExpandBooking = (bookingId: number) => {
    setExpandedBookingId(expandedBookingId === bookingId ? null : bookingId);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleResendConfirmation = (booking: UserBookingSlot) => {
    setSelectedBookingForEmail(booking);
    setShowEmailConfirmation(true);
  };

  const formatRoomDisplay = (roomName: string) => {
    if (roomName?.toLowerCase().includes('amphi')) {
      return roomName;
    } else {
      return `${t('bookings.room')}: ${roomName}`;
    }
  };

  const handleSendEmail = () => {
    console.log('Sending email confirmation for booking ID:', selectedBookingForEmail?.id);
    setTimeout(() => {
      setShowEmailConfirmation(false);
      alert(t('alerts.emailSent') || 'Email sent successfully!');
    }, 1000);
  };
  const mapUserBookingSlotToBooking = (slot: UserBookingSlot): Booking => {
    const startDate = new Date(slot.startTime);
    const endDate = new Date(slot.endTime);
    const date = startDate.toISOString().split('T')[0];
    const startTime = startDate.toTimeString().slice(0, 5);
    const endTime = endDate.toTimeString().slice(0, 5);

    return {
      id: slot.id,
      title: `Booking for ${slot.room.roomName}`,
      description: '',
      date: date,
      startTime: startTime,
      endTime: endTime,
      spaceName: slot.room.roomName,
      userId: slot.owner.id,
      userName: slot.owner.userName,
      userEmail: slot.owner.email,
      status: slot.reserved ? 'confirmed' : 'cancelled',
      user: {
        id: slot.owner.id,
        name: slot.owner.userName,
        email: slot.owner.email,
        password: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      room: {
        id: slot.room.id,
        name: slot.room.roomName,
      },
    };
  };

  const handleEditBooking = (bookingSlot: UserBookingSlot) => {
    const bookingToEdit = mapUserBookingSlotToBooking(bookingSlot);
    localStorage.setItem('editingBooking', JSON.stringify(bookingToEdit));
    navigate(`/edit-booking/${bookingToEdit.id}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="my-bookings-container">
      <h1>{t('myBookings.title')}</h1>
      <form onSubmit={handleSearchSubmit} className="search-filter-form">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={t('myBookings.searchPlaceholder') || 'Search by room or user...'}
          className="search-input"
        />
        <button type="submit" className="search-button">{t('common.search')}</button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'reserved' | 'cancelled')}
          className="filter-select"
        >
          <option value="all">{t('myBookings.filterAll')}</option>
          <option value="reserved">{t('myBookings.filterReserved')}</option>
          <option value="cancelled">{t('myBookings.filterCancelled')}</option>
        </select>
      </form>

      {filteredAndSortedBookings.length === 0 ? (
        <p>{t('myBookings.noBookings')}</p>
      ) : (
        <ul className="booking-list">
          {filteredAndSortedBookings.map((booking) => (
            <li
              key={booking.id}
              className={`booking-item ${!booking.reserved ? 'cancelled' : ''}`}
            >
              <div className="booking-item-header" onClick={() => toggleExpandBooking(booking.id)}>
                <span className="booking-room">{formatRoomDisplay(booking.room.roomName)}</span>
                <span className="booking-date">{formatDate(booking.startTime)}</span>
                <span className={`booking-status ${!booking.reserved ? 'status-cancelled' : 'status-reserved'}`}>
                  {!booking.reserved ? t('bookings.statusCancelled') : t('bookings.statusReserved')}
                </span>
                <span className={`toggle-icon ${expandedBookingId === booking.id ? 'expanded' : ''}`}>▼</span>
              </div>

              {expandedBookingId === booking.id && (
                <div className="booking-item-details">
                  <p><strong>{t('bookings.time')}:</strong> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                  <p><strong>{t('bookings.bookedBy')}:</strong> {booking.owner.userName}</p>
                  <div className="booking-actions">
                    {booking.reserved && (
                      <>
                        <button
                          className="button-edit"
                          onClick={() => handleEditBooking(booking)}
                        >
                          {t('bookings.edit') || 'Modifier'}
                        </button>
                        <button
                          className="button-cancel"
                          onClick={() => handleCancelBookingRequest(booking.id)}
                        >
                          {t('bookings.cancel') || 'Annuler'}
                        </button>
                      </>
                    )}
                    <button
                      className="button-resend"
                      onClick={() => handleResendConfirmation(booking)}
                    >
                      {t('bookings.resendConfirmation') || 'Renvoyer la confirmation'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}      {showEmailConfirmation && selectedBookingForEmail && (
        <EmailConfirmation
          booking={mapUserBookingSlotToBooking(selectedBookingForEmail)}
          user={currentUser}
          onClose={() => setShowEmailConfirmation(false)}
          onSend={handleSendEmail}
        />
      )}

      {showCancelConfirmModal && (
        <ConfirmationModal
          isOpen={showCancelConfirmModal}
          onCancel={handleModalCancelAction}
          onConfirm={confirmCancelBooking}
          title={t('modals.cancelBookingTitle')}
          message={t('modals.cancelBookingMessage')}
        />
      )}
    </div>
  );
};

export default MyBookings;
