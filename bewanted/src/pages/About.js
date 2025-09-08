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
              In the heart of Graz, where innovation meets tradition, <strong>beWanted</strong> was born from a simple yet powerful observation: 
              talented students and forward-thinking companies were missing meaningful connections. 
              What started as conversations among passionate students at BEST Graz has evolved into Graz's premier career networking event.
            </p>
            <p>
              We recognized that the traditional job search process was broken. 
              Students were sending countless applications into the void, while companies struggled to find the right talent that matched not just their skill requirements, but their culture and vision. 
              There had to be a better way.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              <strong>beWanted</strong> exists to bridge the gap between ambitious talent and innovative companies. 
              We believe that when the right people connect with the right opportunities, extraordinary things happen – 
              for individuals, companies, and our entire community.
            </p>
            <p>
              Our mission is simple: <strong>To create meaningful connections that transform careers and drive innovation in Graz and beyond.</strong>
            </p>
          </section>

          <section className="about-section">
            <h2>What Makes Us Different</h2>
            
            <div className="differentiators-grid">
              <div className="differentiator-item">
                <h3>Personal, Not Transactional</h3>
                <p>
                  We're not just another job fair with booths and business cards. We facilitate genuine conversations, 
                  mentorship opportunities, and long-term relationships that extend far beyond a single event.
                </p>
              </div>
              
              <div className="differentiator-item">
                <h3>Quality Over Quantity</h3>
                <p>
                  Rather than cramming hundreds of companies into a convention center, we carefully curate our participating organizations. 
                  Every company at beWanted is vetted for their commitment to employee growth, innovation, and positive impact.
                </p>
              </div>
              
              <div className="differentiator-item">
                <h3>Student-Centric Approach</h3>
                <p>
                  Born from the student community, we understand what students actually need: real insights into company culture, 
                  clear career paths, and opportunities to showcase their potential beyond just their GPA.
                </p>
              </div>
              
              <div className="differentiator-item">
                <h3>Technology-Enabled Connections</h3>
                <p>
                  Our digital platform ensures that every conversation started at beWanted can continue online. 
                  We use smart matching algorithms to suggest connections and provide resources for ongoing professional development.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Impact</h2>
            <p>Since our inception, beWanted has:</p>
            <div className="impact-stats">
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Students Connected</div>
                <p>with their dream opportunities</p>
              </div>
              <div className="stat-item">
                <div className="stat-number">5+</div>
                <div className="stat-label">Partner Companies</div>
                <p>ranging from startups to global leaders</p>
              </div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Meaningful Conversations</div>
                <p>that led to internships, jobs, and mentorships</p>
              </div>
              <div className="stat-item">
                <div className="stat-number">1</div>
                <div className="stat-label">Thriving Community</div>
                <p>of professionals supporting each other's growth</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>The Companies We Work With</h2>
            <p>
              We're proud to partner with organizations that share our values:
            </p>
            <div className="partner-highlights">
              <div className="partner-item">
                <h4>Global Innovators</h4>
                <p>like <strong>Siemens</strong>, driving digital transformation</p>
              </div>
              <div className="partner-item">
                <h4>Infrastructure Leaders</h4>
                <p>like <strong>ÖBB</strong>, shaping sustainable mobility</p>
              </div>
              <div className="partner-item">
                <h4>Tech Pioneers</h4>
                <p>like <strong>Beyond Now</strong>, building the future of digital platforms</p>
              </div>
              <div className="partner-item">
                <h4>Industry Leaders</h4>
                <p>like <strong>SSI SCHÄFER</strong>, revolutionizing logistics solutions</p>
              </div>
            </div>
            <p>
              Each partner is selected not just for the opportunities they offer, but for their commitment to nurturing talent and creating positive impact.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Vision for the Future</h2>
            <p>We envision a world where:</p>
            <ul className="vision-list">
              <li><strong>Every student</strong> finds not just a job, but a calling that ignites their passion</li>
              <li><strong>Every company</strong> discovers talent that drives their mission forward</li>
              <li><strong>Our community</strong> becomes a global hub for innovation and meaningful work</li>
            </ul>
            <p>
              <strong>beWanted</strong> is more than an event – it's a movement. A movement towards more intentional career development, 
              more meaningful work, and stronger communities built on mutual support and shared success.
            </p>
          </section>

          <section className="about-section">
            <h2>Join Our Story</h2>
            <p>
              Whether you're a student ready to launch your career, a professional looking to make your next move, 
              or a company seeking exceptional talent, you have a place in the beWanted story.
            </p>
            <p>
              <em>Because when talent meets opportunity with intention and authenticity, everyone wins.</em>
            </p>
            <div className="cta-section">
              <h3>Ready to be wanted? Ready to find what you're looking for?</h3>
              <p>
                <strong>Join us at the next beWanted event and become part of a community that believes in the power of meaningful connections.</strong>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default About;