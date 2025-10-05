const mongoose = require('mongoose');
const Company = require('../models/Company');
const dotenv = require('dotenv');

dotenv.config();

const companies = [
  {
    name: 'Anton Paar',
    industry: 'Technology',
    positions: ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer'],
    description: 'Leading technology company focused on search, cloud computing, and artificial intelligence.',
    website: 'https://www.anton-paar.com/at-de/',
    contactPerson: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@google.com',
      phone: '+1-555-0101'
    }
  },
  {
    name: 'Siemens',
    industry: 'Technology',
    positions: ['Cloud Engineer', 'Software Developer', 'Azure Specialist', 'AI Engineer'],
    description: 'Global technology company developing software, services, devices and solutions.',
    website: 'https://www.siemens.com/at/de.html',
    contactPerson: {
      name: 'Mike Chen',
      email: 'mike.chen@microsoft.com',
      phone: '+1-555-0102'
    }
  },
  {
    name: 'Netconomy',
    industry: 'E-commerce/Cloud',
    positions: ['DevOps Engineer', 'Business Analyst', 'Solutions Architect', 'Operations Manager'],
    description: 'Multinational technology company focusing on e-commerce, cloud computing, and AI.',
    website: 'https://netconomy.net/',
    contactPerson: {
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@amazon.com',
      phone: '+1-555-0103'
    }
  },
  {
    name: 'SSI SCHÄFER',
    industry: 'Automotive/Energy',
    positions: ['Mechanical Engineer', 'Software Engineer', 'Battery Engineer', 'Manufacturing Engineer'],
    description: 'Electric vehicle and clean energy company accelerating sustainable transport and energy.',
    website: 'https://www.ssi-schaefer.com/en-de/',
    contactPerson: {
      name: 'David Kim',
      email: 'david.kim@tesla.com',
      phone: '+1-555-0104'
    }
  },
  {
    name: 'Beyond Now',
    industry: 'Technology',
    positions: ['iOS Developer', 'Hardware Engineer', 'Machine Learning Engineer', 'Design Engineer'],
    description: 'Technology company that designs and develops consumer electronics and software.',
    website: 'https://www.beyondnow.com/en/',
    contactPerson: {
      name: 'Lisa Wang',
      email: 'lisa.wang@apple.com',
      phone: '+1-555-0105'
    }
  },
  {
    name: 'ÖBB',
    industry: 'Social Media/Technology',
    positions: ['Frontend Developer', 'VR Engineer', 'Data Engineer', 'Content Moderator'],
    description: 'Social technology company connecting people through apps and immersive experiences.',
    website: 'https://www.oebb.at/en/',
    contactPerson: {
      name: 'Alex Thompson',
      email: 'alex.thompson@meta.com',
      phone: '+1-555-0106'
    }
  }
];

const seedCompanies = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing companies
    await Company.deleteMany({});
    console.log('Cleared existing companies');

    // Insert new companies
    const createdCompanies = await Company.insertMany(companies);
    console.log(`Created ${createdCompanies.length} companies`);

    console.log('Companies seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedCompanies();
}

module.exports = { seedCompanies, companies };