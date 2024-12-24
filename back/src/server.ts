import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import userRouter from './routers/user.router';
import jobRouter from './routers/job.router';
import webPush from 'web-push';

require('dotenv').config();
const publicVapidKey = 'BLrt-N6o0uHdZQa46XzurPIuZq822yuJBOuaVV4C-jVBURwIZsepPODSxZUaH0Bpl9s3HxGHpmxSjEgonCuu6rI';
const privateVapidKey = 'ahyu0EjJIGTv_i6UHTaIBDb02H2xoLaBy7eMD6LCrBY';

webPush.setVapidDetails('mailto:mmilenkovic815@gmail.com', publicVapidKey, privateVapidKey);

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
const logger = require('./logger');

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


app.post('/subscribe', (req, res) => {
  console.log("Subscribe called");
  const subscription = req.body;
  if (
    !subscription ||
    !subscription.endpoint ||
    !subscription.keys ||
    !subscription.keys.p256dh ||
    !subscription.keys.auth
  ) {
    console.error('Invalid subscription object:', subscription);
    return res.status(400).json({ error: 'Invalid subscription object' });
  }
  // Provera da li subskripcija već postoji
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection error:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    const queryCheck = 'SELECT id FROM subscriptions WHERE endpoint = ?';
    connection.query(queryCheck, [subscription.endpoint], (checkErr, rows) => {
      if (checkErr) {
        console.error('Error checking subscription:', checkErr);
        connection.release();
        return res.status(500).json({ error: 'Database query error' });
      }

      if (rows.length > 0) {
        // Ako subskripcija postoji, ažuriraj je
        console.log('Subscription already exists, updating...');
        const queryUpdate = `
          UPDATE subscriptions
          SET p256dh = ?, auth = ?, updated_at = CURRENT_TIMESTAMP
          WHERE endpoint = ?
        `;
        connection.query(
          queryUpdate,
          [subscription.keys.p256dh, subscription.keys.auth, subscription.endpoint],
          (updateErr) => {
            connection.release();
            if (updateErr) {
              console.error('Error updating subscription:', updateErr);
              return res.status(500).json({ error: 'Failed to update subscription' });
            }
            sendTestNotification(subscription, res);
          }
        );
      } else {
        // Ako subskripcija ne postoji, ubaci novu
        console.log('New subscription, inserting...');
        const queryInsert = `INSERT INTO subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)`;
        connection.query(queryInsert, [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
          (insertErr) => {
            connection.release();
            if (insertErr) {
              console.error('Error inserting subscription:', insertErr);
              return res.status(500).json({ error: 'Failed to save subscription' });
            }
            sendTestNotification(subscription, res);
          }
        );
      }
    });
  });
});

function sendTestNotification(subscription, res) {
  const payload = JSON.stringify({ title: 'Push Test', body: 'Push notification test' });
  webPush
    .sendNotification(subscription, payload)
    .then(() => {
      console.log('Notification sent successfully');
      res.status(200).json({ message: 'Subscription saved and notification sent successfully' });
    })
    .catch((error) => {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification', details: error.message });
    });
}



logger.info('hello world')
app.use('/users', userRouter);
app.use('/jobs', jobRouter);

app.use('/', express.static("dist/notus-angular"));

app.listen(4000, () => logger.info(`Express server running on port 4000`));