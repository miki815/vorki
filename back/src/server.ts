import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import userRouter from './routers/user.router';
import jobRouter from './routers/job.router';

const app = express();
app.use(cors());
//app.use(bodyParser.json());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));


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

app.use('/users', userRouter);
app.use('/jobs', jobRouter);

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(4000, () => console.log(`Express server running on port 4000`));