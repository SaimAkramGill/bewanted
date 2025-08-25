import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      // Here you would call your change password API
      // const result = await apiMethods.auth.changePassword(
      //   passwordData.currentPassword, 
      //   passwordData.newPassword
      // );
      
      // For now, just simulate success
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Information
            </button>
            <button
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <h2>Profile Information</h2>
                <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ''}
                        className="form-input"
                        disabled
                      />
                      <small className="form-help">Email cannot be changed</small>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="form-input"
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                        className="form-input"
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="website">Website</label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={profileData.website}
                        onChange={handleProfileChange}
                        className="form-input"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="tab-pane">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="security-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>

                <div className="security-info">
                  <h3>Account Security</h3>
                  <div className="security-item">
                    <strong>Account Status:</strong> 
                    <span className="status-badge active">Active</span>
                  </div>
                  <div className="security-item">
                    <strong>Two-Factor Authentication:</strong> 
                    <span className="status-badge inactive">Disabled</span>
                    <button className="btn btn-secondary btn-sm">Enable</button>
                  </div>
                  <div className="security-item">
                    <strong>Login Sessions:</strong> 1 active session
                    <button className="btn btn-secondary btn-sm">Manage</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="tab-pane">
                <h2>Preferences</h2>
                <div className="preferences-form">
                  <div className="preference-group">
                    <h3>Notifications</h3>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Email notifications</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Push notifications</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>SMS notifications</span>
                    </label>
                  </div>

                  <div className="preference-group">
                    <h3>Privacy</h3>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Make profile public</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Allow search engines to index profile</span>
                    </label>
                  </div>

                  <div className="preference-group">
                    <h3>Theme</h3>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input type="radio" name="theme" value="light" defaultChecked />
                        <span>Light theme</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="theme" value="dark" />
                        <span>Dark theme</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="theme" value="auto" />
                        <span>Auto (system preference)</span>
                      </label>
                    </div>
                  </div>

                  <button className="btn btn-primary">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;