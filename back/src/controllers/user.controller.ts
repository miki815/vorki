import User from '../models/user';
import e, * as express from 'express';
import bcrypt from 'bcryptjs';
import { log } from 'console';

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
    console.log('db connection ok ctr');
});


export class UserController {

    login = (req: express.Request, res: express.Response) => {
        let username = req.body.username;
        let password = req.body.password;

        User.findOne({ 'username': username, 'password': password })
            .then(user => {
                if (user) res.json(user);
                else {
                    res.json(null);
                }
            })
            .catch(err => {
            });
    }



    register = (req: express.Request, res: express.Response) => {
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
    }


}