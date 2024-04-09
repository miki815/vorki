"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const server_1 = require("../server");
// const mysql = require('mysql2');
// const connection = mysql.createConnection({
//     host: 'localhost', 
//     user: 'root',      
//     password: 'miki',  
//     database: 'vorki'      
// });
// connection.connect((err) => {
//     if (err) {
//         console.error('db connection fail: ', err);
//         return;
//     }
//     console.log('db connection ok ctr');
// });
class UserController {
    constructor() {
        this.login = (req, res) => {
            const { email, password } = req.body;
            var sql = 'SELECT * FROM user WHERE email = ? and password = ?';
            server_1.connection.query(sql, [email, password], (err, user) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                if (user.length) {
                    console.log('Login success');
                    res.json({ error: 0, message: user });
                }
                else {
                    res.json({ error: 1, message: "Korisnik sa datim emailom i lozinkom ne postoji." });
                }
            });
        };
        this.register = (req, res) => {
            const { username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email } = req.body;
            // const hashedPassword = bcrypt.hash(password, 10); 
            var sql = 'SELECT * FROM user WHERE username = ?';
            server_1.connection.query(sql, [username], (err, result) => {
                if (err) {
                    res.json({ message: "Fatal error: " + err });
                    return;
                }
                if (result.length) {
                    res.json({ message: "Korisnik sa datim korisničkim imenom već postoji." });
                    return;
                }
                sql = 'SELECT * FROM user WHERE email = ?';
                server_1.connection.query(sql, [email], (err, result) => {
                    if (err) {
                        res.json({ message: "Fatal error: " + err });
                        return;
                    }
                    if (result.length) {
                        res.json({ message: "Korisnik sa datim email-om već postoji." });
                        return;
                    }
                    sql = 'INSERT INTO user (username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    server_1.connection.query(sql, [username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email], (err, result) => {
                        if (err) {
                            res.json({ message: "Fatal error: " + err });
                            return;
                        }
                        console.log('Register success');
                        res.json({ message: "0" });
                    });
                });
            });
        };
    }
}
exports.UserController = UserController;
