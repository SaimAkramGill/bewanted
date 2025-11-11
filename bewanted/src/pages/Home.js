import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to beWANTED</h1>
            <p className="hero-subtitle">
              Das persönliche Karriere-Event
            </p>
            <p className="hero-description">
              Experience the different companies hiring processes with talking to their
              HR's and getting your CV's check with potential job offers.
            </p>
            
            <div className="hero-actions">
              <Link to="/career-fair" className="btn btn-primary">
                Book Your Spot
              </Link>
              <Link to="/about" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Companies</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img 
      src="/logos/Antonpaar.png" 
      alt="Anton Paar Logo" 
      className="company-logo"
    />
              </div>
              <h3>Anton Paar</h3>
              <p>
                Anton Paar is a global leader in precision measurement and automation solutions, specializing in density, concentration, CO₂, and rheometry.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img 
      src="/logos/Siemens-logo.svg.png" 
      alt="Siemens Logo" 
      className="company-logo"
    />
              </div>
              <h3>Siemens</h3>
              <p>Siemens is a global technology leader driving digital and sustainable transformation across industry, infrastructure, mobility, and healthcare through cutting-edge AI and innovation.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img 
      src="/logos/logo-oebb.png" 
      alt="ÖBB Logo" 
      className="company-logo"
    />
              </div>
              <h3>ÖBB</h3>
              <p>ÖBB-Personenverkehr AG is Austria's largest mobility provider, offering rail and bus services to over one million passengers daily.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><img 
      src="/logos/Beyond_Now_Logo_Blue_Text_2.png" 
      alt="Beyond Now Logo" 
      className="company-logo"
    /></div>
              <h3>Beyond Now</h3>
              <p>Beyond Now is a fast-growing, AI-powered digital platform and ecosystem orchestration provider, enabling global organizations to co-create, monetize, and scale innovative services through cloud-native, SaaS-based solutions.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img 
      src="/logos/Logo_SSI.png" 
      alt="SSI SCHÄFER Logo" 
      className="company-logo"
    />
              </div>
              <h3>MJP Ziviltechniker</h3>
              <p>MJP is an interdisciplinary Austrian engineering consultancy providing comprehensive "one-stop shop" solutions for ground engineering, geology, and water management, addressing complex challenges in construction, natural hazards, and ecology.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img 
      src="/logos/NCLogo.png" 
      alt="Netconomy Logo" 
      className="company-logo"
    />
              </div>
              <h3>NETCONOMY</h3>
              <p>From designing your first agile digital strategy, and choosing the right solutions for you, all the way to building and optimizing amazing digital platforms – we are here to help you transform your business, today.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to connect with your favorite company?</h2>
            <p>Book your place at the career fair and explore exciting opportunities with leading companies.</p>
            <div className="event-details">
              <h3>Event Details</h3>
              <p>
                <strong>Date:</strong> November 26, 2025<br />
                <strong>Time:</strong> 8:00 - 17:30<br />
                <strong>Location:</strong> Infeldgasse 13
              </p>
            </div>
            <Link to="/career-fair" className="btn btn-primary">
              Reserve Your Spot Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;