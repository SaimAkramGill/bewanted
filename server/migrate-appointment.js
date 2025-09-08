const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const migrateDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Drop old collections if they exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    if (collectionNames.includes('users')) {
      await mongoose.connection.db.dropCollection('users');
      console.log('✅ Dropped users collection');
    }

    if (collectionNames.includes('students')) {
      await mongoose.connection.db.dropCollection('students');
      console.log('✅ Dropped students collection');
    }

    // Drop appointments collection to recreate with new structure
    if (collectionNames.includes('appointments')) {
      await mongoose.connection.db.dropCollection('appointments');
      console.log('✅ Dropped old appointments collection');
    }

    // The new appointment model will create the collection with proper structure
    // when the first appointment is created

    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('  - Removed old users collection');
    console.log('  - Removed old students collection');
    console.log('  - Reset appointments collection for new structure');
    console.log('  - New appointments will include embedded student info');
    console.log('');
    console.log('🚀 Your application is now ready with the simplified structure!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateDatabase();