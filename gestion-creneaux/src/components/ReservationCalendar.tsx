import React, { useState, useEffect, useMemo } from 'react'; // Ensure useMemo is imported
import { getAllRooms, reserveSlots, cancelSlot } from '../services/apiService'; // Corrected path, added cancelSlot
import { RoomDTO, ReservationRequestData, User, Booking } from '../types/types'; // Corrected path. Assuming Booking is used by EmailConfirmation
import { Value } from 'react-calendar/dist/cjs/shared/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar CSS
import { TIME_SLOTS } from '../utils/helpers'; // Corrected path
import EmailConfirmation from './EmailConfirmation'; // Assuming EmailConfirmation is correctly imported
import { useAuth } from '../contexts/AuthContext';
import '../styles/components/ReservationCalendar.css';

interface ReservationCalendarProps {
  onBookingComplete?: (response: any) => void;
}

// Define GetAllRoomsResponse if not already globally available or imported from types.ts
// For clarity, if it's in types.ts as "export interface GetAllRoomsResponse { data?: RoomDTO[]; }"
// then no need to redefine. Assuming it's handled by apiService return types.

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  onBookingComplete,
}) => {
  // const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomLetter, setSelectedRoomLetter] = useState<string | null>(null); // New state for room letter
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null); // New state for room number
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [reservationResponse, setReservationResponse] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false); // New state for cancellation loading
  const [cancelError, setCancelError] = useState<string | null>(null); // New state for cancellation error

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setErrors((prev) => ({ ...prev, rooms: '' })); // Clear previous rooms error
      try {
        const responseData = await getAllRooms(); // responseData is of type GetAllRoomsResponse

        // Check if responseData itself and responseData.rooms are valid
        if (responseData && Array.isArray(responseData.rooms)) {
          setRooms(responseData.rooms);
          // If responseData.rooms is empty, the UI can handle displaying that.
        } else {
          // This handles cases where responseData is falsy, or responseData.rooms is not an array.
          setRooms([]); // Default to empty array
          // Construct a general error message
          setErrors((prev) => ({ ...prev, rooms: 'Failed to load rooms.' + ' (unexpected data format)' }));
        }
      } catch (error) {
        // Error is caught, and user sees a message via setErrors
        const errorMessage = (error instanceof Error ? error.message : String(error));
        setErrors((prev) => ({ ...prev, rooms: 'Failed to load rooms.' + ` (${errorMessage})` }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
    // No cleanup function needed as `mounted` flag is removed.
  }, []); // Keep 't' as it's used in setErrors for translations // Removed t

  // Derived values for dropdowns
  const uniqueRoomLetters = useMemo(() => {
    const letters = new Set(rooms.map(room => room.roomLetter));
    return Array.from(letters).sort();
  }, [rooms]);

  const roomNumbersForSelectedLetter = useMemo(() => {
    if (!selectedRoomLetter) return [];
    const numbers = rooms
      .filter(room => room.roomLetter === selectedRoomLetter)
      .map(room => room.roomNumber.toString()); // Ensure roomNumber is string for consistency
    // Sort numerically if possible, otherwise as strings.
    return Array.from(new Set(numbers)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [rooms, selectedRoomLetter]);

  // Effect to update selectedRoomId when letter and number are chosen
  useEffect(() => {
    if (selectedRoomLetter && selectedRoomNumber) {
      const room = rooms.find(
        r => r.roomLetter === selectedRoomLetter && r.roomNumber.toString() === selectedRoomNumber // Ensure comparison is string to string if roomNumber is number
      );
      if (room) {
        setSelectedRoomId(room.id);
        setErrors(prev => ({ ...prev, selectedRoomId: '' })); // Corrected: use empty string to clear error
      } else {
        setSelectedRoomId(null); 
      }
    } else {
      setSelectedRoomId(null); 
    }
  }, [selectedRoomLetter, selectedRoomNumber, rooms]);
  
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!selectedRoomId) {
        newErrors.selectedRoomId = 'Room selection is required';
      }
    } else if (step === 2) {
      // Date validation (Calendar ensures a date is always selected, minDate handles past)
    } else if (step === 3) { 
      if (selectedTimeSlots.length === 0) {
        newErrors.selectedTimeSlots = 'Please select at least one time slot';
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
    let newDate: Date | null = null;
    if (value instanceof Date) {
      newDate = value;
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      newDate = value[0];
    }
    if (newDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      if (newDate >= today) {
        setSelectedDate(newDate);
        setSelectedTimeSlots([]); 
        setErrors(prev => ({...prev, selectedDate: ''})); // Clear previous date error
      } else {
        setErrors(prev => ({...prev, selectedDate: "Cannot select a past date"}));
      }
    }
  };

  const handleTimeSlotToggle = (timeSlot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(timeSlot)
        ? prev.filter((ts) => ts !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const handleRoomLetterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const letter = event.target.value;
    setSelectedRoomLetter(letter || null);
    setSelectedRoomNumber(null); // Reset room number when letter changes
    // selectedRoomId will be reset by the useEffect above
  };

  const handleRoomNumberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const number = event.target.value;
    setSelectedRoomNumber(number || null);
    // selectedRoomId will be updated by the useEffect above
  };

  const getRoomNameById = (roomId: number | null) => {
    if (!roomId) return '';
    const room = rooms.find(r => r.id === roomId);
    return room ? `${room.roomLetter}${room.roomNumber}` : '';
  };

  // Prepare a partial user object for EmailConfirmation, as full User type might not be available
  // EmailConfirmation component might need to be adjusted to accept Partial<User>
  let partialUserForEmail: Partial<User> | null = null;
  if (currentUser && typeof currentUser.id === 'number' && currentUser.name && currentUser.email) {
    partialUserForEmail = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      return;
    }

    const currentUserName = currentUser?.name;
    const currentUserId = currentUser?.id;

    if (!currentUserName || typeof currentUserId !== 'number' || !selectedRoomId || selectedTimeSlots.length === 0) {
      setErrors({ form: 'Missing required information. Ensure you are logged in and all selections are made.' });
      return;
    }

    setIsLoading(true);
    setCancelError(null); // Clear any previous cancel errors

    const reservationRequests: ReservationRequestData[] = selectedTimeSlots.map(slot => {
      const slotDate = new Date(selectedDate);
      const [hours, minutes] = slot.split(':').map(Number);
      slotDate.setHours(hours, minutes, 0, 0);
      return {
        startTime: slotDate.toISOString(),
        roomId: selectedRoomId,
        userId: currentUserId,
      };
    });

    try {
      const response = await reserveSlots(reservationRequests, currentUserName);
      setReservationResponse(response);
      setSelectedRoomId(null);
      setSelectedRoomLetter(null); // Reset room letter
      setSelectedRoomNumber(null); // Reset room number
      setSelectedTimeSlots([]);
      setCurrentStep(1);
      if (onBookingComplete) {
        onBookingComplete(response);
      }
      if (partialUserForEmail) {
        setShowEmailConfirmation(true); 
      } else {
        alert('Reservation successful! (User details for email not fully available)');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking. Please try again.';
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = () => {
    setTimeout(() => {
      setShowEmailConfirmation(false);
      alert('Email sent successfully!');
    }, 1000);
  };

  const handleCancelBooking = async () => {
    if (!reservationResponse?.createdReservations || reservationResponse.createdReservations.length === 0) {
      // This case should ideally not happen if EmailConfirmation is shown only after successful reservation
      alert('No reservation details found to cancel.');
      setShowEmailConfirmation(false);
      return;
    }

    setIsCancelling(true);
    setCancelError(null);

    try {
      // Assuming createdReservations is an array of objects with an 'id' property
      const createdReservations: { id: number }[] = reservationResponse.createdReservations;
      
      const cancellationPromises = createdReservations.map(reservation => 
        cancelSlot(reservation.id)
      );
      
      await Promise.all(cancellationPromises);

      alert('Reservation cancelled successfully.');
      setShowEmailConfirmation(false);
      setReservationResponse(null); // Clear the stored reservation response
      // Optionally, reset other states or trigger a data refresh if needed
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel reservation.';
      setCancelError(errorMessage);
      alert('Failed to cancel reservation.' + `: ${errorMessage}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const renderRoomSelection = () => (
    <div className="form-step">
      <h2>Select a Room</h2>
      {isLoading && rooms.length === 0 && <p>Loading...</p>} 
      {errors.rooms && <div className="error-message">{errors.rooms}</div>}

      <div className="form-group">
        <label htmlFor="roomLetterSelect">Room Letter</label>
        <select
          id="roomLetterSelect"
          value={selectedRoomLetter || ''}
          onChange={handleRoomLetterChange}
          disabled={(isLoading && rooms.length === 0) || rooms.length === 0}
          className="form-control"
        >
          <option value="">Select Letter</option>
          {uniqueRoomLetters.map(letter => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="roomNumberSelect">Room Number</label>
        <select
          id="roomNumberSelect"
          value={selectedRoomNumber || ''}
          onChange={handleRoomNumberChange}
          disabled={!selectedRoomLetter || roomNumbersForSelectedLetter.length === 0}
          className="form-control"
        >
          <option value="">Select Number</option>
          {roomNumbersForSelectedLetter.map(number => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>
      </div>
      
      {errors.selectedRoomId && ( // This error is set in validateStep if selectedRoomId is null
        <div className="error-message">{errors.selectedRoomId}</div>
      )}
      <div className="step-actions">
        <button 
          type="button" 
          onClick={nextStep} 
          className="confirm-button" 
          disabled={!selectedRoomId || (isLoading && rooms.length === 0)}
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderDateSelection = () => (
    <div className="form-step">
      <div className="step-header">
        <button className="back-button" onClick={prevStep}>← Back</button>
        <h2>Date</h2>
      </div>
      {errors.selectedDate && <div className="error-message">{errors.selectedDate}</div>}
      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          minDate={new Date()} 
          className="react-calendar"
        />
      </div>
      <div className="step-actions">
        <button type="button" onClick={nextStep} className="confirm-button">Next</button>
      </div>
    </div>
  );

  const renderTimeSelection = () => (
    <div className="form-step">
      <div className="step-header">
        <button className="back-button" onClick={prevStep}>← Back</button>
        <h2>Time for {selectedDate.toLocaleDateString()}</h2>
      </div>
      <div className="time-options-grid">
        {TIME_SLOTS.map((timeSlot) => (
          <div
            key={timeSlot}
            className={`time-option ${selectedTimeSlots.includes(timeSlot) ? 'selected' : ''}`}
            onClick={() => handleTimeSlotToggle(timeSlot)}
          >
            {timeSlot} - {String(parseInt(timeSlot.split(':')[0]) + 1).padStart(2, '0')}:00
          </div>
        ))}
      </div>
      {errors.selectedTimeSlots && (
        <div className="error-message">{errors.selectedTimeSlots}</div>
      )}
      <form onSubmit={handleSubmit} className="booking-form-final-step">
        {errors.form && <div className="error-message">{errors.form}</div>}
        {cancelError && <div className="error-message">{cancelError}</div>} {/* Display cancellation error */}
        <div className="booking-summary">
            <h3>Reservation Summary</h3>
            <div className="summary-item">
                <span>Room:</span>
                <span>{getRoomNameById(selectedRoomId)}</span>
            </div>
            <div className="summary-item">
                <span>Date:</span>
                <span>{selectedDate.toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
                <span>Time Slots:</span>
                <span>{selectedTimeSlots.join(', ')}</span>
            </div>
        </div>
        <div className="step-actions">
          <button type="submit" className="confirm-button" disabled={isLoading || selectedTimeSlots.length === 0 || isCancelling}>
            {isLoading ? 'Processing...' : 'Confirm Reservation'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="reservation-calendar">
      <div className="reservation-form-container">
        <div className="steps-indicator">
          <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>1. Select a Room</div>
          <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>2. Date</div>
          <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>3. Time & Confirm</div>
        </div>
        {currentStep === 1 && renderRoomSelection()}
        {currentStep === 2 && renderDateSelection()}
        {currentStep === 3 && renderTimeSelection()}
      </div>

      {showEmailConfirmation && reservationResponse && partialUserForEmail && ( // selectedRoomId check removed as it's part of booking construction
        <EmailConfirmation
          booking={{
            // This mock booking object needs to satisfy the Booking type as much as possible
            // Fields like password, createdAt, updatedAt are problematic if strictly required by Booking type
            // and not available from partialUserForEmail or reservationResponse.
            // It's best if EmailConfirmation can handle a more flexible booking object or Partial<Booking>.
            id: reservationResponse.createdReservations?.[0]?.id || Date.now(), // Main ID for display
            userId: partialUserForEmail.id as number, // id is checked in partialUserForEmail
            title: `Reservation for ${getRoomNameById(selectedRoomId || reservationResponse.createdReservations?.[0]?.roomId)}`, // Use selectedRoomId or from response
            userName: partialUserForEmail.name as string, // name is checked
            userEmail: partialUserForEmail.email as string, // email is checked
            date: selectedDate.toISOString().split('T')[0],
            startTime: selectedTimeSlots[0] || reservationResponse.createdReservations?.[0]?.startTime?.substring(11,16) || 'N/A',
            endTime: '', // Example, adjust as needed
            spaceName: getRoomNameById(selectedRoomId || reservationResponse.createdReservations?.[0]?.roomId) || '',
            status: 'confirmed', // This status is pre-cancellation
            room: { 
              id: selectedRoomId || reservationResponse.createdReservations?.[0]?.roomId, 
              name: getRoomNameById(selectedRoomId || reservationResponse.createdReservations?.[0]?.roomId) || '' 
            },
            user: { 
              id: partialUserForEmail.id as number,
              name: partialUserForEmail.name as string,
              email: partialUserForEmail.email as string,
              password: '', 
              createdAt: new Date(), 
              updatedAt: new Date(),
            } as User, 
            description: '', 
          } as Booking} 
          user={partialUserForEmail as Partial<User>} 
          onClose={() => setShowEmailConfirmation(false)}
          onSend={handleSendEmail}
          onCancel={handleCancelBooking} // Pass the cancel handler
          previewOnly={false}
          // Pass isCancelling to disable buttons in EmailConfirmation if needed
          // isProcessingCancellation={isCancelling} 
        />
      )}
    </div>
  );
};

export default ReservationCalendar;
