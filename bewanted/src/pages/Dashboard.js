import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiMethods } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In your client/src/pages/Dashboard.js file, update the useEffect:

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // If user is admin, fetch user stats
      if (user?.role === 'admin') {
        const response = await apiMethods.users.getStats();
        setStats(response.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [user?.role]); // Add user?.role as dependency

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="dashboard-content">
          {/* User Info Card */}
          <div className="dashboard-card">
            <h2>Your Profile</h2>
            <div className="profile-info">
              <div className="profile-item">
                <strong>Name:</strong> {user?.name}
              </div>
              <div className="profile-item">
                <strong>Email:</strong> {user?.email}
              </div>
              <div className="profile-item">
                <strong>Role:</strong> 
                <span className={`role-badge ${user?.role}`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
              <div className="profile-item">
                <strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}
              </div>
              <div className="profile-item">
                <strong>Status:</strong> 
                <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button 
                className="action-btn"
                onClick={() => window.location.href = '/profile'}
              >
                <span className="action-icon">👤</span>
                Edit Profile
              </button>
              
              <button 
                className="action-btn"
                onClick={() => window.location.href = '/settings'}
              >
                <span className="action-icon">⚙️</span>
                Settings
              </button>
              
              <button 
                className="action-btn"
                onClick={() => window.location.href = '/help'}
              >
                <span className="action-icon">❓</span>
                Help & Support
              </button>
            </div>
          </div>

          {/* Admin Stats (if user is admin) */}
          {user?.role === 'admin' && stats && (
            <div className="dashboard-card">
              <h2>Admin Statistics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.activeUsers}</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.adminUsers}</div>
                  <div className="stat-label">Admin Users</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.recentUsers}</div>
                  <div className="stat-label">New This Month</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">🔐</div>
                <div className="activity-content">
                  <div className="activity-title">Account Created</div>
                  <div className="activity-time">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">👋</div>
                <div className="activity-content">
                  <div className="activity-title">Last Login</div>
                  <div className="activity-time">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="dashboard-card">
            <h2>System Information</h2>
            <div className="system-info">
              <div className="info-item">
                <strong>Application:</strong> beWanted v1.0.0
              </div>
              <div className="info-item">
                <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
              </div>
              <div className="info-item">
                <strong>Server Status:</strong> 
                <span className="status-badge active">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;