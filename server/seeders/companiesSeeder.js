const mongoose = require('mongoose');
const Company = require('../models/Company');
const dotenv = require('dotenv');

dotenv.config();

const companies = [
  {
    name: 'Google',
    industry: 'Technology',
    positions: ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer'],
    description: 'Leading technology company focused on search, cloud computing, and artificial intelligence.',
    website: 'https://www.google.com',
    contactPerson: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@google.com',
      phone: '+1-555-0101'
    }
  },
  {
    name: 'Microsoft',
    industry: 'Technology',
    positions: ['Cloud Engineer', 'Software Developer', 'Azure Specialist', 'AI Engineer'],
    description: 'Global technology company developing software, services, devices and solutions.',
    website: 'https://www.microsoft.com',
    contactPerson: {
      name: 'Mike Chen',
      email: 'mike.chen@microsoft.com',
      phone: '+1-555-0102'
    }
  },
  {
    name: 'Amazon',
    industry: 'E-commerce/Cloud',
    positions: ['DevOps Engineer', 'Business Analyst', 'Solutions Architect', 'Operations Manager'],
    description: 'Multinational technology company focusing on e-commerce, cloud computing, and AI.',
    website: 'https://www.amazon.com',
    contactPerson: {
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@amazon.com',
      phone: '+1-555-0103'
    }
  },
  {
    name: 'Tesla',
    industry: 'Automotive/Energy',
    positions: ['Mechanical Engineer', 'Software Engineer', 'Battery Engineer', 'Manufacturing Engineer'],
    description: 'Electric vehicle and clean energy company accelerating sustainable transport and energy.',
    website: 'https://www.tesla.com',
    contactPerson: {
      name: 'David Kim',
      email: 'david.kim@tesla.com',
      phone: '+1-555-0104'
    }
  },
  {
    name: 'Apple',
    industry: 'Technology',
    positions: ['iOS Developer', 'Hardware Engineer', 'Machine Learning Engineer', 'Design Engineer'],
    description: 'Technology company that designs and develops consumer electronics and software.',
    website: 'https://www.apple.com',
    contactPerson: {
      name: 'Lisa Wang',
      email: 'lisa.wang@apple.com',
      phone: '+1-555-0105'
    }
  },
  {
    name: 'Meta',
    industry: 'Social Media/Technology',
    positions: ['Frontend Developer', 'VR Engineer', 'Data Engineer', 'Content Moderator'],
    description: 'Social technology company connecting people through apps and immersive experiences.',
    website: 'https://www.meta.com',
    contactPerson: {
      name: 'Alex Thompson',
      email: 'alex.thompson@meta.com',
      phone: '+1-555-0106'
    }
  },
  {
    name: 'Netflix',
    industry: 'Entertainment/Technology',
    positions: ['Backend Engineer', 'Content Analyst', 'Streaming Engineer', 'Data Scientist'],
    description: 'Streaming entertainment service with TV series, documentaries and feature films.',
    website: 'https://www.netflix.com',
    contactPerson: {
      name: 'Maria Garcia',
      email: 'maria.garcia@netflix.com',
      phone: '+1-555-0107'
    }
  },
  {
    name: 'Spotify',
    industry: 'Music/Technology',
    positions: ['Audio Engineer', 'ML Engineer', 'Mobile Developer', 'Music Analyst'],
    description: 'Audio streaming and media services provider with music and podcast content.',
    website: 'https://www.spotify.com',
    contactPerson: {
      name: 'James Wilson',
      email: 'james.wilson@spotify.com',
      phone: '+1-555-0108'
    }
  },
  {
    name: 'Uber',
    industry: 'Transportation/Technology',
    positions: ['Mobile Developer', 'Operations Manager', 'Map Engineer', 'Safety Analyst'],
    description: 'Technology platform connecting riders with drivers for transportation services.',
    website: 'https://www.uber.com',
    contactPerson: {
      name: 'Rachel Brown',
      email: 'rachel.brown@uber.com',
      phone: '+1-555-0109'
    }
  },
  {
    name: 'Airbnb',
    industry: 'Hospitality/Technology',
    positions: ['Full Stack Developer', 'Design Engineer', 'Trust & Safety Specialist', 'Community Manager'],
    description: 'Online marketplace for lodging and tourism experiences around the world.',
    website: 'https://www.airbnb.com',
    contactPerson: {
      name: 'Kevin Lee',
      email: 'kevin.lee@airbnb.com',
      phone: '+1-555-0110'
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