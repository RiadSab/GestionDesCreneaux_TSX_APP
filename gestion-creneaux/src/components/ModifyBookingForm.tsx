import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';
import { User, Booking, Room } from '../types/types';
import '../styles/components/ModifyBookingForm.css';

// Extend the Booking type with purpose property
type BookingWithPurpose = Booking & { purpose?: string; modifiedAt?: string; room?: Room };

interface ModifyBookingFormProps {
  currentUser: Partial<User>;
  bookings: Booking[];
  onModifyBooking: (booking: Booking) => void;
}

const ModifyBookingForm: React.FC<ModifyBookingFormProps> = ({
  currentUser,
  bookings,
  onModifyBooking,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { t, isTranslationsLoaded } = useLanguage();

  const [booking, setBooking] = useState<BookingWithPurpose | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Find the booking to modify
  useEffect(() => {
    if (bookings.length > 0 && id) {
      const foundBooking = bookings.find((b) => b.id === Number(id));
      if (foundBooking) {
        setBooking(foundBooking as unknown as BookingWithPurpose);
        // Format the date and time for the form fields
        const bookingDate = new Date(foundBooking.date);
        setDate(bookingDate.toISOString().split('T')[0]);
        setStartTime(foundBooking.startTime);
        setEndTime(foundBooking.endTime);
        setPurpose(foundBooking.description || '');
      } else {
        setError('Booking not found');
      }
      setIsLoading(false);
    }
  }, [bookings, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!booking) return;

    // Create date objects for the new times
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    // Validate times
    if (startDateTime >= endDateTime) {
      setError('Start time must be before end time.');
      return;
    }

    // Create modified booking
    const modifiedBooking: BookingWithPurpose = {
      ...booking,
      date: date,
      startTime: startTime,
      endTime: endTime,
      description: purpose,
      modifiedAt: new Date().toISOString(),
    };

    // Update the booking
    onModifyBooking(modifiedBooking as Booking);
    navigate('/bookings');
  };

  if (/* !isTranslationsLoaded || */ isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <button onClick={() => navigate('/bookings')}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="modify-booking-container">
      <h2>Modify Booking</h2>

      {booking && (
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="room">Room</label>
            <input
              type="text"
              id="room"
              value={booking.room?.name || booking.spaceName || ''}
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time</label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose / Description</label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ModifyBookingForm;
