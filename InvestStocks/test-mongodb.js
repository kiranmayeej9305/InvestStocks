const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    console.log('\n⏳ Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');

    console.log('\n📊 Testing database operations:');
    const db = client.db('investstocks');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections:`, collections.map(c => c.name));

    // Test users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Users collection: ${userCount} documents`);

    // Test connection by pinging
    await db.admin().ping();
    console.log('🏓 Database ping successful');

    console.log('\n🎉 MongoDB connection test completed successfully!');

  } catch (error) {
    console.error('\n❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Possible solutions:');
      console.error('1. Check your MongoDB username and password');
      console.error('2. Ensure your IP address is whitelisted in MongoDB Atlas');
      console.error('3. Verify the connection string format');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.error('\n💡 Possible solutions:');
      console.error('1. Check your internet connection');
      console.error('2. Verify the cluster URL is correct');
      console.error('3. Ensure MongoDB Atlas cluster is running');
    }
    
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testMongoDBConnection();