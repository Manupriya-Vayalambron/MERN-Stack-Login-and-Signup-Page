import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import '../index.css';

const DeliveryPartnerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    busStop: 'Kochi Bus Stop',
    licenseNumber: '',
    vehicleType: 'Bike'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const busStops = [
    'Kochi Bus Stop',
    'Ernakulam Junction', 
    'Kakkanad',
    'Aluva',
    'Fort Kochi',
    'Vyttila Junction',
    'Edappally',
    'University Gate',
    'Central Station',
    'Main Street Stop'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Mock login - check if user exists in localStorage
        const existingPartners = JSON.parse(localStorage.getItem('deliveryPartners') || '[]');
        const partner = existingPartners.find(p => 
          p.email === formData.email && p.password === formData.password
        );
        
        if (!partner) {
          setError('Invalid email or password');
          return;
        }
        
        // Store partner data in localStorage
        localStorage.setItem('deliveryPartner', JSON.stringify(partner));
        localStorage.setItem('deliveryPartnerToken', 'mock-token-' + Date.now());
        
        navigate('/delivery-partner-dashboard');
      } else {
        // Register partner
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        if (!formData.name || !formData.email || !formData.phone || !formData.licenseNumber) {
          setError('Please fill in all required fields');
          return;
        }

        // Check if email already exists
        const existingPartners = JSON.parse(localStorage.getItem('deliveryPartners') || '[]');
        if (existingPartners.find(p => p.email === formData.email)) {
          setError('Email already registered');
          return;
        }

        // Create new partner
        const newPartner = {
          id: 'partner_' + Date.now(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          assignedBusStop: formData.busStop,
          licenseNumber: formData.licenseNumber,
          vehicleType: formData.vehicleType,
          isOnline: false,
          rating: 4.5,
          totalDeliveries: 0,
          joinedDate: new Date().toISOString()
        };

        // Save to localStorage
        const updatedPartners = [...existingPartners, newPartner];
        localStorage.setItem('deliveryPartners', JSON.stringify(updatedPartners));
        localStorage.setItem('deliveryPartner', JSON.stringify(newPartner));
        localStorage.setItem('deliveryPartnerToken', 'mock-token-' + Date.now());
        
        navigate('/delivery-partner-dashboard');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-auth-container">
      <div className="partner-auth-wrapper">
        <header className="partner-auth-header">
          <Link to="/user-type-selection" className="partner-auth-back-button">
            <i className="material-icons">arrow_back</i>
          </Link>
          <h1 className="partner-auth-title">Delivery Partner</h1>
          <div className="partner-auth-header-spacer"></div>
        </header>

        <main className="partner-auth-main">
          <div className="partner-auth-card">
            <div className="partner-auth-toggle">
              <button
                onClick={() => setIsLogin(true)}
                className={`partner-auth-toggle-button ${isLogin ? 'active' : ''}`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`partner-auth-toggle-button ${!isLogin ? 'active' : ''}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="partner-auth-form">
              {error && (
                <div className="partner-auth-error">
                  <i className="material-icons">error</i>
                  <span>{error}</span>
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="partner-auth-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!isLogin}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="partner-auth-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required={!isLogin}
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="partner-auth-field">
                    <label>Assigned Bus Stop</label>
                    <select
                      name="busStop"
                      value={formData.busStop}
                      onChange={handleInputChange}
                      required={!isLogin}
                    >
                      {busStops.map(stop => (
                        <option key={stop} value={stop}>{stop}</option>
                      ))}
                    </select>
                  </div>

                  <div className="partner-auth-field">
                    <label>License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      required={!isLogin}
                      placeholder="DL1234567890"
                    />
                  </div>

                  <div className="partner-auth-field">
                    <label>Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      required={!isLogin}
                    >
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Bicycle">Bicycle</option>
                    </select>
                  </div>
                </>
              )}

              <div className="partner-auth-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="partner@example.com"
                />
              </div>

              <div className="partner-auth-field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter password"
                />
              </div>

              {!isLogin && (
                <div className="partner-auth-field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Confirm password"
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="partner-auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <span>{isLogin ? 'Login' : 'Register'}</span>
                )}
              </button>
            </form>

            <div className="partner-auth-info">
              <h3>Benefits of Being a Delivery Partner</h3>
              <div className="partner-benefits">
                <div className="benefit-item">
                  <i className="material-icons">local_atm</i>
                  <span>Earn flexible income</span>
                </div>
                <div className="benefit-item">
                  <i className="material-icons">schedule</i>
                  <span>Choose your own hours</span>
                </div>
                <div className="benefit-item">
                  <i className="material-icons">location_on</i>
                  <span>Work near your preferred bus stop</span>
                </div>
                <div className="benefit-item">
                  <i className="material-icons">phone</i>
                  <span>Direct communication with customers</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeliveryPartnerAuth;