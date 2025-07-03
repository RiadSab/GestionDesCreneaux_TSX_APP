import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Navbar from './Navbar';
import { Booking } from '../types/types';
import ReservationCalendar from './ReservationCalendar';
import MyBookings from './MyBookings';
import Dashboard from './Dashboard';
import AvailableSlots from './AvailableSlots';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import EditBookingForm from './EditBookingForm';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Create a wrapper component to handle transitions
const PageTransitionWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Set loading state when location changes
    setIsPageLoading(true);

    // Small delay to ensure component has time to prepare
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location]);

  if (isPageLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}; 

// InnerApp component to use AuthContext
const InnerApp = () => {
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const handleUpdateBooking = (updatedBooking: Booking) => {
    console.log('Updating booking:', updatedBooking);

    setBookings((prevBookings) => {
      const exists = prevBookings.some((b) => b.id === updatedBooking.id);

      let updatedBookings;
      if (exists) {
        updatedBookings = prevBookings.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking,
        );
      } else {
        updatedBookings = [...prevBookings, updatedBooking];
      }

      console.log('Updated bookings array:', updatedBookings);
      return updatedBookings;
    });
  };

  // Function to handle page transitions
  const handlePageTransition = (
    Component: React.ComponentType<any>,
    props: any,
  ) => {
    return (
      <PageTransitionWrapper>
        <Component {...props} />
      </PageTransitionWrapper>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />; // Show loading spinner while auth state is loading
  }

  return (
    <div className="App">
      <Router>
        {isAuthenticated && user && <Navbar userName={user.name} onLogout={logout} />}

        <main className="content">
          <Routes>            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  handlePageTransition(LoginPage, {})
                )
              }
            />
            <Route
              path="/signup"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  handlePageTransition(SignupPage, {})
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated && user ? (
                  handlePageTransition(Dashboard, { currentUser: user })
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/bookings"
              element={
                isAuthenticated && user ? (
                  handlePageTransition(MyBookings, {
                    currentUser: user,
                    bookings: bookings,
                    onModifyBooking: handleUpdateBooking,
                  })
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/timeslots"
              element={
                isAuthenticated && user ? (
                  handlePageTransition(AvailableSlots, { currentUser: user })
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated && user ? (
                  handlePageTransition(ProfilePage, { currentUser: user })
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/settings"
              element={
                isAuthenticated && user ? (
                  handlePageTransition(SettingsPage, {
                    currentUser: user,
                    onUpdateUser: updateUser, // Use updateUser from AuthContext
                  })
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/reserve"
              element={
                isAuthenticated && user ? (
                  handlePageTransition(ReservationCalendar, {
                    currentUser: user,
                    onBookingComplete: (booking: Booking) =>
                      console.log('Booking completed:', booking),
                  })
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/edit-booking/:bookingId"
              element={
                user ? (
                  handlePageTransition(EditBookingForm, {
                    onUpdateBooking: handleUpdateBooking,
                  })
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
            />
          </Routes>
        </main>
      </Router>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
