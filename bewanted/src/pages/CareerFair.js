import React, { useState, useEffect } from 'react';
import '../App.css'; // Import the main CSS file from parent directory

const CareerFairForm = () => {
  // API helper functions
  const apiCall = async (endpoint, options = {}) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const url = `${baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    fieldOfStudy: '',
    motivation: ''
  });

  // Available data from backend
  const [fieldsOfStudy] = useState([
    'Computer Science', 'Software Engineering', 'Data Science', 'Cybersecurity',
    'Information Technology', 'Business Administration', 'Marketing', 'Finance',
    'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering',
    'Biomedical Engineering', 'Medicine', 'Nursing', 'Psychology', 'Education',
    'Law', 'Other'
  ]);

  const [companies, setCompanies] = useState([]);
  const [availability, setAvailability] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Booking state
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({});
  const [usedTimeSlots, setUsedTimeSlots] = useState(new Set());
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Generate available dates (next 30 days, excluding weekends)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    let currentDate = new Date(today);
    
    while (dates.length < 20) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  const [availableDates] = useState(generateAvailableDates());

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiCall('/career-fair/companies');
        if (response.success) {
          setCompanies(response.data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setErrors({ general: 'Failed to load companies. Please refresh the page.' });
      }
    };

    fetchCompanies();
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return;

      try {
        setLoading(true);
        const response = await apiCall(`/career-fair/available-slots/${selectedDate}`);
        if (response.success) {
          setAvailability(response.data.availability);
          setTimeSlots(response.data.timeSlots);
          
          // Reset selections when date changes
          setBookedSlots({});
          setUsedTimeSlots(new Set());
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        setErrors({ general: 'Failed to load available time slots.' });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate]);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()\x20]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }
    if (!formData.fieldOfStudy) newErrors.fieldOfStudy = 'Field of study is required';
    if (!formData.motivation.trim()) newErrors.motivation = 'Motivation is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle company selection
  const handleCompanySelect = (company) => {
    setSelectedCompanies(prev => {
      const isSelected = prev.find(c => c._id === company._id);
      if (isSelected) {
        // Remove company and its booking
        const newBookedSlots = { ...bookedSlots };
        if (newBookedSlots[company._id]) {
          const timeSlot = newBookedSlots[company._id][selectedDate];
          if (timeSlot) {
            setUsedTimeSlots(prev => {
              const newSet = new Set(prev);
              newSet.delete(timeSlot);
              return newSet;
            });
          }
          delete newBookedSlots[company._id];
          setBookedSlots(newBookedSlots);
        }
        return prev.filter(c => c._id !== company._id);
      } else {
        return [...prev, company];
      }
    });
  };

  // Handle time slot booking
  const handleTimeSlotSelect = (companyId, timeSlot) => {
    // Check if this time slot is available for this company
    if (!availability[companyId] || !availability[companyId][timeSlot]) {
      alert('This time slot is not available for this company.');
      return;
    }

    // Check if this time slot is already used by student
    if (usedTimeSlots.has(timeSlot)) {
      alert('You already have an appointment at this time. Please select a different time.');
      return;
    }

    // Update booked slots
    setBookedSlots(prev => {
      const newBookedSlots = { ...prev };
      
      // Remove old time slot from used slots if company had a previous booking
      if (newBookedSlots[companyId] && newBookedSlots[companyId][selectedDate]) {
        const oldTimeSlot = newBookedSlots[companyId][selectedDate];
        setUsedTimeSlots(prevUsed => {
          const newSet = new Set(prevUsed);
          newSet.delete(oldTimeSlot);
          return newSet;
        });
      }
      
      // Add new booking
      if (!newBookedSlots[companyId]) {
        newBookedSlots[companyId] = {};
      }
      newBookedSlots[companyId][selectedDate] = timeSlot;
      
      return newBookedSlots;
    });

    // Add new time slot to used slots
    setUsedTimeSlots(prev => new Set([...prev, timeSlot]));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setCurrentStep(2);
    }
  };

  // Handle final booking submission
  const handleBookingSubmit = async () => {
    setLoading(true);
    setSubmitStatus(null);

    try {
      // Prepare booking data
      const appointments = Object.entries(bookedSlots).map(([companyId, dates]) => ({
        companyId,
        companyName: companies.find(c => c._id === companyId)?.name,
        appointments: Object.entries(dates).map(([date, timeSlot]) => ({
          date,
          timeSlot
        }))
      }));

      const bookingData = {
        studentInfo: formData,
        appointments
      };

      const response = await apiCall('/career-fair/register', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (response.success) {
        setSubmitStatus({
          type: 'success',
          message: response.message,
          data: response.data
        });

        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            fieldOfStudy: '',
            motivation: ''
          });
          setSelectedCompanies([]);
          setBookedSlots({});
          setUsedTimeSlots(new Set());
          setCurrentStep(1);
          setSelectedDate('');
          setSubmitStatus(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to submit booking. Please try again.',
        errors: error.errors
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Success screen
  if (submitStatus?.type === 'success') {
    return (
      <div className="container">
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ color: '#28a745', marginBottom: '20px' }}>Registration Successful!</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
            {submitStatus.message}
          </p>
          
          <div className="dashboard-card" style={{ textAlign: 'left', marginBottom: '30px' }}>
            <h3>Your Appointments:</h3>
            {submitStatus.data?.appointments?.map((apt, index) => (
              <div key={index} className="activity-item" style={{ marginBottom: '10px' }}>
                <div className="activity-icon" style={{ fontSize: '1.2rem' }}>🏢</div>
                <div>
                  <div className="activity-title">{apt.company.name}</div>
                  <div className="activity-time">📅 {formatDate(apt.date)} at {apt.timeSlot}</div>
                </div>
              </div>
            ))}
          </div>

          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            You will receive a confirmation email shortly. This page will redirect automatically in a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Progress Indicator */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px' }}>
          <span className={currentStep >= 1 ? 'step-label active' : 'step-label'}>
            Student Information
          </span>
          <span className={currentStep >= 2 ? 'step-label active' : 'step-label'}>
            Company Appointments
          </span>
        </div>
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="error-message">
          {errors.general}
        </div>
      )}

      {submitStatus?.type === 'error' && (
        <div className="error-message">
          <strong>Error:</strong> {submitStatus.message}
          {submitStatus.errors && (
            <ul style={{ marginTop: '10px', marginBottom: '0' }}>
              {submitStatus.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Step 1: Student Information Form */}
      {currentStep === 1 && (
        <div className="auth-card">
          <div className="auth-header">
            <h1>Career Fair Registration</h1>
            <p>Join our career fair and connect with top companies</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                />
                {errors.firstName && (
                  <span className="field-error">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                />
                {errors.lastName && (
                  <span className="field-error">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                />
                {errors.phoneNumber && (
                  <span className="field-error">{errors.phoneNumber}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Field of Study *</label>
              <select
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleInputChange}
                className={`form-input ${errors.fieldOfStudy ? 'error' : ''}`}
              >
                <option value="">Select your field of study</option>
                {fieldsOfStudy.map((field, index) => (
                  <option key={index} value={field}>{field}</option>
                ))}
              </select>
              {errors.fieldOfStudy && (
                <span className="field-error">{errors.fieldOfStudy}</span>
              )}
            </div>

            <div className="form-group">
              <label>Why do you want to join our career fair? *</label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                rows="4"
                placeholder="Tell us about your career goals and what you hope to achieve..."
                className={`form-input ${errors.motivation ? 'error' : ''}`}
              />
              {errors.motivation && (
                <span className="field-error">{errors.motivation}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              Continue to Company Selection
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Company Selection and Appointment Booking */}
      {currentStep === 2 && (
        <div className="auth-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div className="auth-header" style={{ textAlign: 'left', marginBottom: '0' }}>
              <h2>Select Companies & Book Appointments</h2>
              <p>Choose companies you're interested in and schedule your appointments</p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="btn btn-secondary"
            >
              Back to Form
            </button>
          </div>

          {/* Date Selection */}
          <div className="form-group">
            <label>Select Date *</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
              style={{ maxWidth: '400px' }}
            >
              <option value="">Choose a date</option>
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>

          {selectedDate && (
            <>
              {/* Loading Indicator */}
              {loading && (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <div className="loading-text">Loading available time slots...</div>
                </div>
              )}

              {/* Company Selection */}
              {!loading && companies.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ marginBottom: '20px' }}>Available Companies</h3>
                  <div className="features-grid">
                    {companies.map(company => {
                      const isSelected = selectedCompanies.find(c => c._id === company._id);
                      return (
                        <div
                          key={company._id}
                          onClick={() => handleCompanySelect(company)}
                          className={`feature-card ${isSelected ? 'selected' : ''}`}
                          style={{
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #f29b20' : '1px solid #e0e0e0',
                            backgroundColor: isSelected ? 'rgba(242, 155, 32, 0.05)' : '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0 }}>{company.name}</h4>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#f29b20' : 'transparent',
                              border: '2px solid #f29b20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isSelected && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                            </div>
                          </div>
                          <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                            Industry: {company.industry}
                          </p>
                          <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>
                            <strong>Positions:</strong> {company.positions.join(', ')}
                          </p>
                          {company.description && (
                            <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '0.85rem' }}>
                              {company.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Time Slot Booking for Selected Companies */}
              {selectedCompanies.length > 0 && timeSlots.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ marginBottom: '20px' }}>
                    Book Time Slots for {formatDate(selectedDate)}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {selectedCompanies.map(company => (
                      <div key={company._id} className="dashboard-card">
                        <h4 style={{ marginBottom: '15px' }}>{company.name}</h4>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                          {timeSlots.map(timeSlot => {
                            const isBooked = bookedSlots[company._id]?.[selectedDate] === timeSlot;
                            const isAvailableForCompany = availability[company._id]?.[timeSlot];
                            const isUsedByStudent = usedTimeSlots.has(timeSlot) && !isBooked;
                            const isDisabled = !isAvailableForCompany || isUsedByStudent;
                            return (
                              <button
                                key={timeSlot}
                                onClick={() => !isDisabled && handleTimeSlotSelect(company._id, timeSlot)}
                                disabled={isDisabled}
                                className={`btn btn-sm ${isBooked ? 'btn-success' : isDisabled ? 'btn-danger' : 'btn-secondary'}`}
                                style={{
                                  opacity: isDisabled ? 0.6 : 1,
                                  fontSize: '0.8rem',
                                  padding: '8px 4px'
                                }}
                              >
                                {timeSlot}
                                {isBooked && ' ✓'}
                                {isDisabled && !isBooked && ' ✗'}
                              </button>
                            );
                          })}
                        </div>
                        {bookedSlots[company._id]?.[selectedDate] && (
                          <p style={{ 
                            marginTop: '10px', 
                            color: '#28a745', 
                            fontWeight: '500',
                            fontSize: '0.9rem'
                          }}>
                            ✓ Booked: {bookedSlots[company._id][selectedDate]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary and Submit */}
              {Object.keys(bookedSlots).length > 0 && (
                <div className="dashboard-card" style={{ backgroundColor: 'rgba(242, 155, 32, 0.1)', marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '15px' }}>Appointment Summary</h3>
                  <div className="profile-info">
                    <div className="profile-item">
                      <strong>Student:</strong>
                      <span>{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="profile-item">
                      <strong>Email:</strong>
                      <span>{formData.email}</span>
                    </div>
                    <div className="profile-item">
                      <strong>Date:</strong>
                      <span>{formatDate(selectedDate)}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <strong>Scheduled Appointments:</strong>
                    <div className="activity-list" style={{ marginTop: '10px' }}>
                      {Object.entries(bookedSlots).map(([companyId, dates]) => {
                        const company = companies.find(c => c._id === companyId);
                        const timeSlot = dates[selectedDate];
                        return timeSlot ? (
                          <div key={companyId} className="activity-item">
                            <div className="activity-icon">🏢</div>
                            <div>
                              <div className="activity-title">{company?.name}</div>
                              <div className="activity-time">{timeSlot}</div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleBookingSubmit}
                  disabled={Object.keys(bookedSlots).length === 0 || loading}
                  className={`btn ${Object.keys(bookedSlots).length > 0 && !loading ? 'btn-primary' : ''}`}
                  style={{
                    padding: '16px 32px',
                    fontSize: '1.1rem',
                    backgroundColor: Object.keys(bookedSlots).length > 0 && !loading ? '#28a745' : '#6c757d',
                    cursor: Object.keys(bookedSlots).length > 0 && !loading ? 'pointer' : 'not-allowed'
                  }}
                >
                  {loading ? 'Submitting...' :
                   Object.keys(bookedSlots).length > 0 
                    ? `Confirm ${Object.keys(bookedSlots).length} Appointment${Object.keys(bookedSlots).length > 1 ? 's' : ''}` 
                    : 'Select at least one time slot'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions Panel */}
      <div className="about-section" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontSize: '1.2rem' }}>ℹ️</span>
          How to Use This Form
        </h3>
        <div className="tech-grid">
          <div className="tech-item">
            <h4 style={{ color: '#f29b20', marginBottom: '8px' }}>Step 1: Personal Information</h4>
            <ul style={{ paddingLeft: '20px', textAlign: 'left' }}>
              <li>Fill in your personal details</li>
              <li>Select your field of study</li>
              <li>Describe your motivation</li>
            </ul>
          </div>
          <div className="tech-item">
            <h4 style={{ color: '#f29b20', marginBottom: '8px' }}>Step 2: Company Selection</h4>
            <ul style={{ paddingLeft: '20px', textAlign: 'left' }}>
              <li>Choose your preferred date</li>
              <li>Select companies you want to meet</li>
              <li>Book time slots for each company</li>
            </ul>
          </div>
          <div className="tech-item">
            <h4 style={{ color: '#f29b20', marginBottom: '8px' }}>Important Rules</h4>
            <ul style={{ paddingLeft: '20px', textAlign: 'left' }}>
              <li>Each time slot is 15 minutes</li>
              <li>You can't book overlapping times</li>
              <li>One appointment per company per day</li>
              <li>Real-time availability checking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerFairForm;