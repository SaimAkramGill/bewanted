import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CareerFairForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    fieldOfStudy: '',
    motivation: '',
    cvFile: null,
    cvFileName: '',
    internshipInterest: false,
    hasValidVisa: false,
    germanLanguageConfirmed: false
  });

  // UI State
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState({});
  const [availableSlots, setAvailableSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fieldOfStudyOptions = [
    'Computer Science',
    'Software Engineering and Management',
    'Data Science',
    'Cybersecurity',
    'Information Technology',
    'Business Administration',
    'Marketing',
    'Finance',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Biomedical Engineering',
    'Computational Social Systems',
    'BioTechnology',
    'Artificial Intelligence',
    'Other'
  ];

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        console.log('Fetching companies from:', API_URL);
        const response = await axios.get(`${API_URL}/career-fair/companies`);
        console.log('Companies received:', response.data.data);
        setCompanies(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch available slots when company is selected
  const handleCompanySelect = async (companyId) => {
    try {
      console.log('Selecting company:', companyId);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/career-fair/available-slots/${companyId}`, {
        params: { email: formData.email }
      });
      console.log('Slots received:', response.data.data);
      
      const company = response.data.data;

      setSelectedCompanies(prev => ({
        ...prev,
        [companyId]: {
          selected: true,
          company: company,
          timeSlot: null
        }
      }));

      setAvailableSlots(prev => ({
        ...prev,
        [companyId]: company.timeSlots || []
      }));

      setError(null);
    } catch (err) {
      console.error('Error selecting company:', err);
      if (err.response?.data?.maintenance) {
        setError(`${err.response.data.message}`);
      } else if (err.response?.status === 403) {
        setError('This company is not available for booking');
      } else {
        setError('Failed to load available slots. Please try again.');
      }
    }
  };

  // Handle company deselection
  const handleCompanyDeselect = (companyId) => {
    console.log('Deselecting company:', companyId);
    setSelectedCompanies(prev => {
      const updated = { ...prev };
      delete updated[companyId];
      return updated;
    });
  };

  // Handle timeslot selection
  const handleTimeSlotSelect = (companyId, timeSlot) => {
    console.log('Selected timeslot:', companyId, timeSlot);
    setSelectedCompanies(prev => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        timeSlot: timeSlot
      }
    }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle CV file upload
  const handleCVChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('CV file must be less than 2MB');
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, DOC, and DOCX files are allowed');
        return;
      }
      setFormData(prev => ({
        ...prev,
        cvFile: file,
        cvFileName: file.name
      }));
      setError(null);
    }
  };

  // Handle special checkbox changes
  const handleCompanyFieldChange = (companyId, field, value) => {
    console.log('Field change:', companyId, field, value);
    setSelectedCompanies(prev => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [field]: value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.fieldOfStudy || !formData.motivation) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate at least one appointment is selected
    const appointments = Object.entries(selectedCompanies)
      .filter(([, data]) => data.timeSlot)
      .map(([companyId, data]) => ({
        companyId,
        timeSlot: data.timeSlot,
        germanLanguageConfirmed: data.germanLanguageConfirmed || false,
        internshipInterest: data.internshipInterest || false,
        hasValidVisa: data.hasValidVisa || false
      }));

    if (appointments.length === 0) {
      setError('Please select at least one appointment');
      return;
    }

    // ✅ Special requirements checkboxes are displayed but NOT enforced
    // Data is collected and stored for company reference
    // Users can book regardless of checkbox status


    try {
      setSubmitting(true);
      setError(null);

      const formDataToSubmit = new FormData();
      formDataToSubmit.append('firstName', formData.firstName);
      formDataToSubmit.append('lastName', formData.lastName);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('phoneNumber', formData.phoneNumber);
      formDataToSubmit.append('fieldOfStudy', formData.fieldOfStudy);
      formDataToSubmit.append('motivation', formData.motivation);
      
      if (formData.cvFile) {
        formDataToSubmit.append('cv', formData.cvFile);
      }

      formDataToSubmit.append('appointments', JSON.stringify(appointments));

      // Add special checkboxes
      Object.entries(selectedCompanies).forEach(([companyId, data]) => {
        if (data.germanLanguageConfirmed) {
          formDataToSubmit.append(`${companyId}_germanLanguageConfirmed`, true);
        }
        if (data.internshipInterest) {
          formDataToSubmit.append(`${companyId}_internshipInterest`, true);
        }
        if (data.hasValidVisa) {
          formDataToSubmit.append(`${companyId}_hasValidVisa`, true);
        }
      });

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(
  `${API_URL}/career-fair/register`,
  formDataToSubmit
);

      console.log('Registration successful:', response.data);
      setSuccess(true);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        fieldOfStudy: '',
        motivation: '',
        cvFile: null,
        cvFileName: '',
        internshipInterest: false,
        hasValidVisa: false,
        germanLanguageConfirmed: false
      });
      setSelectedCompanies({});
      setAvailableSlots({});

      const fileInput = document.getElementById('cvInput');
      if (fileInput) fileInput.value = '';

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to register. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#f29b20', marginBottom: '10px' }}>Career Fair Registration</h1>
        <p style={{ fontSize: '1.1em', color: '#666' }}>Join our career fair and connect with top companies</p>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(242, 155, 32, 0.1)'
      }}>
        {error && (
          <div style={{
            padding: '15px 20px',
            borderRadius: '6px',
            marginBottom: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '15px 20px',
            borderRadius: '6px',
            marginBottom: '20px',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb'
          }}>
            ✅ Registration successful! Check your email for confirmation.
          </div>
        )}

        {/* Student Information Section */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '1.5em',
            color: '#333',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '2px solid #f29b20'
          }}>
            📋 Your Information
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', color: '#333' }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                maxLength="50"
                placeholder="Enter your first name"
                style={{
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1em',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', color: '#333' }}>
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                maxLength="50"
                placeholder="Enter your last name"
                style={{
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1em',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', color: '#333' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your.email@example.com"
                style={{
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1em',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', color: '#333' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                placeholder="+43 123 456789"
                style={{
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1em',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', color: '#333' }}>
              Field of Study *
            </label>
            <select
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleInputChange}
              required
              style={{
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '1em',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select your field of study</option>
              {fieldOfStudyOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', color: '#333' }}>
              Motivation *
            </label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              required
              placeholder="Tell us why you want to attend this career fair..."
              rows="4"
              style={{
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '1em',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', color: '#333' }}>
              Upload CV (PDF, DOC, DOCX - Max 2MB)
            </label>
            <input
              id="cvInput"
              type="file"
              onChange={handleCVChange}
              accept=".pdf,.doc,.docx"
              style={{
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '1em',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            {formData.cvFileName && (
              <small style={{ color: '#28a745', marginTop: '5px', display: 'block' }}>
                ✅ File selected: {formData.cvFileName}
              </small>
            )}
          </div>
        </section>

        {/* Company Selection Section */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '1.5em',
            color: '#333',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '2px solid #f29b20'
          }}>
            🏢 Select Companies
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {companies.map(company => (
              <div key={company._id} style={{
                background: selectedCompanies[company._id]?.selected ? '#fffbf0' : '#f8f9fa',
                border: selectedCompanies[company._id]?.selected ? '2px solid #f29b20' : '2px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                transition: 'all 0.3s',
                cursor: company.specialRules?.bookingAvailable ? 'pointer' : 'not-allowed',
                opacity: company.specialRules?.bookingAvailable ? 1 : 0.7
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '15px'
                }}>
                  <input
                    type="checkbox"
                    id={`company-${company._id}`}
                    checked={selectedCompanies[company._id]?.selected || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleCompanySelect(company._id);
                      } else {
                        handleCompanyDeselect(company._id);
                      }
                    }}
                    disabled={!company.specialRules?.bookingAvailable}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginTop: '2px',
                      cursor: 'pointer',
                      accentColor: '#f29b20'
                    }}
                  />
                  <label htmlFor={`company-${company._id}`} style={{ cursor: 'pointer', flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2em', color: '#333' }}>{company.name}</h3>
                  </label>
                </div>

                <div style={{ marginBottom: '15px', fontSize: '0.9em' }}>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Industry:</strong> {company.industry}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Package:</strong>{' '}
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85em',
                      fontWeight: '600',
                      backgroundColor: company.packageType === 'Platinum' ? '#c0c0c0' : 
                                      company.packageType === 'Gold' ? '#ffc107' : '#e8e8e8',
                      color: company.packageType === 'Gold' ? '#333' : 'white'
                    }}>
                      {company.packageType}
                    </span>
                  </p>
                  {company.description && (
                    <p style={{
                      color: '#888',
                      fontStyle: 'italic',
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid #ddd'
                    }}>
                      {company.description}
                    </p>
                  )}
                </div>

                {/* Special Rules */}
                {selectedCompanies[company._id]?.selected && (
                  <div style={{ marginBottom: '15px' }}>
                    {/* ÖBB: German Requirement */}
                    {company.specialRules?.germanRequired && (
                      <div style={{
                        background: '#fff3cd',
                        borderLeft: '4px solid #ff9800',
                        padding: '15px',
                        borderRadius: '4px',
                        marginBottom: '15px'
                      }}>
                        <strong style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                          ⚠️ German Requirement:
                        </strong>
                        <p style={{ margin: '8px 0', color: '#666', fontSize: '0.9em' }}>
                          This company requires B2 level German language skills.
                        </p>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          margin: '8px 0'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedCompanies[company._id]?.germanLanguageConfirmed || false}
                            onChange={(e) => handleCompanyFieldChange(company._id, 'germanLanguageConfirmed', e.target.checked)}
                            style={{ cursor: 'pointer', accentColor: '#f29b20' }}
                          />
                          I confirm B2 level German language proficiency
                        </label>
                      </div>
                    )}

                    {/* Netconomy: Internship Interest */}
                    {company.specialRules?.internshipVisa && (
                      <div style={{
                        background: '#d1ecf1',
                        borderLeft: '4px solid #17a2b8',
                        padding: '15px',
                        borderRadius: '4px',
                        marginBottom: '15px'
                      }}>
                        <strong style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                          🎓 Internship Opportunity:
                        </strong>
                        <p style={{ margin: '8px 0', color: '#666', fontSize: '0.9em' }}>
                          Are you interested in an internship? Do you have a valid visa for employment?
                        </p>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          margin: '8px 0'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedCompanies[company._id]?.internshipInterest || false}
                            onChange={(e) => handleCompanyFieldChange(company._id, 'internshipInterest', e.target.checked)}
                            style={{ cursor: 'pointer', accentColor: '#f29b20' }}
                          />
                          I am interested in an internship
                        </label>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          margin: '8px 0'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedCompanies[company._id]?.hasValidVisa || false}
                            onChange={(e) => handleCompanyFieldChange(company._id, 'hasValidVisa', e.target.checked)}
                            style={{ cursor: 'pointer', accentColor: '#f29b20' }}
                          />
                          I have a valid visa for full-time employment (38.5 hrs/week)
                        </label>
                        <div style={{ marginTop: '10px' }}>
                          <a href="https://drive.google.com/drive/folders/1FZnDU1Ps9H6PTsZA0MolcpL_I1twHovn?usp=sharing" target="_blank" rel="noopener noreferrer" style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: '600'
                          }}>
                            📄 Check out internship listings
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeslot Selection */}
                {selectedCompanies[company._id]?.selected && availableSlots[company._id] && availableSlots[company._id].length > 0 && (
                  <div style={{ marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                    <label style={{ fontWeight: '600', marginBottom: '10px', display: 'block', color: '#333' }}>
                      Select a time slot:
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: '8px'
                    }}>
                      {availableSlots[company._id].map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleTimeSlotSelect(company._id, slot.timeSlot)}
                          disabled={!slot.available || slot.conflict}
                          style={{
                            padding: '10px',
                            border: selectedCompanies[company._id]?.timeSlot === slot.timeSlot ? '2px solid #f29b20' : '2px solid #e0e0e0',
                            background: selectedCompanies[company._id]?.timeSlot === slot.timeSlot ? '#f29b20' : 'white',
                            color: selectedCompanies[company._id]?.timeSlot === slot.timeSlot ? 'white' : '#333',
                            borderRadius: '6px',
                            cursor: !slot.available || slot.conflict ? 'not-allowed' : 'pointer',
                            fontSize: '0.9em',
                            fontWeight: '500',
                            opacity: !slot.available || slot.conflict ? 0.5 : 1,
                            backgroundColor: !slot.available || slot.conflict ? '#f0f0f0' : (selectedCompanies[company._id]?.timeSlot === slot.timeSlot ? '#f29b20' : 'white')
                          }}
                          title={slot.conflict ? 'Conflict with another appointment' : slot.available ? slot.timeSlot : 'Fully booked'}
                        >
                          {slot.timeSlot}
                          {slot.conflict && <div style={{ fontSize: '0.7em' }}>Conflict</div>}
                          {!slot.available && !slot.conflict && <div style={{ fontSize: '0.7em' }}>Booked</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!company.specialRules?.bookingAvailable && (
                  <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '4px', marginTop: '10px', color: '#856404' }}>
                    <strong>⏳ Booking Not Available</strong>
                    <p style={{ margin: '5px 0', fontSize: '0.9em' }}>This company's bookings are not available at the moment. Please check back later.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Submit Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '40px',
          paddingTop: '30px',
          borderTop: '2px solid #f0f0f0'
        }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '14px 40px',
              background: submitting ? '#ccc' : 'linear-gradient(135deg, #f29b20 0%, #e68a1c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1.05em',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {submitting ? 'Registering...' : 'Register for Career Fair'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CareerFairForm;