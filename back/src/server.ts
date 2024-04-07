import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import userRouter from './routers/user.router';

const app = express();
app.use(cors());
app.use(bodyParser.json());
//app.use(bodyParser.json({ limit: '50mb' }));
//app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // Adresa MySQL servera
  user: 'root',      // Korisničko ime
  password: 'miki',  // Lozinka
  database: 'vorki'       // Ime baze podataka
});

connection.connect((err) => {
  if (err) {
    console.error('db connection fail: ', err);
    return;
  }
  console.log('db connection ok');
  connection.query('SELECT * FROM user', (err, results) => {
    if (err) {
      console.error('get user fail: ', err);
      return;
    }
    console.log('Users:', results);
  });
});

// module.exports = {connection};

app.use('/users', userRouter)

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(4000, () => console.log(`Express server running on port 4000`));