import React, { useState, useEffect, useMemo } from 'react';
import { UserBookingSlot, User, Booking } from '../types/types';
import '../styles/components/MyBookings.css';
import EmailConfirmation from './EmailConfirmation';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { getMyBookedSlots, cancelSlot } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmationModal from './ConfirmationModal';

interface MyBookingsProps {
  currentUser: Partial<User>;
  bookings?: Booking[];
  onModifyBooking?: (booking: Booking) => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ currentUser, onModifyBooking }) => {
  const { t } = useLanguage(); // <-- Add this line at the top of your component
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState<UserBookingSlot[]>([]); // Renamed and typed
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'reserved' | 'cancelled' // Adjusted status based on UserBookingSlot
  >('all');
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(
    null,
  );
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [selectedBookingForEmail, setSelectedBookingForEmail] = useState<UserBookingSlot | null>(null); // Typed
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);

  // New explicit handler for modal cancellation
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
          // setAuthToken est maintenant appelé dans AuthContext, donc pas besoin ici a priori
          const response = await getMyBookedSlots(currentUser.name);
          setUserBookings(response.slots || []); 
        } catch (error) {
          console.error('Error fetching user bookings:', error);
          setUserBookings([]); // Set to empty array on error
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserBookings([]); // No user or username, so no bookings
        setIsLoading(false);
      }
    };

    fetchUserBookings();
  }, [currentUser]); // Depend on currentUser and token

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(inputValue.toLowerCase().trim());
  };

  const filteredAndSortedBookings = useMemo(() => {
    let result = [...userBookings];

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'reserved') {
        result = result.filter((booking) => booking.reserved);
      } else if (filterStatus === 'cancelled') {
        // Assuming 'cancelled' means not reserved, or you have another field for it
        // For now, let's assume 'cancelled' means !booking.reserved if no explicit status field
        result = result.filter((booking) => !booking.reserved);
      }
    }

    // Filter by search term (e.g., in room name or owner's user name)
    if (searchTerm) {
      result = result.filter(
        (booking) =>
          booking.room.roomName.toLowerCase().includes(searchTerm) ||
          booking.owner.userName.toLowerCase().includes(searchTerm),
      );
    }

    // Sort: e.g., by start time
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
      // Directly make the API call without any other logic that might interfere
      console.log('[MyBookings] PRE-AWAIT: Calling cancelSlot API service for slotId:', bookingToCancel);
      await cancelSlot(bookingToCancel); 
      console.log('[MyBookings] POST-AWAIT: cancelSlot call completed with result:');
      
      // Update UI after successful API call
      setUserBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingToCancel ? { ...booking, reserved: false } : booking
        )
      );
      
      // Replace the alert with translated version
      alert(t('alerts.bookingCancelled'));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      // Replace with translation instead of error message directly
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

  // Add this missing function
  const formatRoomDisplay = (roomName: string) => {
    // Check if the room name contains "Amphi" (case insensitive)
    if (roomName?.toLowerCase().includes('amphi')) {
      return roomName; // Just return the amphi name without prefix
    } else {
      // For regular rooms, add the "Room:" prefix
      return `${t('bookings.room')}: ${roomName}`;
    }
  };

  // Remove the duplicate handleEditBooking function and keep this one
  const handleEditBooking = (bookingId: number) => {
    // This will require a page/modal for editing and a backend endpoint
    navigate(`/modify-booking/${bookingId}`);
    // Replace with translation
    alert(t('alerts.editNotImplemented'));
  };

  const handleSendEmail = () => {
    console.log('Sending email confirmation for booking ID:', selectedBookingForEmail?.id);
    setTimeout(() => {
      setShowEmailConfirmation(false);
      alert(t('alerts.emailSent'));
    }, 1000);
  };

  if (isLoading) { // Simplified loading condition
    return (
      <div className="my-bookings-container">
        <LoadingSpinner />
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  return (
    // Normal state without 'is-loading'
    <div className="my-bookings-container">
      <h1>{t('bookings.myBookings')}</h1>

      <div className="bookings-controls">
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <input
            type="text"
            placeholder={t('bookings.search')}
            value={inputValue}
            onChange={handleInputChange}
            aria-label={t('bookings.search')}
          />
          <button type="submit" className="search-button">
            {t('bookings.searchButton')}
          </button>
        </form>

        <div className="filter-options">
          <div className="filter-group">
            <label htmlFor="filterStatus">{t('bookings.status')}</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as 'all' | 'reserved' | 'cancelled')
              }
            >
              <option value="all">{t('bookings.all')}</option>
              <option value="reserved">{t('bookings.reserved')}</option>
              <option value="cancelled">{t('bookings.cancelled')}</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAndSortedBookings.length === 0 ? (
        <div className="no-bookings">
          <p>{t('bookings.noBookings')}</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredAndSortedBookings.map((booking) => (
            <div
              key={booking.id} 
              className={`booking-card ${
                !booking.reserved ? 'cancelled' : '' 
              }`}
            >
              <div
                className="booking-card-header"
                onClick={() => toggleExpandBooking(booking.id)} 
              >
                <div className="booking-basic-info">
                  <h3>{t('bookings.reservationFor')} {booking.room.roomName}</h3>
                  <div className="booking-meta">
                    <span className="booking-date">
                      {formatDate(booking.startTime)}
                    </span>
                    <span className="booking-time">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </span>
                    <span className="booking-room">
                      {formatRoomDisplay(booking.room.roomName)}
                    </span>
                  </div>
                </div>
                <div className="booking-status-indicator">
                  <span className={`status-badge ${booking.reserved ? 'confirmed' : 'cancelled'}`}>
                    {booking.reserved ? t('bookings.reserved') : t('bookings.cancelled')}
                  </span>
                  <span className="expand-icon">
                    {expandedBookingId === booking.id ? '▼' : '▶'} 
                  </span>
                </div>
              </div>

              {expandedBookingId === booking.id && (
                <div className="booking-details">
                  <div className="booking-description">
                    <h4>{t('bookings.details')}</h4>
                    <p>{t('bookings.bookedBy')}: {booking.owner.userName} ({booking.owner.email})</p>
                    <p>{t('bookings.roomCapacity')}: {booking.room.capacity}</p>
                    <p>{t('bookings.duration')}: {booking.duration} {t('bookings.hours')}</p>
                  </div>

                  <div className="booking-actions">
                    {booking.reserved && (
                      <>
                        <button
                          className="cancel-button"
                          onClick={() => handleCancelBookingRequest(booking.id)} 
                          disabled={isLoading} 
                        >
                          {t('bookings.cancelBooking')}
                        </button>
                        <button
                          className="resend-button"
                          onClick={() => handleResendConfirmation(booking)}
                        >
                          {t('bookings.resendConfirmation')}
                        </button>
                        <button
                          className="edit-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Stop event bubbling
                            e.preventDefault(); // Prevent default behavior
                            console.log(
                              'Edit button clicked for booking ID:',
                              booking.id,
                            );
                            handleEditBooking(booking.id);
                          }}
                        >
                          {t('common.edit') || 'Modifier'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showEmailConfirmation && selectedBookingForEmail && currentUser && (
        <EmailConfirmation
          booking={mapUserBookingSlotToBooking(selectedBookingForEmail, currentUser)} 
          user={currentUser} 
          onClose={() => setShowEmailConfirmation(false)}
          onSend={handleSendEmail}
          previewOnly={false}
        />
      )}

      {/* Modal Invocation */}
      {showCancelConfirmModal && (
        <ConfirmationModal
          isOpen={showCancelConfirmModal}
          title={t('bookings.confirmCancellation')}
          message={`${t('alerts.confirmCancellation')} Slot ID: ${bookingToCancel !== null ? bookingToCancel : 'N/A'}`}
          onConfirm={confirmCancelBooking}
          onCancel={handleModalCancelAction}
          confirmText={t('bookings.yesCancel')}
          cancelText={t('bookings.noKeep')}
        />
      )}
    </div>
  );
};

// Fonction de mappage à ajouter dans ce fichier ou un fichier d'utilitaires
const mapUserBookingSlotToBooking = (slot: UserBookingSlot, currentUser: Partial<User>): Booking => {
  const userId = currentUser.id ?? 0;
  const userName = currentUser.name ?? 'N/A';
  const userEmail = currentUser.email ?? 'N/A';

  const formatTimeForBooking = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return {
    id: slot.id, 
    userId: slot.owner.id, 
    title: `Reservation for ${slot.room.roomName}`,
    description: `Booking for room ${slot.room.roomName} by ${slot.owner.userName}`,
    userName: slot.owner.userName,
    userEmail: slot.owner.email,
    date: slot.startTime.split('T')[0], 
    startTime: formatTimeForBooking(slot.startTime),
    endTime: formatTimeForBooking(slot.endTime),
    spaceName: slot.room.roomName, // Use room.roomName instead of spaceName
    status: slot.reserved ? 'confirmed' : 'cancelled',
    user: { 
      id: userId,
      name: userName,
      email: userEmail,
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

export default MyBookings;
