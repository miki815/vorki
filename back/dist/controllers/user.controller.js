"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_1 = __importDefault(require("../models/user"));
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
    console.log('db connection ok ctr');
});
class UserController {
    constructor() {
        this.login = (req, res) => {
            let username = req.body.username;
            let password = req.body.password;
            user_1.default.findOne({ 'username': username, 'password': password })
                .then(user => {
                if (user)
                    res.json(user);
                else {
                    res.json(null);
                }
            })
                .catch(err => {
            });
        };
        this.register = (req, res) => {
            const { username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email } = req.body;
            // const hashedPassword = bcrypt.hash(password, 10); 
            const sql = 'INSERT INTO user (username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            connection.query(sql, [username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email], (err, result) => {
                if (err) {
                    console.error('Greška pri dodavanju korisnika:', err);
                    res.status(500).json({ error: 'Greška pri dodavanju korisnika' });
                    return;
                }
                console.log('register success');
                res.status(200).json({ message: 'ok' });
            });
        };
    }
}
exports.UserController = UserController;
