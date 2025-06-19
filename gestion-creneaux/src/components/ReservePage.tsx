import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Value } from 'react-calendar/dist/cjs/shared/types';
import { TimeSlot, Booking, User } from '../types/types';
import '../styles/components/ReservePage.css';
import { useLanguage } from '../contexts/LanguageContext';
import EmailConfirmation from './EmailConfirmation';

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

const ROOM_NUMBERS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const ROOM_LETTERS = ['A', 'B', 'C', 'D'];
const AMPHITHEATERS = ['Amphi 1', 'Amphi 2', 'Amphi Centrale'];

interface ReservePageProps {
  currentUser: Partial<User>;
  onBookingComplete?: (booking: Booking) => void;
}

const ReservePage: React.FC<ReservePageProps> = ({
  currentUser,
  onBookingComplete,
}) => {
  const { t, language, isTranslationsLoaded } = useLanguage();
  const [roomType, setRoomType] = useState<'regular' | 'amphi'>('regular');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomLetter, setRoomLetter] = useState('');
  const [amphitheater, setAmphitheater] = useState('');

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingDescription, setBookingDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageDataLoading, setIsPageDataLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [currentStep, setCurrentStep] = useState(1);

  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(
    null,
  );
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsPageDataLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsPageDataLoading(false);
    };
    if (isTranslationsLoaded !== false) {
      fetchInitialData();
    }
  }, [isTranslationsLoaded]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (roomType === 'regular') {
        if (!roomNumber) {
          newErrors.roomNumber = t('validation.roomNumberRequired');
        }
        if (!roomLetter) {
          newErrors.roomLetter = t('validation.roomLetterRequired');
        }
      } else if (roomType === 'amphi') {
        if (!amphitheater) {
          newErrors.amphitheater = t('validation.amphitheaterRequired');
        }
      }
    } else if (step === 2) {
    } else if (step === 3) {
      if (!selectedTimeSlot) {
        newErrors.selectedTimeSlot = t('validation.timeSlotRequired');
      }
    } else if (step === 4) {
      if (!bookingTitle.trim()) {
        newErrors.bookingTitle = t('validation.titleRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      value[0] instanceof Date
    ) {
      setSelectedDate(value[0]);
    }
  };

  const getRoomName = () => {
    if (roomType === 'regular' && roomNumber && roomLetter) {
      return `${roomNumber}${roomLetter}`;
    } else if (roomType === 'amphi' && amphitheater) {
      return amphitheater;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) {
      return;
    }

    setIsLoading(true);      try {
      const [startTime, endTime] = selectedTimeSlot.split(' - ');

      const roomName = getRoomName();

      const newBooking: Booking = {
        id: Math.floor(Math.random() * 1000),
        userId: currentUser.id || 0,
        title: bookingTitle,
        description: bookingDescription,
        userName: currentUser.name || '',
        userEmail: currentUser.email || '',
        date: selectedDate.toISOString().split('T')[0],
        startTime,
        endTime,
        spaceName: roomName,
        status: 'confirmed',
        room: {
          id: Math.floor(Math.random() * 1000),
          name: roomName,
        },
        user: currentUser as User,
      };      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCompletedBooking(newBooking);

      setRoomType('regular');
      setRoomNumber('');
      setRoomLetter('');
      setAmphitheater('');
      setSelectedTimeSlot('');
      setBookingTitle('');
      setBookingDescription('');
      setCurrentStep(1);

      if (onBookingComplete) {
        onBookingComplete(newBooking);
      }

      setShowEmailConfirmation(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(t('reservation.bookingError'));
    } finally {
      setIsLoading(false);
    }
  };
  const handleSendEmail = () => {
    console.log('Sending email confirmation...');
    setTimeout(() => {
      setShowEmailConfirmation(false);
      alert(t('email.sent'));
    }, 1000);
  };
  const renderRoomSelection = () => (
    <div className="form-step">
      <h2>{t('reservation.room')}</h2>

      <div className="room-type-selector">
        <div
          className={`type-option ${roomType === 'regular' ? 'selected' : ''}`}
          onClick={() => setRoomType('regular')}
        >
          <span className="option-label">{t('reservation.regularRoom')}</span>
        </div>
        <div
          className={`type-option ${roomType === 'amphi' ? 'selected' : ''}`}
          onClick={() => setRoomType('amphi')}
        >
          <span className="option-label">{t('reservation.amphitheater')}</span>
        </div>
      </div>

      {roomType === 'regular' ? (
        <div className="room-selector">
          <div className="form-group">
            <label htmlFor="roomNumber">
              {t('reservation.roomNumberLabel')}
            </label>
            <select
              id="roomNumber"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className={errors.roomNumber ? 'input-error' : ''}
            >
              <option value="">
                {t('reservation.selectNumberPlaceholder')}
              </option>
              {ROOM_NUMBERS.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            {errors.roomNumber && (
              <div className="error-message">{errors.roomNumber}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="roomLetter">
              {t('reservation.roomLetterLabel')}
            </label>
            <select
              id="roomLetter"
              value={roomLetter}
              onChange={(e) => setRoomLetter(e.target.value)}
              className={errors.roomLetter ? 'input-error' : ''}
            >
              <option value="">
                {t('reservation.selectLetterPlaceholder')}
              </option>
              {ROOM_LETTERS.map((letter) => (
                <option key={letter} value={letter}>
                  {letter}
                </option>
              ))}
            </select>
            {errors.roomLetter && (
              <div className="error-message">{errors.roomLetter}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="form-group">
          <label htmlFor="amphitheater">
            {t('reservation.amphitheaterLabel')}
          </label>
          <select
            id="amphitheater"
            value={amphitheater}
            onChange={(e) => setAmphitheater(e.target.value)}
            className={errors.amphitheater ? 'input-error' : ''}
          >
            <option value="">
              {t('reservation.selectAmphitheaterPlaceholder')}
            </option>
            {AMPHITHEATERS.map((amphi) => (
              <option key={amphi} value={amphi}>
                {amphi}
              </option>
            ))}
          </select>
          {errors.amphitheater && (
            <div className="error-message">{errors.amphitheater}</div>
          )}
        </div>
      )}

      <div className="step-actions">
        <button type="button" onClick={nextStep} className="confirm-button">
          {t('common.next')}
        </button>
      </div>
    </div>
  );
  const renderDateSelection = () => (
    <div className="form-step">
      <div className="step-header">
        <button className="back-button" onClick={prevStep}>
          {t('common.backArrow')}
        </button>
        <h2>{t('bookings.date')}</h2>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          minDate={new Date()}
          className="react-calendar"
        />
      </div>

      <div className="step-actions">
        <button type="button" onClick={nextStep} className="confirm-button">
          {t('common.next')}
        </button>
      </div>
    </div>
  );
  const renderTimeSelection = () => (
    <div className="form-step">
      <div className="step-header">
        <button className="back-button" onClick={prevStep}>
          {t('common.backArrow')}
        </button>
        <h2>
          {t('bookings.time')} {t('common.forTime')}{' '}
          {selectedDate.toLocaleDateString()}
        </h2>
      </div>

      <div className="time-options">
        {TIME_SLOTS.map((timeSlot) => (
          <div
            key={timeSlot}
            className={`time-option ${
              selectedTimeSlot === timeSlot ? 'selected' : ''
            }`}
            onClick={() => setSelectedTimeSlot(timeSlot)}
          >
            {timeSlot}
          </div>
        ))}
      </div>
      {errors.selectedTimeSlot && (
        <div className="error-message">{errors.selectedTimeSlot}</div>
      )}

      <div className="step-actions">
        <button type="button" onClick={nextStep} className="confirm-button">
          {t('common.next')}
        </button>
      </div>
    </div>
  );
  const renderBookingDetails = () => (
    <div className="form-step">
      <div className="step-header">
        <button className="back-button" onClick={prevStep}>
          {t('common.backArrow')}
        </button>
        <h2>{t('reservation.bookingDetails')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="bookingTitle">{t('reservation.titleLabel')}</label>
          <input
            type="text"
            id="bookingTitle"
            value={bookingTitle}
            onChange={(e) => setBookingTitle(e.target.value)}
            placeholder={t('reservation.titlePlaceholder')}
            className={errors.bookingTitle ? 'input-error' : ''}
          />
          {errors.bookingTitle && (
            <div className="error-message">{errors.bookingTitle}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bookingDescription">
            {t('reservation.descriptionLabelOptional')}
          </label>
          <textarea
            id="bookingDescription"
            value={bookingDescription}
            onChange={(e) => setBookingDescription(e.target.value)}
            placeholder={t('reservation.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div className="booking-summary">
          <h3>{t('reservation.summaryTitle')}</h3>
          <div className="summary-item">
            <span>{t('reservation.summaryRoom')}:</span>
            <span>{getRoomName()}</span>
          </div>
          <div className="summary-item">
            <span>{t('reservation.summaryDate')}:</span>
            <span>{selectedDate.toLocaleDateString()}</span>
          </div>
          <div className="summary-item">
            <span>{t('reservation.summaryTime')}:</span>
            <span>{selectedTimeSlot}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={prevStep} className="cancel-button">
            {t('common.back')}
          </button>
          <button type="submit" className="confirm-button" disabled={isLoading}>
            {isLoading
              ? t('common.processing')
              : t('reservation.confirmBookingButton')}
          </button>
        </div>
      </form>
    </div>
  );
  if (isTranslationsLoaded === false || isPageDataLoading) {
    return (
      <div className="reserve-page-loading-container">
        <div className="reserve-spinner-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">{t('reservation.pageLoadingText')}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="reserve-page-container">
      <header className="page-header">
        <h1 className="page-title-animate">{t('reservation.pageTitle')}</h1>
      </header>

      <div className="reservation-form-container">
        <div className="steps-indicator">
          <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>
            1. {t('reservation.room')}
          </div>
          <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>
            2. {t('bookings.date')}
          </div>
          <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>
            3. {t('bookings.time')}
          </div>
          <div className={`step-indicator ${currentStep >= 4 ? 'active' : ''}`}>
            4. {t('reservation.bookingDetails')}
          </div>
        </div>

        {currentStep === 1 && renderRoomSelection()}
        {currentStep === 2 && renderDateSelection()}
        {currentStep === 3 && renderTimeSelection()}
        {currentStep === 4 && renderBookingDetails()}
      </div>      {showEmailConfirmation && completedBooking && (
        <EmailConfirmation
          booking={completedBooking}
          user={currentUser}
          onClose={() => setShowEmailConfirmation(false)}
          onSend={handleSendEmail}
          previewOnly={false}
        />
      )}
    </div>
  );
};

export default ReservePage;
