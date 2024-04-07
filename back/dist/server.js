"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
//app.use(bodyParser.json({ limit: '50mb' }));
//app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost', // Adresa MySQL servera
    user: 'root', // Korisničko ime
    password: 'miki', // Lozinka
    database: 'vorki' // Ime baze podataka
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
app.use('/users', user_router_1.default);
app.get('/', (req, res) => res.send('Hello World!'));
app.listen(4000, () => console.log(`Express server running on port 4000`));
