import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import userRouter from './routers/user.router';

const app = express();
app.use(cors());
app.use(bodyParser.json());


const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',      
  password: '',  
  database: 'vorki'       
});

connection.connect((err) => {
  if (err) {
    console.error('db connection fail: ', err);
    return;
  }
  console.log('db connection ok');
});

export { connection };

app.use('/users', userRouter)

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(4000, () => console.log(`Express server running on port 4000`));