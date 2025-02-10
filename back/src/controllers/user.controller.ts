import User from '../models/user';
import e, * as express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../server';
import nodemailer from 'nodemailer'
import crypto from 'crypto';
import ResetToken from '../models/reset_token'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'moj_tajni_kljuc';
const logger = require('../logger');
const moment = require('moment');
const jwt = require('jsonwebtoken');
function generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, 'tajni_kljuc', { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'tajni_kljuc', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}


export class UserController {

    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    login = (req: express.Request, res: express.Response) => {
        console.log("Login");
        const { email, password } = req.body;
        var sql = 'SELECT * FROM user WHERE email = ?';

        pool.query(sql, [email], async (err, user) => {
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                logger.error('Login error: ' + err);
                return;
            }
            if (user.length && (await this.verifyPassword(password, user[0].password))) {
                console.log('Login success');
                logger.info('Login success');
                const token = jwt.sign({ userId: user[0].id } , SECRET_KEY, { expiresIn: '1h' });
                // res.json({ error: 0, id: user[0].id });
                console.log(token);
                res.cookie('httpToken', token, {
                    httpOnly: true,
                    //secure: process.env.NODE_ENV === 'production' // Uključi samo u produkciji
                });

                res.json({ error: 0, message: "Uspešna prijava", token: token, userId: user[0].id });
            } else { res.json({ error: 1, message: "Korisnik sa datim emailom i lozinkom ne postoji." }); }
        });
    }

    register = (req: express.Request, res: express.Response) => {
        const { username, firstname, lastname, password, birthday, phone, location, type, email, backPhoto, selectedProfessions } = req.body;
        var sql = 'SELECT * FROM user WHERE username = ?';
        logger.info("selected professions: " + selectedProfessions);

        pool.query(sql, [username], (err, result) => {
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                logger.error('Register error:', err);
                return;
            }
            if (result.length) { res.json({ error: 1, message: "Korisnik sa datim korisničkim imenom već postoji." }); return; }

            sql = 'SELECT * FROM user WHERE email = ?';
            pool.query(sql, [email], (err, result) => {

                if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
                if (result.length) { res.json({ error: 1, message: "Korisnik sa datim email-om već postoji." }); return; }

                sql = 'INSERT INTO user (username, firstname, lastname, password, birthday, phone, location, type, email, backPhoto ,photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                pool.query(sql, [username, firstname, lastname, password, birthday, phone, location, type, email, backPhoto, "data:image/png;base64,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"],
                    (err, result) => {
                        if (err) {
                            res.json({ error: 1, message: "Fatal error: " + err });
                            logger.error('Register error: ' + err);
                            return;
                        }
                        const idUser = result.insertId;
                        logger.info('idUser reg: ' + idUser);

                        selectedProfessions.forEach((profession: any) => {
                            sql = 'INSERT INTO job (idUser, profession, city, type) VALUES (?, ?, ?, ?)';
                            pool.query(sql, [idUser, profession, location, type], (err, result) => {
                                if (err) {
                                    res.json({ error: 1, message: "Fatal error: " + err });
                                    logger.error('Register error: ' + err);
                                    return;
                                }
                                else logger.info('Profession ' + profession + ' added to user ' + idUser);
                            });
                        });
                        res.json({ error: 0, idUser: idUser });
                    });
            });


        });
    }

    getUserById = (req: express.Request, res: express.Response) => {
        const { id } = req.body;
        var sql = 'SELECT username, firstname, lastname, birthday, phone, location, email, photo, backPhoto, type, instagram, facebook FROM user WHERE id = ?';
        pool.query(sql, [id], (err, user) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            if (user.length) {
                console.log('getUserById success');
                res.json({ error: 0, message: user[0] });
            }
            else {
                console.log('getUserById failed');
                res.json({ error: 1, message: null });
            }
        });
    }

    addComment = (req: express.Request, res: express.Response) => {
        const { idUser, idCommentator, comment, dateC, jobId } = req.body;
        let convertedDate = moment(dateC).format('YYYY-MM-DD HH:mm:ss');
        console.log(idUser + " " + idCommentator + " " + comment + " " + dateC + " " + jobId);
        var sql = 'INSERT INTO comments (idUser, idCommentator, comment, dateC, jobId) VALUES (?, ?, ?, ?, ?)';
        pool.query(sql, [idUser, idCommentator, comment, convertedDate, jobId], (err, d) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('addComment failed', err); return; }
            res.json({ error: 0 });
            console.log('addComment success');
        });
    }

    getCommentById = (req: express.Request, res: express.Response) => {
        const { idUser } = req.body;
        var sql = 'SELECT * FROM comments where idUser = ?';
        pool.query(sql, [idUser], (err, comments) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('getCommentById failed'); return; }
            res.json({ error: 0, message: comments });
            console.log('getCommentById success');
        });
    }

    getCommentsByJobId = (req: express.Request, res: express.Response) => {
        const { jobId } = req.body;
        var sql = 'SELECT * FROM comments where jobId = ?';
        // console.log(jobId);
        pool.query(sql, [jobId], (err, comments) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('getCommentByIdJob failed'); return; }
            res.json({ error: 0, message: comments });
            console.log('getCommentByIdJob success');
        });
    }


    deleteCommentById = (req: express.Request, res: express.Response) => {
        const { id } = req.body;
        var sql = 'DELETE FROM comments where id = ?';
        pool.query(sql, [id], (err, comments) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('deleteCommentById failed'); return; }
            res.json({ error: 0 });
            console.log('deleteCommentById success');
        });
    }

    rate = (req: express.Request, res: express.Response) => {
        const { idUser, idRater, rate } = req.body;
        console.log(idUser + " " + idRater + " " + rate);
        var sql = 'SELECT * FROM rate WHERE idUser = ? and idRater = ?';
        pool.query(sql, [idUser, idRater], (err, data) => {
            console.log(data);
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                console.log('rate failed');
                return;
            }
            if (data.length) {
                sql = 'UPDATE rate SET rate = ? WHERE idUser = ? and idRater = ?';
                pool.query(sql, [rate, idUser, idRater], (err, data) => {
                    if (err) {
                        res.json({ error: 1, message: "Fatal error: " + err });
                        console.log('rate failed');
                        return;
                    }
                    res.json({ error: 0 });
                    console.log('rate success');
                });
            } else {
                sql = 'INSERT INTO rate (idUser, idRater, rate) VALUES (?, ?, ?)';
                pool.query(sql, [idUser, idRater, rate], (err, data) => {
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
        const { idUser } = req.body;
        var sql = 'SELECT * FROM rate WHERE idUser = ?';
        pool.query(sql, [idUser], (err, data) => {
            console.log(data);
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                console.log('getRateByIdUser failed');
                return;
            }
            res.json({ error: 0, message: data });

        });
    }

    getRateByIdUserAndRater = (req: express.Request, res: express.Response) => {
        const { idUser, idRater } = req.body;
        var sql = 'SELECT rate FROM rate WHERE idUser = ? and idRater = ?';
        pool.query(sql, [idUser, idRater], (err, data) => {
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                console.log('getRateByIdUserAndRater failed');
                return;
            }
            res.json({ error: 0, message: data });
        });
    }

    getGalleryById = (req: express.Request, res: express.Response) => {
        const { idUser } = req.body;
        console.log(idUser);
        var sql = 'SELECT * FROM gallery where idUser = ?';
        pool.query(sql, [idUser], (err, comments) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('getGalleryById failed'); return; }
            console.log(comments);
            res.json({ error: 0, message: comments });
            console.log('getGalleryById success');
        });
    }

    changePassword = (req: express.Request, res: express.Response) => {
        const { idUser, password, newPassword } = req.body;
        var sql = 'UPDATE user SET password = ? WHERE id = ? and password = ?';
        pool.query(sql, [newPassword, idUser, password], (err, comments) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('changePassword failed'); return; }
            res.json({ error: 0, message: comments });
            console.log('changePassword success');
        });
    }

    updateGallery = (req: express.Request, res: express.Response) => {
        const { idUser, images } = req.body;
        var sql = 'DELETE FROM gallery WHERE idUser = ?';
        pool.query(sql, [idUser], (err, comments) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('updateGallery failed'); return; }
            images.forEach(element => {
                var sql1 = 'INSERT INTO gallery(idUser,urlPhoto) VALUES(?,?)';
                pool.query(sql1, [idUser, element], (err, comments) => {
                    if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('updateGallery failed'); return; }
                });
            });
        });
    }

    getIdByEmail = (req: express.Request, res: express.Response) => {
        const { email } = req.body;
        var sql = 'SELECT id FROM user WHERE email LIKE ?';
        pool.query(sql, [email], (err, id) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('getIdByEmail failed'); return; }
            res.json({ error: 0, message: id });
            console.log('getIdByEmail success');
        });
    }

    getIdByUsername = (req: express.Request, res: express.Response) => {
        const { username } = req.body;
        var sql = 'SELECT id FROM user WHERE username LIKE ?';
        pool.query(sql, [username], (err, id) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); console.log('getIdByUsername failed'); return; }
            console.log("ID: " + id);
            res.json({ error: 0, message: id });
            console.log('getIdByUsername success');
        });
    }

    updateUser = (req: express.Request, res: express.Response) => {
        const { idUser, username, email, firstname, lastname, birthday, location, phone, backPhoto, photo, distance } = req.body;
        console.log(username)
        var sql = 'UPDATE user SET username=?, email=?, firstname=?, lastname=?, birthday=?, location=?, phone=?, photo=?, backPhoto = ?, distance = ? WHERE id=?';
        pool.query(sql, [username, email, firstname, lastname, birthday, location, phone, photo, backPhoto, distance, idUser], (err, message) => {
            if (err) {
                res.json({ error: 1, message: message });
                console.log('updateUser failed');
                logger.error('updateUser failed: ' + err);
                return;
            }
            res.json({ error: 0, message: message });
            console.log('updateUser success');
            logger.info('updateUser with id ' + idUser + ' success');
        });
    }


    forgotPasswordRequest = (req: express.Request, res: express.Response) => {
        let expire_time = new Date();
        expire_time.setMinutes(expire_time.getMinutes() + 30);

        let reset_token = new ResetToken({
            token: crypto.randomBytes(16).toString('hex'),
            email: req.body.email, expire_time: expire_time
        });

        var query = 'SELECT Id FROM user WHERE email = ?';
        pool.query(query, [req.body.email], (err, results) => {
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                return;
            }
            if (results.length != 1) { res.json({ error: 1 }); return; }
            query = 'DELETE FROM resettoken WHERE email = ? ';
            pool.query(query, [req.body.email], (err) => {
                if (err) {
                    // console.error('Error inserting token into the database:', err);
                    // res.status(400).json({ 'message': 'error' });
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                query = 'INSERT INTO resettoken (token, email, expire_time) VALUES (?, ?, ?)';
                pool.query(query, [reset_token.token, req.body.email, expire_time], (err) => {
                    if (err) {
                        // console.error('Error inserting token into the database:', err);
                        // res.status(400).json({ 'message': 'error' });
                        res.json({ error: 1, message: "Fatal error: " + err });
                        return;
                    }
                    console.log("Token saved in database");
                    var nodemailer = require('nodemailer');
                    var transporter = nodemailer.createTransport({
                        service: 'outlook',
                        auth: {
                            user: "vorkisupp@outlook.com",
                            pass: 'mikineca2000'
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });
                    var mailOptions = {
                        from: "vorkisupp@outlook.com",
                        to: req.body.email,
                        subject: 'Password change',
                        text: `http://localhost:4200/autentikacija/promena_zaboravljene_lozinke/${reset_token.token}`
                    };

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.log(err);
                            res.json({ error: 1, message: "Fatal error: " + err });
                            return
                        }
                        console.log('Email sent: ' + info.response);
                        res.json({ error: 0 });
                    });
                });
            });
        });





        // var transporter = nodemailer.createTransport({
        //     service: 'hotmail',
        //     auth: {
        //         user: 'email here',
        //         pass: 'password here'
        //     }
        // });
        // var mailOptions = {
        //     from: 'email here',
        //     to: req.body.email,
        //     subject: 'Promena lozinke',
        //     text: `http://localhost:4200/auth/promena_zaboravljene_lozinke/${reset_token.token}`
        // };
        // console.log('Sending mail to: ' + req.body.email + ' for password reset');
        // transporter.sendMail(mailOptions, function (error, _) {
        //     if (error) { console.log(error); res.send(error) }
        //     else res.status(200).json({ 'message': 'poruka poslata' });
        // })
    }


    tokenValidation = (req: express.Request, res: express.Response) => {
        // console.log(token);
        let token = req.body.token;
        const query = 'SELECT * FROM ResetToken WHERE token = ?';
        pool.query(query, [token], (err, results) => {
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                console.log('tokenValidation failed');
                return;
            }
            if (results.length > 0) {
                const foundToken = results[0];
                if (new Date() > foundToken.expire_time) { res.json({ error: 1, message: "Vreme za izmenu lozinke je isteklo." }); return; }
                res.json({ error: 0, 'email': foundToken.email });
            }
            else {
                res.json({ error: 2 });
                console.log('tokenValidation failed');
                return;
            }
            console.log('tokenValidation success');
        });
    }

    changeForgottenPassword = (req: express.Request, res: express.Response) => {
        let email = req.body.email;
        let password = req.body.password;
        console.log("Changing forgotten password for email: " + email);

        const searchQuery = 'SELECT * FROM user WHERE email = ?';
        pool.query(searchQuery, [email], (err, results) => {
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                console.log('changeForgottenPassword failed');
                return;
            }
            if (results.length > 0) {
                const updateQuery = 'UPDATE user SET password = ? WHERE email = ?';
                pool.query(updateQuery, [password, email], (err) => {
                    if (err) {
                        res.json({ error: 1, message: "Fatal error: " + err });
                        console.log('changeForgottenPassword failed');
                        return;
                    }
                    const deleteQuery = 'DELETE FROM resettoken WHERE email = ?';
                    pool.query(deleteQuery, [email], (err) => {
                        if (err) {
                            res.json({ error: 1, message: "Fatal error: " + err });
                            console.log('changeForgottenPassword failed');
                            return;
                        }
                    });
                    res.json({ error: 0 });
                });
            }
        });
    }

    getTop5masters = (req: express.Request, res: express.Response) => {
        console.log('Getting top 5 masters')
        const sql = `
      SELECT u.*, averageRate
      FROM (
          SELECT idUser, AVG(CAST(rate AS DECIMAL)) as averageRate
          FROM rate
          GROUP BY idUser
          ORDER BY averageRate DESC
          LIMIT 5
      ) as topUsers
      JOIN user u ON u.id = topUsers.idUser;
    `;
        pool.query(sql, (err, users) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            if (users.length) {
                console.log('Getting top 5 masters success');
                res.json({ error: 0, top5: users });
            }
            else {
                console.log('Getting top 5 masters failed');
                res.json({ error: 1, message: null });
            }
        });
    }

    support = async (req: express.Request, res: express.Response) => {
        var text = req.body.message + "\n\n\n" + "FROM: " + req.body.contact + " - " + req.body.nameAndSurname
        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: "vorkisupp@outlook.com",
                pass: 'mikineca2000'
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        var mailOptions = {
            from: "vorkisupp@outlook.com",
            to: "vorkisupp@outlook.com",
            subject: 'Support',
            text: text
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.json({ error: 1 });
                return;
            } else {
                console.log('Email sent: ' + info.response);
                res.json({ error: 0 });
            }
        });
    }

    verifyUser = (req: express.Request, res: express.Response) => {
        const { routeId, token } = req.body;

        // const token = req.cookies.token;  // Token dohvatamo iz cookie-ja
        // console.log("Token: " + token);
        if (!token) {
            return res.status(401).json({ authorized: false, message: "No token provided" });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);
            console.log(routeId);
            if (decoded.userId == routeId) {  
                console.log("Authorized user");
                return res.json({ authorized: true });
            } else {
                console.log("Unauthorized user");
                return res.json({ authorized: false, message: "Unauthorized user" });
            }
        } catch (error) {
            return res.status(401).json({ authorized: false, message: "Invalid token" });
        }
    };


}