
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path=require('path')


connectDB();

const app = express();

app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

// app.get('/', (req, res) => {
//     res.send('API Running');
// });

app.use('/api/users',require('./routes/api/users'));
app.use('/api/posts',require('./routes/api/posts'));
app.use('/api/profile',require('./routes/api/profile'));
app.use('/api/auth',require('./routes/api/auth'));

if(process.env.NODE_ENV === 'production'){
  app.use(express.static('client/build'))

  app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname, 'client','build','index.html'))
  })
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


