import React, { useState, useEffect } from 'react';
import { User } from '../types/types';
import '../styles/components/ProfilePage.css';

interface ProfilePageProps {
  currentUser: Partial<User>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser }) => {
  const [activityStats, setActivityStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
  });

  useEffect(() => {
    fetchUserActivity();
  }, [currentUser]);

  const fetchUserActivity = async () => {
    // Simulated API call to get user activity statistics
    await new Promise((resolve) => setTimeout(resolve, 500));

    setActivityStats({
      totalBookings: 12,
      upcomingBookings: 2,
      completedBookings: 10,
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-image-section">
            <div className="profile-image">
              {currentUser.name
                ? currentUser.name.charAt(0).toUpperCase()
                : 'U'}
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{currentUser.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{currentUser.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Account Created:</span>
                <span className="info-value">
                  {currentUser.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">User ID:</span>
                <span className="info-value">{currentUser.id || 'N/A'}</span>
              </div>
              <div className="info-note">
                <p>
                  To change your account details, please visit the{' '}
                  <a href="/settings">Settings page</a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="activity-stats">
          <h2>Activity Summary</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{activityStats.totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{activityStats.upcomingBookings}</div>
              <div className="stat-label">Upcoming</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {activityStats.completedBookings}
              </div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
