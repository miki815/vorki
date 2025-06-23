"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const job_router_1 = __importDefault(require("./routers/job.router"));
const web_push_1 = __importDefault(require("web-push"));
const subscription_router_1 = __importDefault(require("./routers/subscription.router"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
require('dotenv').config();
const publicVapidKey = 'BHTg9h9CX0rT_okcYjvkFRNXVFoPMSOVu99KjTfflvuMhz8iU8tgwzLfuglAQjTbBP6XgZT75JStZNHbX_rZ5Vg';
const privateVapidKey = 'R9O8MXmoFsxCDEl1SHnxCZrtLsc85TcVaHoPo1kSyIs';
const cookieParser = require('cookie-parser');
web_push_1.default.setVapidDetails('mailto:mmilenkovic815@gmail.com', publicVapidKey, privateVapidKey);
// BACKEND IMG STORAGE
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Lokacija gde će slike biti sačuvane
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, Date.now() + ext); // Jedinstven naziv fajla sa timestampom
    }
});
const upload = (0, multer_1.default)({ storage });
// SERVING APP
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['https://vorki.rs', 'http://localhost:4200', 'https://www.vorki.rs'],
    credentials: true
}));
app.use(body_parser_1.default.json({ limit: '100mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '100mb', extended: true }));
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
exports.pool = pool;
pool.getConnection((err, connection) => {
    if (err) {
        console.error('db connection fail: ', err);
        return;
    }
    console.log('db connection ok');
    logger.info('db connection ok');
    connection.release();
});
// APP ROUTES
app.post('/upload', upload.array('images', 10), (req, res) => {
    if (!req.files || !req.body.idUser) {
        return res.status(400).send('Nedostaju fajlovi ili ID posla.');
    }
    const idUser = req.body.idUser;
    const imagePaths = req.files.map(file => '/uploads/' + file.filename);
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
    const imagePaths = req.files.map(file => '/uploads/' + file.filename);
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
app.use(express_1.default.static(path_1.default.join(__dirname, 'notus-angular')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
logger.info('hello world');
app.use('/users', user_router_1.default);
app.use('/jobs', job_router_1.default);
app.use('/subscriptions', subscription_router_1.default);
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'notus-angular', 'index.html'));
});
// app.use('/', express.static("dist/notus-angular"));
app.listen(4000, () => logger.info(`Express server running on port 4000`));
