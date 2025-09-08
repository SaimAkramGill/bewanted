import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-container">
            {/* Option A: If you put the logo in public/images/ folder */}
            <img 
              src="/logos/Bewanted-bw-head-03.svg" 
              alt="beWanted Logo" 
              className="logo-image"
            />
            
            {/* Option B: If you want to import from src/assets/ folder, 
                uncomment the import at the top and use:
            <img 
              src={logo} 
              alt="beWanted Logo" 
              className="logo-image"
            />
            */}
            
          <h1 className="logo-text">beWanted</h1>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="nav desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/career-fair" className="nav-link btn-primary">Career Fair</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/about" className="nav-link" onClick={closeMenu}>
            About
          </Link>
          <Link to="/contact" className="nav-link" onClick={closeMenu}>
            Contact
          </Link>
          <Link to="/career-fair" className="nav-link btn-primary" onClick={closeMenu}>
            Join Career Fair
          </Link>
        </nav>
      </div>
      
      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 998
          }}
        />
      )}
    </header>
  );
};

export default Header;