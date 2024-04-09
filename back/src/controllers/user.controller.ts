import User from '../models/user';
import e, * as express from 'express';
import bcrypt from 'bcryptjs';
import { log } from 'console';
import { connection } from '../server';


export class UserController {

    login = (req: express.Request, res: express.Response) => {
        const { email, password } =  req.body;
        var sql = 'SELECT * FROM user WHERE email = ? and password = ?';
        connection.query(sql,[ email,  password], (err, user) => {
            if (err) { res.json({error: 1,  message: "Fatal error: " + err }); return; }
            if(user.length) {
                console.log('Login success');
                res.json({error: 0, message: user  });
            }
            else { 
                res.json({error: 1,  message: "Korisnik sa datim emailom i lozinkom ne postoji." }); 
            }
        });
    }

    register = (req: express.Request, res: express.Response) => {
        const { username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email } = req.body;
        // const hashedPassword = bcrypt.hash(password, 10); 

        var sql = 'SELECT * FROM user WHERE username = ?';
        connection.query(sql,[username], (err, result) => {
            if (err) { res.json({ message: "Fatal error: " + err }); return; }
            if(result.length){ res.json({ message: "Korisnik sa datim korisničkim imenom već postoji."  }); return;}

            sql = 'SELECT * FROM user WHERE email = ?';
            connection.query(sql,[email], (err, result) => {
             
                if (err) { res.json({ message: "Fatal error: " + err }); return; }
                if(result.length){res.json({ message: "Korisnik sa datim email-om već postoji."  }); return;}
                
                sql = 'INSERT INTO user (username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                connection.query(sql, [username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email], (err, result) => {
                    if (err) { res.json({ message: "Fatal error: " + err }); return; }
                    console.log('Register success');
                    res.json({ message: "0" });
                });
            });


        });

       

       
    }


}