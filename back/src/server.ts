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

// const pino = require('pino-http')()
const pino = require('pino');
const pinoHttp = require('pino-http');
// const { tmpdir } = require('node:os')
// const { join } = require('node:path')

// const file = join(tmpdir(), `pino-${process.pid}-example`)

const app = express();

const transport = pino.transport({
  targets: [{
    level: 'warn',
    target: 'pino/file',
    options: {
      destination: 'pino.log'
    }
    /*
  }, {
    level: 'info',
    target: 'pino-elasticsearch',
    options: {
      node: 'http://localhost:9200'
    }
    */
  }, {
    level: 'info',
    target: 'pino-pretty'
  }]
})

const logger = pino(transport)

app.use(cors());
app.use(pino);
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    console.error('Invalid subscription object:', subscription);
    return res.status(400).json({ error: 'Invalid subscription object' });
  }
  console.log("Subscription: " + subscription);
  const payload = JSON.stringify({ title: 'Push Test', body: 'Push notification test' });
  webPush.sendNotification(subscription, payload)
    .then(() => {
      console.log('Notification sent successfully');
      res.status(200).json({ message: '0' });
    })
    .catch(error => {
      console.error('Error sending notification:', error);
      res.status(500).json({ message: 'Error sending notification', error: error.message });
    });
});


const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

connection.connect((err) => {
  if (err) {
    console.error('db connection fail: ', err);
    return;
  }
  console.log('db connection ok');
  logger.info('hello world')
  logger.error('this is at error level')
  logger.info('the answer is %d', 42)
  logger.info({ obj: 42 }, 'hello world')
  logger.info({ obj: 42, b: 2 }, 'hello world')
  logger.info({ nested: { obj: 42 } }, 'nested')
  logger.warn('WARNING!')
  setImmediate(() => {
    logger.info('after setImmediate')
  })
  logger.error(new Error('an error'))
});

export { connection };

app.use('/users', userRouter);
app.use('/jobs', jobRouter);

app.use('/', express.static("dist/notus-angular"));
app.listen(4000, () => console.log(`Express server running on port 4000`));