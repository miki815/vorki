import User from '../models/user';
import e, * as express from 'express';
import bcrypt from 'bcryptjs';
import { connection } from '../server';


export class UserController {

    login = (req: express.Request, res: express.Response) => {
        const { email, password } =  req.body;
        var sql = 'SELECT * FROM user WHERE email = ? and password = ?';
        connection.query(sql,[ email,  password], (err, user) => {
            if (err) { res.json({error: 1,  message: "Fatal error: " + err }); return; }
            if(user.length) {
                console.log('Login success');
                res.json({error: 0, message: user[0].id   });
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
                connection.query(sql, [username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email, "data:image/png;base64,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"],
                 (err, result) => {
                    if (err) { res.json({ message: "Fatal error: " + err }); return; }
                    console.log('Register success');
                    res.json({ message: "0" });
                });
            });


        });
    }


    getUserById = (req: express.Request, res: express.Response) => {
        const { id } =  req.body;
        var sql = 'SELECT username, firstname, lastname, birthday, phone, location, ulogaK, ulogaM, email, photo FROM user WHERE id = ?';
        connection.query(sql,[ id ], (err, user) => {
            if (err) { res.json({error: 1,  message: "Fatal error: " + err }); return; }
            if(user.length) {
                console.log('getUserById success');
                res.json({error: 0, message: user[0]  });
            }
            else { 
                console.log('getUserById failed');
                res.json({error: 1,  message: null }); 
            }
        });
    }

    addComment = (req: express.Request, res: express.Response) => {
        const { idUser, idCommentator, comment, dateC} =  req.body;
        var sql = 'INSERT INTO comments (idUser, idCommentator, comment, dateC) VALUES (?, ?, ?, ?)';
        connection.query(sql,[  idUser, idCommentator, comment, dateC ], (err, d) => {
            if (err) { res.json({error: 1,  message: "Fatal error: " + err });   console.log('addComment failed'); return; }
            res.json({error: 0});
            console.log('addComment success');
        });
    }

    getCommentById = (req: express.Request, res: express.Response) => {
        const { idUser } =  req.body;
        var sql = 'SELECT * FROM comments where idUser = ?';
        connection.query(sql,[ idUser ], (err, comments) => {
            if (err) { res.json({error: 1,  message: "Fatal error: " + err });   console.log('getCommentById failed'); return; }
            res.json({error: 0, message: comments});
            console.log('getCommentById success');
        });
    }

    deleteCommentById = (req: express.Request, res: express.Response) => {
        const { id } =  req.body;
        var sql = 'DELETE FROM comments where id = ?';
        connection.query(sql,[ id ], (err, comments) => {
            if (err) { res.json({error: 1,  message: "Fatal error: " + err });   console.log('deleteCommentById failed'); return; }
            res.json({error: 0});
            console.log('deleteCommentById success');
        });
    }

    rate = (req: express.Request, res: express.Response) => {
        const { idUser, idCommentator, rate} =  req.body;
        console.log(idUser + " " + idCommentator + " " + rate);
        var sql = 'SELECT * FROM rate WHERE idUser = ? and idCommentator = ?';
        connection.query(sql, [idUser, idCommentator], (err, data) => {
            console.log(data);
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                console.log('rate failed');
                return;
            }
            if (data.length) {
                sql = 'UPDATE rate SET rate = ? WHERE idUser = ? and idCommentator = ?';
                connection.query(sql, [rate, idUser, idCommentator], (err, data) => {
                    if (err) {
                        res.json({ error: 1, message: "Fatal error: " + err });
                        console.log('rate failed');
                        return;
                    }
                    res.json({ error: 0 });
                    console.log('rate success');
                });
            } else {
                sql = 'INSERT INTO rate (idUser, idCommentator, rate) VALUES (?, ?, ?)';
                connection.query(sql, [idUser, idCommentator, rate], (err, data) => {
                    if (err) {
                        res.json({ error: 1, message: "Fatal error: " + err });
                        console.log('rate failed');
                        return;
                    }
                    res.json({ error: 0 });
                    console.log('rate success');
                });
            }
        });
    }


    getRateByIdUser = (req: express.Request, res: express.Response) => {
        const { idUser } =  req.body;
        var sql = 'SELECT * FROM rate WHERE idUser = ?';
        connection.query(sql, [idUser], (err, data) => {
            console.log(data);
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                console.log('getRateByIdUser failed');
                return;
            }
            res.json({error: 0, message: data});
            
        });
    }

    getRateByIdUserAndRater = (req: express.Request, res: express.Response) => {
        const { idUser, idCommentator } =  req.body;
        var sql = 'SELECT rate FROM rate WHERE idUser = ? and idCommentator = ?';
        connection.query(sql, [idUser, idCommentator], (err, data) => {
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                console.log('getRateByIdUserAndRater failed');
                return;
            }
            res.json({error: 0, message: data});
            
        });
    }
    

}