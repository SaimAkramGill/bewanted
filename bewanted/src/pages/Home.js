import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to beWanted</h1>
            <p className="hero-subtitle">
              Das persönliche Karriere-Event
            </p>
            <p className="hero-description">
              Experience the different companies hiring processes with talking to their
              HR's and getting your CV's check with potential job offers.
            </p>
            
            {isAuthenticated ? (
              <div className="hero-actions">
                <h2>Welcome back, {user?.name}!</h2>
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Companies</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚛️</div>
              <h3>Anton Paar</h3>
              <p>
                Anton Paar is a global leader in precision measurement and automation solutions, specializing in density, concentration, CO₂, and rheometry.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Siemens</h3>
              <p>Siemens is a global technology leader driving digital and sustainable transformation across industry, infrastructure, mobility, and healthcare through cutting-edge AI and innovation.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🗄️</div>
              <h3>ÖBB</h3>
              <p>ÖBB-Personenverkehr AG is Austria’s largest mobility provider, offering rail and bus services to over one million passengers daily.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Beyond Now</h3>
              <p>Beyond Now is a fast-growing, AI-powered digital platform and ecosystem orchestration provider, enabling global organizations to co-create, monetize, and scale innovative services through cloud-native, SaaS-based solutions.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>SSI SCHÄFER</h3>
              <p>SSI SCHÄFER is a global leader in modular warehouse and logistics solutions, shaping the future of intralogistics with innovative technologies across six continents.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Updates</h3>
              <p>Fast, efficient updates and real-time data synchronization.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to get started?</h2>
            <p>Join thousands of users who are already using our platform.</p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary">
                Create Your Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;