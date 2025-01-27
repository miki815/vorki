import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import userRouter from './routers/user.router';
import jobRouter from './routers/job.router';
import webPush from 'web-push';
import { log } from 'console';
import { connection } from 'mongoose';
import subscriptionRouter from './routers/subscription.router';

require('dotenv').config();
const publicVapidKey = 'BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg';
const privateVapidKey = 'R9O8MXmoFsxCDEl1SHnxCZrtLsc85TcVaHoPo1kSyIs';

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
  logger.info('Subscription object details: ' + JSON.stringify(subscription));
  logger.info('Subscription object details: ' + subscription.endpoint);
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

app.post('/save-subscription', (req, res) => {
  const { user_id, endpoint, p256dh, auth } = req.body;
  console.log('Subscription data:', req.body);

  if (!endpoint || !p256dh || !auth) {
    return res.status(400).json({ error: 'Missing subscription data' });
  }

  // Dohvatanje konekcije iz pool-a
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Greška prilikom dohvatanja konekcije:', err);
      return res.status(500).json({ error: 'Greška na serveru.' });
    }

    // Provera da li pretplata već postoji
    connection.query(
      'SELECT * FROM subscriptions WHERE endpoint = ?',
      [endpoint],
      (err, results) => {
        if (err) {
          console.error('Greška prilikom pretrage pretplate:', err);
          connection.release(); // Oslobađanje konekcije
          return res.status(500).json({ error: 'Greška na serveru.' });
        }

        if (results.length > 0) {
          // Pretplata već postoji
          connection.release(); // Oslobađanje konekcije
          logger.info('Korisnik je vec pretplacen.');
          return res.status(200).json({ message: 'Korisnik je već pretplaćen.' });
        }

        // Ako pretplata ne postoji, sačuvajte je
        logger.info('Čuvanje pretplate...');
        const query = `
          INSERT INTO subscriptions (user_id, endpoint, p256dh, auth)
          VALUES (?, ?, ?, ?)
        `;
        const values = [user_id, endpoint, p256dh, auth];

        connection.query(query, values, (err) => {
          connection.release(); // Oslobađanje konekcije

          if (err) {
            console.error('Greška prilikom čuvanja pretplate:', err);
            return res.status(500).json({ error: 'Failed to save subscription' });
          }

          console.info('Pretplata uspešno sačuvana, user_id:', user_id);
          res.status(200).json({ message: 'Pretplata uspešno sačuvana.' });
        });
      }
    );
  });
});


app.post('/trigger-event', (req, res) => {
  const { eventData } = req.body;
  pool.getConnection((err, connection) => {

    const query = `SELECT endpoint, p256dh, auth FROM subscriptions`;
    connection.query(query, (err, results) => {
      if (err) {
        logger(req, res).error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch subscriptions' });
      }

      const payload = JSON.stringify({ title: 'Poruka', body: 'Miki Miki Miki' });

      results.forEach((subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        webPush
          .sendNotification(pushSubscription, payload)
          .then(() => logger.info('Notification sent successfully'))
          .catch((err) => logger.error('Notification error:', err));
      });

      res.status(200).json({ message: 'Notifications triggered' });
    });
  });
});

function sendTestNotification(subscription, res) {
  logger.info('Sending test notification...');
  const payload = JSON.stringify({ title: 'Push Test', body: 'Push notification testtt' });
  webPush
    .sendNotification(subscription, payload)
    .then(() => {
      logger.info('Notification sent successfully');
      res.status(200).json({ message: 'Subscription saved and notification sent successfully' });
    })
    .catch((error) => {
      logger.error('Failed to send notification:', error);
      res.status(500).json({ error: 'Failed to send notification', details: error.message });
    });
}



logger.info('hello world')
app.use('/users', userRouter);
app.use('/jobs', jobRouter);
app.use('/subscriptions', subscriptionRouter);

app.use('/', express.static("dist/notus-angular"));

app.listen(4000, () => logger.info(`Express server running on port 4000`));