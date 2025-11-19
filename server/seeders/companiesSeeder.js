const mongoose = require('mongoose');
const Company = require('../models/Company');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const companies = [
  {
    name: 'Anton Paar',
    industry: 'Technology',
    packageType: 'Platinum',
    positions: ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer'],
    description: 'Leading technology company focused on precision measurement and innovative solutions.',
    website: 'https://www.anton-paar.com/at-de/',
    specialRules: {
      germanRequired: false,
      internshipVisa: false,
      limitedBookings: false,
      usesGoldTimeslots: false,
      bookingAvailable: true
    },
    interviewDuration: 25,
    bufferTime: 5,
    isActive: true
  },
  {
    name: 'ÖBB',
    industry: 'Transportation',
    packageType: 'Platinum',
    positions: ['IT Specialist', 'Operations Manager', 'Network Engineer'],
    description: 'Austria\'s largest mobility provider, offering rail and bus services.',
    website: 'https://www.oebb.at/en/',
    specialRules: {
      germanRequired: true, // SPECIAL RULE: Requires B2 German level
      internshipVisa: false,
      limitedBookings: false,
      usesGoldTimeslots: false,
      bookingAvailable: true
    },
    interviewDuration: 25,
    bufferTime: 5,
    isActive: true,
    contactPerson: {
      name: 'ÖBB HR Team',
      email: 'hr@oebb.at'
    }
  },
  {
    name: 'Netconomy',
    industry: 'E-commerce/Cloud',
    packageType: 'Gold',
    positions: ['DevOps Engineer', 'Business Analyst', 'Solutions Architect'],
    description: 'Digital transformation and e-commerce solutions provider.',
    website: 'https://netconomy.net/',
    specialRules: {
      germanRequired: false,
      internshipVisa: true, // SPECIAL RULE: Internship interest with visa checkbox
      limitedBookings: false,
      usesGoldTimeslots: false,
      bookingAvailable: true
    },
    interviewDuration: 15,
    bufferTime: 5,
    isActive: true,
    contactPerson: {
      name: 'Netconomy Recruitment',
      email: 'careers@netconomy.net'
    }
  },
  {
    name: 'Beyond Now',
    industry: 'Technology',
    packageType: 'Platinum',
    positions: ['iOS Developer', 'Machine Learning Engineer', 'Design Engineer'],
    description: 'Technology company specializing in digital platforms and innovation.',
    website: 'https://www.beyondnow.com/en/',
    specialRules: {
      germanRequired: false,
      internshipVisa: false,
      limitedBookings: true, // SPECIAL RULE: Only 1 booking per timeslot (2:1 interviews)
      usesGoldTimeslots: true, // SPECIAL RULE: Use Gold timeslots (20-min intervals) instead of Platinum (30-min)
      bookingAvailable: true
    },
    interviewDuration: 15, // Using Gold timeslots, so 15 min + 5 min buffer
    bufferTime: 5,
    isActive: true,
    contactPerson: {
      name: 'Beyond Now HR',
      email: 'hr@beyondnow.com'
    }
  },
  {
    name: 'MJP',
    industry: 'Business Services',
    packageType: 'Gold',
    positions: ['Consultant', 'Project Manager', 'Business Analyst'],
    description: 'Management and consulting services firm.',
    website: 'https://www.mjp.com',
    specialRules: {
      germanRequired: false,
      internshipVisa: false,
      limitedBookings: false,
      usesGoldTimeslots: false,
      bookingAvailable: true
    },
    interviewDuration: 15,
    bufferTime: 5,
    isActive: true
  },
  {
    name: 'Siemens',
    industry: 'Technology',
    packageType: 'Silver',
    positions: ['Cloud Engineer', 'Software Developer', 'Azure Specialist'],
    description: 'Global technology company developing innovative solutions.',
    website: 'https://www.siemens.com/at/de.html',
    specialRules: {
      germanRequired: false,
      internshipVisa: false,
      limitedBookings: true,
      usesGoldTimeslots: false,
      bookingAvailable: false // SPECIAL RULE: NOT ACTIVATED YET - waiting for valid contract
    },
    interviewDuration: 15,
    bufferTime: 5,
    isActive: false, // Will be activated once contract is valid
    contactPerson: {
      name: 'Siemens Recruitment',
      email: 'careers@siemens.com'
    }
  }
];

const seedCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🗄️  Connected to MongoDB');

    // Clear existing companies
    await Company.deleteMany({});
    console.log('✅ Cleared existing companies');

    // Insert new companies
    const createdCompanies = await Company.insertMany(companies);
    console.log(`✅ Created ${createdCompanies.length} companies\n`);

    // Log company details
    console.log('📋 Company Configuration Summary:');
    console.log('─'.repeat(80));
    
    createdCompanies.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name}`);
      console.log(`   Package: ${company.packageType}`);
      console.log(`   Active: ${company.isActive}`);
      console.log(`   Booking Available: ${company.specialRules.bookingAvailable}`);
      
      if (company.specialRules.germanRequired) {
        console.log(`   ⚠️  SPECIAL RULE: Requires German B2 level`);
      }
      if (company.specialRules.internshipVisa) {
        console.log(`   ⚠️  SPECIAL RULE: Internship + Visa checkbox required`);
      }
      if (company.specialRules.limitedBookings) {
        console.log(`   ⚠️  SPECIAL RULE: Limited to 1 booking per timeslot (2:1 interviews)`);
      }
      if (company.specialRules.usesGoldTimeslots) {
        console.log(`   ⚠️  SPECIAL RULE: Uses Gold timeslots (20-min intervals)`);
      }
    });

    console.log('\n' + '─'.repeat(80));
    console.log('🎉 Companies seeded successfully!');
    
    // Print timeslot details
    console.log('\n📅 TIMESLOT SCHEDULE (November 26, 2025):');
    console.log('─'.repeat(80));
    console.log('08:00 - 08:30: Official Opening & Presentation');
    console.log('08:30 - 08:45: Buffer');
    console.log('09:00 - 11:45: Morning Interview Sessions');
    console.log('11:45 - 12:45: Lunch Break');
    console.log('12:45 - 13:00: Group Picture + Buffer');
    console.log('13:00 - 17:20: Afternoon Interview Sessions');
    console.log('17:20 - 18:00: Cleanup');
    console.log('\n📊 TIMESLOT BREAKDOWN:');
    console.log('─'.repeat(80));
    console.log('Gold & Silver (15min + 5min buffer = 20min intervals):');
    console.log('  Morning: 9 timeslots (09:00-11:45)');
    console.log('  Afternoon: 13 timeslots (13:00-17:20)');
    console.log('  Total: 22 timeslots × 2 bookings = 44 bookings');
    console.log('\nPlatinum (25min + 5min buffer = 30min intervals):');
    console.log('  Morning: 5 timeslots (09:00-11:45)');
    console.log('  Afternoon: 9 timeslots (13:00-17:20)');
    console.log('  Total: 14 timeslots × 2 bookings = 28 bookings');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedCompanies();
}

module.exports = { seedCompanies, companies };