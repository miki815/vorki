import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import userRouter from './routers/user.router';
import jobRouter from './routers/job.router';
import webPush from 'web-push';
import subscriptionRouter from './routers/subscription.router';
import path from 'path';
import multer from 'multer'

declare module 'express-serve-static-core' {
  interface Request {
    files?: Express.Multer.File[];
    file?: Express.Multer.File;
  }
}


require('dotenv').config();
const publicVapidKey = 'BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg';
const privateVapidKey = 'R9O8MXmoFsxCDEl1SHnxCZrtLsc85TcVaHoPo1kSyIs';
const cookieParser = require('cookie-parser');


webPush.setVapidDetails('mailto:mmilenkovic815@gmail.com', publicVapidKey, privateVapidKey);

// BACKEND IMG STORAGE

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Lokacija gde će slike biti sačuvane
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);  // Jedinstven naziv fajla sa timestampom
  }
});

const upload = multer({ storage });

// SERVING APP

const app = express();

app.use(cors({
  origin: ['https://vorki.rs', 'http://localhost:4200', 'https://www.vorki.rs'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
const logger = require('./logger');

app.use(cookieParser());

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('db connection fail: ', err);
    return;
  }
  console.log('db connection ok');
  logger.info('db connection ok')
  connection.release();
});

export { pool };


// APP ROUTES

app.post('/upload', upload.array('images', 10), (req, res) => {
  if (!req.files || !req.body.idUser) {
    return res.status(400).send('Nedostaju fajlovi ili ID posla.');
  }

  const idUser = req.body.idUser;
  const imagePaths = (req.files as Express.Multer.File[]).map(file => '/uploads/' + file.filename);

  // const insertQuery = 'INSERT INTO gallery (idJob, urlPhoto) VALUES ?';
  const insertQuery = 'INSERT INTO gallery (idUser, urlPhoto) VALUES ?';
  const values = imagePaths.map(path => [idUser, path]);
  pool.getConnection((err, connection) => {
    connection.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.error('Greška pri unosu u bazu:', err);
        return res.status(500).json({ error: 'Greška pri čuvanju podataka u bazi.' });
      }

      res.status(201).json({
        message: 'Uspešno sačuvano!',
        data: {
          idUser: idUser,
          images: imagePaths,
        }
      });
    });
  });
});


// INSERT PICTURES FOR JOBS
app.post('/uploadJobPictures', upload.array('images', 10), (req, res) => {
  if (!req.files || !req.body.idJob) {
    return res.status(400).send('Nedostaju fajlovi ili ID posla.');
  }

  const idJob = req.body.idJob;
  const imagePaths = (req.files as Express.Multer.File[]).map(file => '/uploads/' + file.filename);

  const insertQuery = 'INSERT INTO gallery (idJob, urlPhoto) VALUES ?';
  const values = imagePaths.map(path => [idJob, path]);
  pool.getConnection((err, connection) => {
    connection.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.error('Greška pri unosu u bazu:', err);
        return res.status(500).json({ error: 'Greška pri čuvanju podataka u bazi.' });
      }
      res.status(201).json({
        message: 'Uspešno sačuvano!',
        data: {
          idJob: idJob,
          images: imagePaths,
        }
      });
    });
  });
});




app.use(express.static(path.join(__dirname, 'notus-angular')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


logger.info('hello world')
app.use('/users', userRouter);
app.use('/jobs', jobRouter);
app.use('/subscriptions', subscriptionRouter);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'notus-angular', 'index.html'));
});

// app.use('/', express.static("dist/notus-angular"));

app.listen(4000, () => logger.info(`Express server running on port 4000`));