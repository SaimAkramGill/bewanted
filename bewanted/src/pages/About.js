import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <h1>About beWanted</h1>
          <p>Learn more about our mission and values</p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>Our Story</h2>
            <p>
              beWanted was created with the vision of providing a modern, 
              scalable web application platform built on the latest technologies. 
              Our MERN stack foundation ensures robust performance and seamless 
              user experiences.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              To empower developers and businesses with cutting-edge web solutions 
              that are both powerful and easy to use. We believe in the power of 
              modern technology to transform ideas into reality.
            </p>
          </section>

          <section className="about-section">
            <h2>Technology Stack</h2>
            <div className="tech-grid">
              <div className="tech-item">
                <h3>MongoDB</h3>
                <p>NoSQL database for flexible data storage</p>
              </div>
              <div className="tech-item">
                <h3>Express.js</h3>
                <p>Fast, minimalist web framework for Node.js</p>
              </div>
              <div className="tech-item">
                <h3>React</h3>
                <p>Modern JavaScript library for building user interfaces</p>
              </div>
              <div className="tech-item">
                <h3>Node.js</h3>
                <p>JavaScript runtime for server-side development</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;