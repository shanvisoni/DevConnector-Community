// const mongoose = require('mongoose');
// const config = require('config');
// const db = config.get('uri');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(db);

//     console.log('MongoDB Connected...');
//   } catch (err) {
//     console.error(err.message);
//     // Exit process with failure
//     process.exit(1);
//   }
// };

// module.exports = connectDB;


const mongoose = require('mongoose');


const connectDB = async () => {
  console.log('MONGO_URI:', process.env.MONGO_URI); 
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DB_NAME,  // Specify the database name here
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // console.log(`Connected to MongoDB Database at ${conn.connection.host}`.green);
    } catch (error) {
        // console.log(`Error in MongoDB ${error}`.bgRed.white);
    }
}

module.exports = connectDB;

