import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB Connection Error Details:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    
    // Specific error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n🔴 Connection refused! This might be due to:');
      console.error('1. Your IP address is not whitelisted in MongoDB Atlas');
      console.error('2. Network/firewall blocking the connection');
      console.error('3. VPN/proxy interfering with the connection');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n🔴 Authentication failed! Check your username and password');
    } else if (error.message.includes('getaddrinfo')) {
      console.error('\n🔴 Cannot resolve hostname! Check your connection string');
    }
    
    process.exit(1);
  }
};

export default connectDB;