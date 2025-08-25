import React, { useState, useEffect } from 'react';

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
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
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
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ color: '#28a745', marginBottom: '20px' }}>Registration Successful!</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#6c757d' }}>
            {submitStatus.message}
          </p>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <h3>Your Appointments:</h3>
            {submitStatus.data?.appointments?.map((apt, index) => (
              <div key={index} style={{ 
                marginBottom: '10px', 
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <strong>{apt.company.name}</strong><br />
                📅 {formatDate(apt.date)} at {apt.timeSlot}
              </div>
            ))}
          </div>

          <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
            You will receive a confirmation email shortly. This page will redirect automatically in a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Progress Indicator */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: currentStep >= 1 ? '#007bff' : '#e9ecef',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>1</div>
          <div style={{ 
            width: '100px', 
            height: '2px', 
            backgroundColor: currentStep >= 2 ? '#007bff' : '#e9ecef',
            margin: '0 10px'
          }}></div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: currentStep >= 2 ? '#007bff' : '#e9ecef',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>2</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px' }}>
          <span style={{ color: currentStep >= 1 ? '#007bff' : '#6c757d', fontWeight: '500' }}>
            Student Information
          </span>
          <span style={{ color: currentStep >= 2 ? '#007bff' : '#6c757d', fontWeight: '500' }}>
            Company Appointments
          </span>
        </div>
      </div>

      {/* Error Display */}
      {errors.general && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {errors.general}
        </div>
      )}

      {submitStatus?.type === 'error' && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
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
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '10px', 
            color: '#333',
            fontSize: '2.5rem'
          }}>
            Career Fair Registration
          </h1>
          <p style={{ 
            textAlign: 'center', 
            marginBottom: '30px', 
            color: '#6c757d',
            fontSize: '1.1rem'
          }}>
            Join our career fair and connect with top companies
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.firstName ? '2px solid #dc3545' : '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = errors.firstName ? '#dc3545' : '#e9ecef'}
                />
                {errors.firstName && (
                  <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.lastName ? '2px solid #dc3545' : '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = errors.lastName ? '#dc3545' : '#e9ecef'}
                />
                {errors.lastName && (
                  <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.email ? '2px solid #dc3545' : '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = errors.email ? '#dc3545' : '#e9ecef'}
                />
                {errors.email && (
                  <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.phoneNumber ? '2px solid #dc3545' : '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = errors.phoneNumber ? '#dc3545' : '#e9ecef'}
                />
                {errors.phoneNumber && (
                  <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                    {errors.phoneNumber}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                Field of Study *
              </label>
              <select
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.fieldOfStudy ? '2px solid #dc3545' : '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = errors.fieldOfStudy ? '#dc3545' : '#e9ecef'}
              >
                <option value="">Select your field of study</option>
                {fieldsOfStudy.map((field, index) => (
                  <option key={index} value={field}>{field}</option>
                ))}
              </select>
              {errors.fieldOfStudy && (
                <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                  {errors.fieldOfStudy}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                Why do you want to join our career fair? *
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                rows="4"
                placeholder="Tell us about your career goals and what you hope to achieve..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.motivation ? '2px solid #dc3545' : '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = errors.motivation ? '#dc3545' : '#e9ecef'}
              />
              {errors.motivation && (
                <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                  {errors.motivation}
                </span>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Continue to Company Selection
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Company Selection and Appointment Booking */}
      {currentStep === 2 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Select Companies & Book Appointments</h2>
              <p style={{ margin: 0, color: '#6c757d' }}>
                Choose companies you're interested in and schedule your appointments
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Back to Form
            </button>
          </div>

          {/* Date Selection */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#333' }}>
              Select Date *
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '1rem',
                backgroundColor: 'white',
                minWidth: '300px'
              }}
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
                <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  Loading available time slots...
                </div>
              )}

              {/* Company Selection */}
              {!loading && companies.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#333' }}>Available Companies</h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '20px' 
                  }}>
                    {companies.map(company => {
                      const isSelected = selectedCompanies.find(c => c._id === company._id);
                      return (
                        <div
                          key={company._id}
                          onClick={() => handleCompanySelect(company)}
                          style={{
                            padding: '20px',
                            border: isSelected ? '2px solid #007bff' : '2px solid #e9ecef',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backgroundColor: isSelected ? '#e7f3ff' : 'white'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0, color: '#333' }}>{company.name}</h4>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#007bff' : 'transparent',
                              border: '2px solid #007bff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isSelected && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                            </div>
                          </div>
                          <p style={{ margin: '5px 0', color: '#6c757d', fontSize: '0.9rem' }}>
                            Industry: {company.industry}
                          </p>
                          <p style={{ margin: '10px 0 0 0', color: '#333', fontSize: '0.9rem' }}>
                            <strong>Positions:</strong> {company.positions.join(', ')}
                          </p>
                          {company.description && (
                            <p style={{ margin: '10px 0 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
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
                  <h3 style={{ marginBottom: '20px', color: '#333' }}>
                    Book Time Slots for {formatDate(selectedDate)}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {selectedCompanies.map(company => (
                      <div key={company._id} style={{
                        padding: '20px',
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <h4 style={{ marginBottom: '15px', color: '#333' }}>{company.name}</h4>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                          gap: '10px' 
                        }}>
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
                               style={{
                                 padding: '8px 4px',
                                 border: isBooked ? '2px solid #28a745' : 
                                        isDisabled ? '2px solid #dc3545' : '2px solid #e9ecef',
                                 borderRadius: '6px',
                                 backgroundColor: isBooked ? '#d4edda' : 
                                                isDisabled ? '#f8d7da' : 'white',
                                 color: isBooked ? '#155724' : 
                                       isDisabled ? '#721c24' : '#333',
                                 cursor: isDisabled ? 'not-allowed' : 'pointer',
                                 fontSize: '0.8rem',
                                 transition: 'all 0.3s ease',
                                 opacity: isDisabled ? 0.6 : 1
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
               <div style={{
                 padding: '20px',
                 backgroundColor: '#e7f3ff',
                 borderRadius: '12px',
                 marginBottom: '20px'
               }}>
                 <h3 style={{ marginBottom: '15px', color: '#333' }}>Appointment Summary</h3>
                 <div style={{ marginBottom: '15px' }}>
                   <strong>Student:</strong> {formData.firstName} {formData.lastName}<br />
                   <strong>Email:</strong> {formData.email}<br />
                   <strong>Date:</strong> {formatDate(selectedDate)}
                 </div>
                 <div>
                   <strong>Scheduled Appointments:</strong>
                   <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                     {Object.entries(bookedSlots).map(([companyId, dates]) => {
                       const company = companies.find(c => c._id === companyId);
                       const timeSlot = dates[selectedDate];
                       return timeSlot ? (
                         <li key={companyId} style={{ marginBottom: '5px' }}>
                           <strong>{company?.name}</strong> - {timeSlot}
                         </li>
                       ) : null;
                     })}
                   </ul>
                 </div>
               </div>
             )}

             <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
               <button
                 onClick={handleBookingSubmit}
                 disabled={Object.keys(bookedSlots).length === 0 || loading}
                 style={{
                   padding: '16px 32px',
                   backgroundColor: Object.keys(bookedSlots).length > 0 && !loading ? '#28a745' : '#6c757d',
                   color: 'white',
                   border: 'none',
                   borderRadius: '6px',
                   fontSize: '1.1rem',
                   fontWeight: '500',
                   cursor: Object.keys(bookedSlots).length > 0 && !loading ? 'pointer' : 'not-allowed',
                   transition: 'background-color 0.3s ease'
                 }}
                 onMouseOver={(e) => {
                   if (Object.keys(bookedSlots).length > 0 && !loading) {
                     e.target.style.backgroundColor = '#218838';
                   }
                 }}
                 onMouseOut={(e) => {
                   if (Object.keys(bookedSlots).length > 0 && !loading) {
                     e.target.style.backgroundColor = '#28a745';
                   }
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
     <div style={{
       marginTop: '30px',
       padding: '20px',
       backgroundColor: '#f8f9fa',
       borderRadius: '12px',
       border: '1px solid #e9ecef'
     }}>
       <h3 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center' }}>
         <span style={{ marginRight: '10px', fontSize: '1.2rem' }}>ℹ️</span>
         How to Use This Form
       </h3>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
         <div>
           <h4 style={{ color: '#007bff', marginBottom: '8px' }}>Step 1: Personal Information</h4>
           <ul style={{ paddingLeft: '20px', color: '#6c757d' }}>
             <li>Fill in your personal details</li>
             <li>Select your field of study</li>
             <li>Describe your motivation</li>
           </ul>
         </div>
         <div>
           <h4 style={{ color: '#007bff', marginBottom: '8px' }}>Step 2: Company Selection</h4>
           <ul style={{ paddingLeft: '20px', color: '#6c757d' }}>
             <li>Choose your preferred date</li>
             <li>Select companies you want to meet</li>
             <li>Book time slots for each company</li>
           </ul>
         </div>
         <div>
           <h4 style={{ color: '#007bff', marginBottom: '8px' }}>Important Rules</h4>
           <ul style={{ paddingLeft: '20px', color: '#6c757d' }}>
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