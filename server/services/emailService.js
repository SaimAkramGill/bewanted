const nodemailer = require('nodemailer');
const handlebars = require('handlebars');

// Create transporter
const createTransporter = () => {
  // Gmail configuration (you can use other providers)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
    }
  });
};

// Alternative SMTP configuration (for custom email providers)
const createSMTPTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Student confirmation email template
const studentEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Career Fair Registration Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f29b20 0%, #d4841a 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .appointment-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #f29b20; }
        .company-name { color: #f29b20; font-weight: bold; font-size: 1.1em; margin-bottom: 5px; }
        .appointment-details { color: #666; margin-bottom: 10px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
        .btn { display: inline-block; background: #f29b20; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .info-item { background: #f8f9fa; padding: 15px; border-radius: 6px; }
        .info-label { font-weight: bold; color: #333; }
        .info-value { color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Registration Successful!</h1>
            <p>Thank you for registering for the beWanted Career Fair</p>
        </div>
        
        <div class="content">
            <h2>Hello {{firstName}} {{lastName}},</h2>
            
            <p>Your registration for the beWanted Career Fair has been confirmed! We're excited to have you join us.</p>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Email:</div>
                    <div class="info-value">{{email}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone:</div>
                    <div class="info-value">{{phoneNumber}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Field of Study:</div>
                    <div class="info-value">{{fieldOfStudy}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Appointments:</div>
                    <div class="info-value">{{appointmentCount}}</div>
                </div>
            </div>

            <h3>📅 Your Scheduled Appointments:</h3>
            {{#each appointments}}
            <div class="appointment-card">
                <div class="company-name">{{company.name}}</div>
                <div class="appointment-details">
                    <strong>📅 Date:</strong> {{formatDate date}}<br>
                    <strong>🕐 Time:</strong> {{timeSlot}}<br>
                    <strong>🏢 Industry:</strong> {{company.industry}}<br>
                    <strong>💼 Positions:</strong> {{#if company.positions}}{{join company.positions ", "}}{{else}}N/A{{/if}}
                </div>
            </div>
            {{/each}}

            <div style="margin: 30px 0; padding: 20px; background: #e7f3ff; border-radius: 8px; border-left: 4px solid #007bff;">
                <h4>📋 Important Information:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #555;">
                    <li>Please arrive 10 minutes before your scheduled appointment</li>
                    <li>Bring copies of your resume and any relevant portfolios</li>
                    <li>Dress professionally for all meetings</li>
                    <li>Check your email for any updates or changes</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p>Questions or need to make changes?</p>
                <a href="mailto:admin@bewanted.com" class="btn">Contact Support</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Best regards,<br><strong>The beWanted Team</strong></p>
            <p>📧 admin@bewanted.com | 📱 +1 (555) 123-4567</p>
            <p>© 2025 beWanted. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Admin notification email template
const adminEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Career Fair Registration</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: #000000; color: #f29b20; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .student-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .appointment-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid #f29b20; }
        .company-name { color: #f29b20; font-weight: bold; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-item { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #f29b20; }
        .stat-label { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Career Fair Registration</h1>
            <p>A new student has registered for the career fair</p>
        </div>
        
        <div class="content">
            <div class="student-info">
                <h3>👤 Student Information:</h3>
                <p><strong>Name:</strong> {{firstName}} {{lastName}}</p>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Phone:</strong> {{phoneNumber}}</p>
                <p><strong>Field of Study:</strong> {{fieldOfStudy}}</p>
                <p><strong>Motivation:</strong></p>
                <p style="font-style: italic; color: #666; padding: 10px; background: white; border-radius: 4px;">"{{motivation}}"</p>
                <p><strong>Registration Time:</strong> {{registrationTime}}</p>
            </div>

            <h3>📅 Booked Appointments:</h3>
            {{#each appointments}}
            <div class="appointment-card">
                <div class="company-name">{{company.name}}</div>
                <div><strong>Date:</strong> {{formatDate date}}</div>
                <div><strong>Time:</strong> {{timeSlot}}</div>
                <div><strong>Industry:</strong> {{company.industry}}</div>
            </div>
            {{/each}}

            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">{{appointmentCount}}</div>
                    <div class="stat-label">Appointments</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{uniqueCompanies}}</div>
                    <div class="stat-label">Companies</div>
                </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #e7f3ff; border-radius: 8px;">
                <h4>🔗 Quick Actions:</h4>
                <p>
                    <a href="mailto:{{email}}" style="color: #007bff;">Email Student</a> | 
                    <a href="tel:{{phoneNumber}}" style="color: #007bff;">Call Student</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Email service functions
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Use Gmail or SMTP based on environment variables
      if (process.env.EMAIL_SERVICE === 'gmail') {
        this.transporter = createTransporter();
      } else {
        this.transporter = createSMTPTransporter();
      }
      
      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email service connection failed:', error);
        } else {
          console.log('✅ Email service ready');
        }
      });
    } catch (error) {
      console.error('❌ Email transporter initialization failed:', error);
    }
  }

  // Helper function to format date
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Send confirmation email to student
  async sendStudentConfirmation(studentInfo, appointments) {
    try {
      const template = handlebars.compile(studentEmailTemplate);
      
      // Register custom helpers
      handlebars.registerHelper('formatDate', this.formatDate);
      handlebars.registerHelper('join', (array, separator) => array && array.length ? array.join(separator) : 'N/A');

      const html = template({
        ...studentInfo,
        appointments,
        appointmentCount: appointments.length
      });

      const mailOptions = {
        from: `"beWanted Career Fair" <${process.env.EMAIL_FROM}>`,
        to: studentInfo.email,
        subject: '🎉 Career Fair Registration Confirmed - beWanted',
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Student confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending student email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification email to admin
  async sendAdminNotification(studentInfo, appointments) {
    try {
      const template = handlebars.compile(adminEmailTemplate);
      
      handlebars.registerHelper('formatDate', this.formatDate);

      const uniqueCompanies = [...new Set(appointments.map(apt => apt.company.name))].length;

      const html = template({
        ...studentInfo,
        appointments,
        appointmentCount: appointments.length,
        uniqueCompanies,
        registrationTime: new Date().toLocaleString()
      });

      const mailOptions = {
        from: `"beWanted System" <${process.env.EMAIL_FROM}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🔔 New Registration: ${studentInfo.firstName} ${studentInfo.lastName} - ${appointments.length} appointment${appointments.length > 1 ? 's' : ''}`,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Admin notification email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending admin email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send both emails
  async sendRegistrationEmails(studentInfo, appointments) {
    const results = {
      student: { success: false },
      admin: { success: false }
    };

    try {
      // Send student confirmation
      results.student = await this.sendStudentConfirmation(studentInfo, appointments);
      
      // Send admin notification
      results.admin = await this.sendAdminNotification(studentInfo, appointments);
      
      return results;
    } catch (error) {
      console.error('❌ Error sending registration emails:', error);
      return results;
    }
  }

  // Test email service
  async testEmailService() {
    try {
      const testEmail = {
        from: `"beWanted Test" <${process.env.EMAIL_FROM}>`,
        to: process.env.ADMIN_EMAIL,
        subject: '✅ Email Service Test - beWanted',
        html: `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #f29b20;">Email Service Test</h2>
            <p>This is a test email to verify that your email service is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Service Status:</strong> <span style="color: #28a745;">✅ Working</span></p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(testEmail);
      console.log('✅ Test email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Test email failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();

