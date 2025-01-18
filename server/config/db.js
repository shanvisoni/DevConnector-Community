


const mongoose = require('mongoose');


const connectDB = async () => {
  console.log('MONGO_URI:', process.env.MONGO_URI); 
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DB_NAME  // Specify the database name here
          
        });
        // console.log(`Connected to MongoDB Database at ${conn.connection.host}`.green);
    } catch (error) {
        // console.log(`Error in MongoDB ${error}`.bgRed.white);
    }
}

module.exports = connectDB;

