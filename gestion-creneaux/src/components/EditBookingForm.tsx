import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Booking } from '../types/types';
import LoadingSpinner from './LoadingSpinner';
import '../styles/components/BookingForm.css';

interface EditBookingFormProps {
  onUpdateBooking: (booking: Booking) => void;
}

const EditBookingForm: React.FC<EditBookingFormProps> = ({
  onUpdateBooking,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    spaceName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadBookingData = async () => {
      setIsLoading(true);

      try {
        console.log('Loading booking data for ID:', bookingId);

        const storedBookingData = localStorage.getItem('editingBooking');
        console.log('Stored booking data:', storedBookingData);

        if (storedBookingData) {
          try {
            const parsedBooking = JSON.parse(storedBookingData) as Booking;
            console.log('Parsed booking:', parsedBooking);

            if (parsedBooking.id.toString() !== bookingId) {
              console.error(
                'Booking ID mismatch:',
                parsedBooking.id,
                'vs',
                bookingId,
              );
              throw new Error('Wrong booking loaded');
            }

            setBooking(parsedBooking);

            setFormData({
              title: parsedBooking.title || '',
              description: parsedBooking.description || '',
              date: parsedBooking.date || '',
              startTime: parsedBooking.startTime || '',
              endTime: parsedBooking.endTime || '',
              spaceName: parsedBooking.spaceName || '',
            });
          } catch (parseError) {
            console.error('Error with booking data:', parseError);
            setErrors({
              form: 'Error loading correct booking data. Please try again.',
            });
            setTimeout(() => navigate('/bookings'), 2000);
          }
        } else {
          console.log('No stored booking data found');
          setErrors({
            form: 'Booking not found. Please go back and try again.',
          });
        }
      } catch (error) {
        console.error('Error loading booking:', error);
        setErrors({
          form: t('bookings.loadError') || 'Error loading booking data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingData();
  }, [bookingId, t, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('bookings.titleRequired') || 'Title is required';
    }

    if (!formData.date) {
      newErrors.date = t('bookings.dateRequired') || 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime =
        t('bookings.startTimeRequired') || 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime =
        t('bookings.endTimeRequired') || 'End time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !booking) {
      return;
    }

    setIsLoading(true);

    try {
      const updatedBooking: Booking = {
        ...booking,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      console.log('Submitting updated booking:', updatedBooking);

      onUpdateBooking(updatedBooking);

      localStorage.removeItem('editingBooking');

      alert(t('bookings.updateSuccess') || 'Booking updated successfully');

      navigate('/bookings');
    } catch (error) {
      console.error('Error updating booking:', error);
      setErrors({
        form: t('bookings.updateError') || 'Error updating booking',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    if (
      window.confirm(
        t('bookings.confirmCancel') ||
          'Are you sure you want to cancel editing? Any changes will be lost.',
      )
    ) {
      navigate('/bookings');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return (
      <div className="booking-form-container">
        <div className="error-message">
          {t('bookings.notFound') || 'Booking not found'}
        </div>
        <button className="button" onClick={() => navigate('/bookings')}>
          {t('common.back') || 'Back to Bookings'}
        </button>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <h1>{t('bookings.editTitle') || 'Edit Booking'}</h1>

      {errors.form && <div className="error-message">{errors.form}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="title">{t('bookings.titleLabel') || 'Title'}*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
            placeholder="Booking title"
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            {t('bookings.descriptionLabel') || 'Description'}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Booking description (optional)"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">{t('bookings.dateLabel') || 'Date'}*</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <div className="error-message">{errors.date}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="startTime">
              {t('bookings.startTimeLabel') || 'Start Time'}*
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={errors.startTime ? 'error' : ''}
            />
            {errors.startTime && (
              <div className="error-message">{errors.startTime}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="endTime">
              {t('bookings.endTimeLabel') || 'End Time'}*
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={errors.endTime ? 'error' : ''}
            />
            {errors.endTime && (
              <div className="error-message">{errors.endTime}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>
            {t('bookings.roomLabel') || 'Room'}: {booking.spaceName}
          </label>
          <p className="help-text">
            {t('bookings.roomChangeHelp') ||
              'To change rooms, please cancel and create a new booking.'}
          </p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={handleCancel}
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button type="submit" className="button primary" disabled={isLoading}>
            {isLoading
              ? t('common.saving') || 'Saving...'
              : t('common.save') || 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBookingForm;
