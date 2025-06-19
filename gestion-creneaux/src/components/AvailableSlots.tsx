import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeSlot, User } from '../types/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Value } from 'react-calendar/dist/cjs/shared/types';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/components/AvailableSlots.css';

interface AvailableSlotsProps {
  currentUser: Partial<User>;
}

const ROOM_TYPE_KEYS = {
  ALL: 'slots.allRooms',
  REGULAR: 'slots.regularRooms',
  AMPHITHEATERS: 'slots.amphitheaters',
};

const ROOM_TYPE_OPTIONS_AS_KEYS = [
  ROOM_TYPE_KEYS.ALL,
  ROOM_TYPE_KEYS.REGULAR,
  ROOM_TYPE_KEYS.AMPHITHEATERS,
];

const AvailableSlots: React.FC<AvailableSlotsProps> = ({ currentUser }) => {
  const { t, language, isTranslationsLoaded } = useLanguage(); // Use the hook
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomType, setSelectedRoomType] = useState(ROOM_TYPE_KEYS.ALL); // Use translation key
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const navigate = useNavigate();

  // Room types for filtering - moved inside component to use translations
  const ROOM_TYPES = [
    'All Rooms',
    'Regular Rooms',
    'Amphitheaters',
  ];

  useEffect(() => {
    fetchTimeSlots(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    filterSlots();
  }, [timeSlots, selectedRoomType]); // Re-filter when language changes // Removed language

  const fetchTimeSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      const formattedDate = date.toISOString().split('T')[0];
      const mockTimeSlots: TimeSlot[] = [];
      // Generate slots for regular rooms (1A to 12D)
      for (let num = 1; num <= 12; num++) {
        for (let letter of ['A', 'B', 'C', 'D']) {
          if (Math.random() > 0.3) {
            const roomName = `${num}${letter}`;
            const slotCount = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < slotCount; i++) {
              const startHour = 8 + Math.floor(Math.random() * 8);
              const startTime = `${startHour.toString().padStart(2, '0')}:00`;
              const endTime = `${(startHour + 1)
                .toString()
                .padStart(2, '0')}:00`;
              mockTimeSlots.push({
                id: mockTimeSlots.length + 1,
                date: formattedDate,
                startTime,
                endTime,
                isAvailable: Math.random() > 0.2,
                spaceName: roomName,
              });
            }
          }
        }
      }
      // Generate slots for amphitheaters
      for (let amphi of ['Amphi 1', 'Amphi 2', 'Amphi Centrale']) {
        for (let i = 0; i < 4; i++) {
          const startHour = 8 + Math.floor(Math.random() * 8);
          const startTime = `${startHour.toString().padStart(2, '0')}:00`;
          const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
          mockTimeSlots.push({
            id: mockTimeSlots.length + 1,
            date: formattedDate,
            startTime,
            endTime,
            isAvailable: Math.random() > 0.3,
            spaceName: amphi,
          });
        }
      }
      setTimeSlots(mockTimeSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSlots = () => {
    let filtered = [...timeSlots];

    // Filter by room type
    if (selectedRoomType === 'Regular Rooms') {
      filtered = filtered.filter((slot) => !slot.spaceName.includes('Amphi'));
    } else if (selectedRoomType === 'Amphitheaters') {
      filtered = filtered.filter((slot) => slot.spaceName.includes('Amphi'));
    }
    filtered = filtered.filter((slot) => slot.isAvailable);
    filtered.sort((a, b) => {
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return a.spaceName.localeCompare(b.spaceName);
    });
    setFilteredSlots(filtered);
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

  const handleBookSlot = (slot: TimeSlot) => {
    navigate('/reserve', {
      state: {
        preselectedRoom: slot.spaceName,
        preselectedDate: slot.date,
        preselectedTime: `${slot.startTime} - ${slot.endTime}`,
      },
    });
  };

  const groupSlotsByTime = () => {
    const grouped: { [key: string]: TimeSlot[] } = {};
    filteredSlots.forEach((slot) => {
      const timeKey = `${slot.startTime} - ${slot.endTime}`;
      if (!grouped[timeKey]) {
        grouped[timeKey] = [];
      }
      grouped[timeKey].push(slot);
    });
    return grouped;
  };

  const renderCalendarView = () => {
    const groupedSlots = groupSlotsByTime();
    return (
      <div className="calendar-view">
        <div className="time-slots-grid">
          {Object.entries(groupedSlots).map(([timeRange, slots]) => (
            <div key={timeRange} className="time-group">
              <div className="time-header">{timeRange}</div>
              <div className="rooms-grid">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="room-slot"
                    onClick={() => handleBookSlot(slot)}
                  >
                    <div className="room-name">{slot.spaceName}</div>
                    <button className="book-button">Book</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="list-view">
        {filteredSlots.length === 0 ? (
          <div className="empty-message">No available slots found for the selected date and filters.</div>
        ) : (
          <table className="slots-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.map((slot) => (
                <tr key={slot.id}>
                  <td>{slot.spaceName}</td>
                  <td>
                    {slot.startTime} - {slot.endTime}
                  </td>
                  <td>
                    <button
                      className="book-button-small"
                      onClick={() => handleBookSlot(slot)}
                    >
                      Book
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Add a translate function that uses t
  const translate = (key: string): string => {
    return t(key);
  }

  // Loading state for when translations are not ready
  if (!isTranslationsLoaded) {
    return (
      <div className="my-bookings-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{translate('app.loading')}</p>
        </div>
      </div>
    );
  }

  // Loading state for when fetching slots data and no slots are yet available
  if (isLoading && filteredSlots.length === 0 && timeSlots.length === 0) {
    return (
      <div className="my-bookings-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{translate('app.loadingBookings')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="available-slots-container">
      <header className="page-header">
        <h1>{translate('slots.availableSlots')}</h1>
        <p className="subtitle">{translate('slots.findAndBook')}</p>
      </header>

      <div className="controls-container">
        <div className="date-selector">
          <label>{translate('slots.selectDate')}</label>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={new Date()}
            className="date-picker"
            locale={language}
          />
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="roomType">{translate('slots.roomType')}</label>
            <select
              id="roomType"
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
            >
              {ROOM_TYPE_OPTIONS_AS_KEYS.map((key) => (
                <option key={key} value={key}>
                  {translate(key)}
                </option>
              ))}
            </select>
          </div>

          <div className="view-toggles">
            <button
              className={`view-toggle ${
                viewType === 'calendar' ? 'active' : ''
              }`}
              onClick={() => setViewType('calendar')}
            >
              Calendar View
            </button>
            <button
              className={`view-toggle ${viewType === 'list' ? 'active' : ''}`}
              onClick={() => setViewType('list')}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      <div className="slots-display">
        <h2>
          Available Slots for{' '}
          {selectedDate.toLocaleDateString(
            'en-US', // Hardcode to en-US
            { day: 'numeric', month: 'numeric', year: 'numeric' },
          )}
        </h2>

        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading available slots...</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="no-slots-message">
            <p>No available slots found for the selected date and filters.</p>
            <p>Try selecting a different date or room type.</p>
          </div>
        ) : viewType === 'calendar' ? (
          renderCalendarView()
        ) : (
          renderListView()
        )}
      </div>
    </div>
  );
};

export default AvailableSlots;
