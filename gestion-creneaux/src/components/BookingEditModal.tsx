import React, { useState, useEffect } from 'react';
import { UserBookingSlot } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/components/BookingEditModal.css';

interface BookingEditModalProps {
  booking: UserBookingSlot;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBooking: UserBookingSlot) => void;
}

const BookingEditModal: React.FC<BookingEditModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useLanguage();
  const [updatedBooking, setUpdatedBooking] = useState<UserBookingSlot>({ ...booking });
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(booking.duration.toString());

  useEffect(() => {
    if (booking) {
      const startDateTime = new Date(booking.startTime);
      setStartDate(startDateTime.toISOString().split('T')[0]);
      setStartTime(startDateTime.toTimeString().substring(0, 5));
      setDuration(booking.duration.toString());
      setUpdatedBooking({ ...booking });
    }
  }, [booking]);
  const handleSave = () => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + parseFloat(duration));
    
    const updatedBookingData = {
      ...updatedBooking,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: parseFloat(duration),
    };
    
    onSave(updatedBookingData);
  };

  if (!isOpen) return null;

  return (
    <div className="booking-edit-modal-overlay">
      <div className="booking-edit-modal">
        <div className="booking-edit-modal-header">
          <h2>{t('bookings.editBooking')}</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="booking-edit-modal-body">
          <div className="form-group">
            <label htmlFor="roomName">{t('bookings.room')}</label>
            <input
              type="text"
              id="roomName"
              value={updatedBooking.room.roomName}
              disabled
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startDate">{t('bookings.date')}</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startTime">{t('bookings.startTime')}</label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="duration">{t('bookings.duration')} ({t('bookings.hours')})</label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="form-control"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
        </div>
          <div className="booking-edit-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button className="save-button" onClick={handleSave}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingEditModal;
