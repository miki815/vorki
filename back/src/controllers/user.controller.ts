import User from '../models/user';
import e, * as express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../server';
import nodemailer from 'nodemailer'
import crypto from 'crypto';
import ResetToken from '../models/reset_token'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Joi from 'joi';


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

function databaseFatalError(res, err, msg) {
    logger.error({ err }, msg);
    return res.json({ error: 1, message: "Fatal error: " + err });
}

const transporter = nodemailer.createTransport({
    host: "mail.vorki.rs",  // SMTP server tvog provajdera
    port: 465,  // 587 za STARTTLS, 465 za SSL
    secure: true,  // true za port 465, false za 587
    auth: {
        user: "support@vorki.rs",
        pass: process.env.SUPPORT_EMAIL_PASSWORD
    }
});

//const uri = 'http://localhost:4200'
const uri = 'https://vorki.rs';

export class UserController {

    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    login = (req: express.Request, res: express.Response) => {
        /**
         * @param {string} emailOrUsername - user email or username
         * @param {string} password - user password
         * @returns {json} - success or error message
         */
        const { email, password } = req.body;
        logger.info({ email }, 'Login attempt');
        var sql = 'SELECT * FROM user WHERE email = ? OR username = ?';	

        pool.query(sql, [email, email], async (err, user) => {
            if (err) {
                res.json({ error: 1, message: "Fatal error: " + err });
                logger.error({ err }, 'Database query error during login');
                return;
            }
            if (!user.length) {
                logger.warn({ email }, 'Login failed: user not found');
                return res.json({ error: 1, message: "Korisnik sa datim emailom ili korisničkim imenom ne postoji" });
            } else if (!(await this.verifyPassword(password, user[0].password))) {
                logger.warn({ email }, 'Login failed: incorrect password');
                return res.json({ error: 1, message: "Pogrešna lozinka za uneti email ili korisničko ime." });
            }
            logger.info({ userId: user[0].id, email }, 'Login successful');
            const token = jwt.sign({ userId: user[0].id }, SECRET_KEY, { expiresIn: '1h' });
            res.cookie('httpToken', token, {
                httpOnly: true,
                //secure: process.env.NODE_ENV === 'production' // Uključi samo u produkciji
            });

            res.json({ error: 0, message: "Uspešna prijava", token: token, userId: user[0].id });
        });
    }

    register = (req: express.Request, res: express.Response) => {
        /**
         * @param {string} username - user username
         * @param {string} firstname - user firstname
         * @param {string} lastname - user lastname
         * @param {string} password - user password
         * @param {string} birthday - user birthday
         * @param {string} phone - user phone
         * @param {string} location - user location
         * @param {string} type - user type
         * @param {string} email - user email
         * @param {string} backPhoto - user backPhoto
         * @param {string[]} selectedProfessions - user selected professions
         * @returns {json} - success or error message
         */
        const { username, password, location, type, email, backPhoto, selectedProfessions } = req.body;

        const schema = Joi.object({
            username: Joi.string().min(3).max(30).required(),
            password: Joi.string().min(6).required(),
            location: Joi.string().min(2).max(100).required(),
            type: Joi.string().valid("0", "1").required(),
            email: Joi.string().email().required(),
            backPhoto: Joi.string().allow(null, '').optional(),
            selectedProfessions: Joi.array().items(Joi.string()).optional()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error: 1, message: error.details[0].message });

        var sql = 'SELECT * FROM user WHERE username = ?';

        pool.query(sql, [username], (err, result) => {
            if (err) {
                res.json({ error: 1, message: "Fatal error" });
                logger.error('Register error:', err);
                return;
            }
            if (result.length) { res.json({ error: 1, message: "Korisnik sa datim korisničkim imenom već postoji." }); return; }

            sql = 'SELECT * FROM user WHERE email = ?';
            pool.query(sql, [email], (err, result) => {
                if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
                if (result.length) { res.json({ error: 1, message: "Korisnik sa datim email-om već postoji." }); return; }
                bcrypt.hash(password, 10).then((hashedPassword) => {
                    sql = 'INSERT INTO user (username, firstname, lastname, password, birthday, phone, location, type, email, backPhoto, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    pool.query(sql, [username, "ime", "prezime", hashedPassword, null, null, location, type, email, backPhoto, "data:image/png;base64,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"],
                        (err, result) => {
                            if (err) {
                                res.json({ error: 1, message: "Fatal error: " + err });
                                logger.error('Register error: ' + err);
                                return;
                            }
                            const idUser = result.insertId;
                            logger.info({ email, idUser }, 'User registered');

                            selectedProfessions.forEach((profession: any) => {
                                sql = 'INSERT INTO job (idUser, profession, city, type) VALUES (?, ?, ?, ?)';
                                pool.query(sql, [idUser, profession, location, type], (err, result) => {
                                    if (err) {
                                        res.json({ error: 1, message: "Fatal error: " + err });
                                        logger.error('Register error: ' + err);
                                        return;
                                    }
                                    // else logger.info('Profession ' + profession + ' added to user ' + idUser);
                                });
                            });
                            res.json({ error: 0, idUser: idUser });
                        });
                });
            });


        });
    }

    getUserById = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} id - id of the user
         * @returns {json} - user data
         */
        const { id } = req.body;
        if (!id) return res.json({ error: 1, message: "User ID is required" });
        var sql = 'SELECT username, firstname, lastname, birthday, phone, location, email, photo, backPhoto, type, instagram, facebook FROM user WHERE id = ?';
        pool.query(sql, [id], (err, user) => {
            if (err) return databaseFatalError(res, err, 'getUserById failed');
            if (user.length) {
                res.json({ error: 0, message: user[0] });
            }
            else {
                logger.warn({ id }, 'getUserById failed: user not found');
                res.json({ error: 1, message: null });
            }
        });
    }

    addComment = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} idUser - id of the user that is being commented
         * @param {number} idCommentator - id of the user that is commenting
         * @param {string} comment - comment text
         * @param {string} dateC - date of the comment
         * @param {number} jobId - id of the job that is being commented
         * @returns {json} - success or error message
         */
        const { idUser, idCommentator, comment, dateC, jobId } = req.body;
        let convertedDate = moment(dateC).format('YYYY-MM-DD HH:mm:ss');
        console.log(idUser + " " + idCommentator + " " + comment + " " + dateC + " " + jobId);
        // logger.info({ idUser, idCommentator, comment, dateC, jobId }, 'addComment attempt');
        var sql = 'INSERT INTO comments (idUser, idCommentator, comment, dateC, jobId) VALUES (?, ?, ?, ?, ?)';
        pool.query(sql, [idUser, idCommentator, comment, convertedDate, jobId], (err, d) => {
            if (err) {
                logger.error('addComment failed', err);
                return res.json({ error: 1, message: "Fatal error: " + err });
            }
            logger.info({ idUser, idCommentator, comment, dateC, jobId }, 'New comment added');
            res.json({ error: 0 });
        });
    }

    getCommentById = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} idUser - id of the user that is being commented
         * @returns {json} - comments for the user
         */
        const { idUser } = req.body;
        var sql = 'SELECT * FROM comments where idUser = ?';
        pool.query(sql, [idUser], (err, comments) => {
            if (err) {
                logger.error('getCommentById failed', err);
                return res.json({ error: 1, message: "Fatal error: " + err });
            }
            logger.info({ idUser }, 'Get comments for user');
            res.json({ error: 0, message: comments });
        });
    }

    getCommentsByJobId = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} jobId - id of the job that is being commented
         * @returns {json} - comments for the job
         */
        const { jobId } = req.body;
        var sql = 'SELECT * FROM comments where jobId = ?';
        pool.query(sql, [jobId], (err, comments) => {
            if (err) {
                logger.error('getCommentsByJobId failed', err);
                return res.json({ error: 1, message: "Fatal error: " + err });;
            }
            logger.info({ jobId, count: comments.length }, 'Fetched comments for job');
            res.json({ error: 0, message: comments });
        });
    }


    deleteCommentById = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} id - id of the comment that is being deleted
         * @returns {json} - success or error message
         */
        const { id } = req.body;
        var sql = 'DELETE FROM comments where id = ?';
        pool.query(sql, [id], (err, _) => {
            if (err) {
                logger.error('deleteCommentById failed', err);
                return res.json({ error: 1, message: "Fatal error: " + err });
            }
            logger.info({ id }, 'Comment deleted');
            res.json({ error: 0 });
        });
    }

    rate = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} idUser - id of the user that is being rated
         * @param {number} idRater - id of the user that is rating
         * @param {number} rate - rate value
         * @returns {json} - success or error message
         */
        const { idUser, idRater, rate } = req.body;
        // logger.info({ idUser, idRater, rate }, 'rate attempt');
        var sql = 'SELECT * FROM rate WHERE idUser = ? and idRater = ?';
        pool.query(sql, [idUser, idRater], (err, data) => {
            if (err) return databaseFatalError(res, err, 'rate failed');
            if (data.length) {
                sql = 'UPDATE rate SET rate = ? WHERE idUser = ? and idRater = ?';
                pool.query(sql, [rate, idUser, idRater], (err, _) => {
                    if (err) return databaseFatalError(res, err, 'rate failed');
                    logger.info({ idUser, idRater, rate }, 'rate updated');
                    res.json({ error: 0 });
                });
            } else {
                sql = 'INSERT INTO rate (idUser, idRater, rate) VALUES (?, ?, ?)';
                pool.query(sql, [idUser, idRater, rate], (err, _) => {
                    if (err) return databaseFatalError(res, err, 'rate failed');
                    logger.info({ idUser, idRater, rate }, 'rate added');
                    res.json({ error: 0 });
                });
            }
        });
    }

    getRateByIdUser = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} idUser - id of the user that is being rated
         * @returns {json} - rates for the user
         */
        const { idUser } = req.body;
        var sql = 'SELECT * FROM rate WHERE idUser = ?';
        pool.query(sql, [idUser], (err, data) => {
            if (err) return databaseFatalError(res, err, 'getRateByIdUser failed');
            res.json({ error: 0, message: data });
        });
    }

    getRateByIdUserAndRater = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} idUser - id of the user that is being rated
         * @param {number} idRater - id of the user that is rating
         * @returns {json} - rate for the user
         */
        const { idUser, idRater } = req.body;
        var sql = 'SELECT rate FROM rate WHERE idUser = ? and idRater = ?';
        pool.query(sql, [idUser, idRater], (err, data) => {
            if (err) return databaseFatalError(res, err, 'getRateByIdUserAndRater failed');
            res.json({ error: 0, message: data });
        });
    }

    changePassword = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} idUser - id of the user
         * @param {string} password - old password
         * @param {string} newPassword - new password
         * @returns {json} - success or error message
         */
        const { idUser, password, newPassword } = req.body;
        logger.info({ idUser }, 'changePassword attempt');
        if (!idUser || !password || !newPassword) {
            return res.status(400).json({ error: 1, message: "Missing required fields" });
        }
        const sqlGetPassword = 'SELECT password FROM user WHERE id = ?';
        pool.query(sqlGetPassword, [idUser], (err, results) => {
            if (err) return databaseFatalError(res, err, 'changePassword failed');
            if (!results.length) return res.json({ error: 1, message: "User not found" });
            const hashedPassword = results[0].password;
            bcrypt.compare(password, hashedPassword).then((result) => {
                if (!result) {
                    logger.warn({ idUser }, 'Invalid old password for changePassword');
                    return res.json({ error: 1, message: "Invalid password" });
                }
                bcrypt.hash(newPassword, 10).then((hashedNewPassword) => {
                    const sql = 'UPDATE user SET password = ? WHERE id = ?';
                    pool.query(sql, [hashedNewPassword, idUser], (err, _) => {
                        if (err) return databaseFatalError(res, err, 'changePassword failed');
                        logger.info({ idUser }, 'Password changed');
                        res.json({ error: 0 });
                    });
                });
            });
        });
    }

    getIdByEmail = (req: express.Request, res: express.Response) => {
        /**
         * @param {string} email - email of the user
         * @returns {json} - id of the user
         */
        const { email } = req.body;
        var sql = 'SELECT id FROM user WHERE email = ?';
        pool.query(sql, [email], (err, id) => {
            if (err) return databaseFatalError(res, err, 'getIdByEmail failed');
            res.json({ error: 0, message: id });
        });
    }

    getIdByUsername = (req: express.Request, res: express.Response) => {
        /**
         * @param {string} username - username of the user
         * @returns {json} - id of the user
         */
        const { username } = req.body;
        var sql = 'SELECT id FROM user WHERE username = ?';
        pool.query(sql, [username], (err, id) => {
            if (err) return databaseFatalError(res, err, 'getIdByUsername failed');
            res.json({ error: 0, message: id });
        });
    }

    updateUser = (req: express.Request, res: express.Response) => {
        /**
         * @param {number} idUser - id of the user
         * @param {string} username - username of the user
         * @param {string} email - email of the user
         * @param {string} firstname - first name of the user
         * @param {string} lastname - last name of the user
         * @param {string} birthday - birthday of the user
         * @param {string} location - location of the user
         * @param {string} phone - phone of the user
         * @param {string} backPhoto - back photo of the user
         * @param {string} photo - photo of the user
         * @param {number} distance - distance of the user
         * @returns {json} - success or error message
         */
        // const { idUser, username, email, firstname, lastname, birthday, location, phone, backPhoto, photo, distance } = req.body;
        // logger.info({ idUser, username, email, firstname, lastname, birthday, location, phone, distance }, 'updateUser attempt');
        // var sql = 'UPDATE user SET username=?, email=?, firstname=?, lastname=?, birthday=?, location=?, phone=?, photo=?, backPhoto = ?, distance = ? WHERE id=?';
        // pool.query(sql, [username, email, firstname, lastname, birthday, location, phone, photo, backPhoto, distance, idUser], (err, message) => {
        //     if (err) return databaseFatalError(res, err, 'updateUser failed');
        //     logger.info({ idUser }, 'User updated');
        //     return res.json({ error: 0, message: message });
        // });
        const { idUser, username, email, firstname, lastname, location, phone, backPhoto, photo, distance } = req.body;
        logger.info({ idUser, username, email, firstname, lastname, location, phone, distance }, 'updateUser attempt');
        var sql = 'UPDATE user SET username=?, email=?, firstname=?, lastname=?, location=?, phone=?, photo=?, backPhoto = ?, distance = ? WHERE id=?';
        pool.query(sql, [username, email, firstname, lastname, location, phone, photo, backPhoto, distance, idUser], (err, message) => {
            if (err) return databaseFatalError(res, err, 'updateUser failed');
            logger.info({ idUser }, 'User updated');
            return res.json({ error: 0, message: message });
        });
    }


    forgotPasswordRequest = (req: express.Request, res: express.Response) => {
        /**
         * @param {string} email - email of the user
         * @returns {json} - success or error message
         */
        let expire_time = new Date();
        const email = req.body.email;
        expire_time.setMinutes(expire_time.getMinutes() + 30);
        let reset_token = new ResetToken({
            token: crypto.randomBytes(16).toString('hex'),
            email: email, expire_time: expire_time
        });

        var query = 'SELECT id FROM user WHERE email = ?';
        pool.query(query, [email], (err, results) => {
            if (err) return databaseFatalError(res, err, 'forgotPasswordRequest failed');
            if (results.length != 1) { res.json({ error: 1 }); return; }
            query = 'DELETE FROM resettoken WHERE email = ? ';
            pool.query(query, [email], (err) => {
                if (err) return databaseFatalError(res, err, 'forgotPasswordRequest failed');
                query = 'INSERT INTO resettoken (token, email, expire_time) VALUES (?, ?, ?)';
                pool.query(query, [reset_token.token, email, expire_time], (err) => {
                    if (err) return databaseFatalError(res, err, 'forgotPasswordRequest failed');
                    var mailOptions = {
                        from: "support@vorki.rs",
                        to: email,
                        subject: 'Password change',
                        text: `${uri}/autentikacija/promena_zaboravljene_lozinke/${reset_token.token}`
                    };

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) return databaseFatalError(res, err, 'forgotPasswordRequest failed');
                        logger.info({ email }, 'Password reset email sent');
                        res.json({ error: 0 });
                    });
                });
            });
        });
    }


    tokenValidation = (req: express.Request, res: express.Response) => {
        /**
         * @param {string} token - token for password reset
         * @returns {json} - success or error message
         */
        let token = req.body.token;
        logger.info({ token }, 'Validating token for password reset');
        const query = 'SELECT * FROM resettoken WHERE token = ?';
        pool.query(query, [token], (err, results) => {
            if (err) return databaseFatalError(res, err, 'tokenValidation failed');
            if (results.length > 0) {
                const foundToken = results[0];
                if (new Date() > foundToken.expire_time) {
                    logger.warn('Token expired');
                    return res.json({ error: 1, message: "Vreme za izmenu lozinke je isteklo." });
                }
                logger.info({ email: foundToken.email }, 'Token validated');
                return res.json({ error: 0, 'email': foundToken.email });
            }
            else {
                logger.warn('Token not found');
                return res.json({ error: 2 });
            }
        });
    }

    changeForgottenPassword = (req: express.Request, res: express.Response) => {
        /**
         * @param {string} email - email of the user
         * @param {string} password - new password
         * @returns {json} - success or error message
         */
        let email = req.body.email;
        let password = req.body.password;
        logger.info({ email }, 'Changing forgotten password');
        bcrypt.hash(password, 10).then((hashedPassword) => {
            const searchQuery = 'SELECT * FROM user WHERE email = ?';
            pool.query(searchQuery, [email], (err, results) => {
                if (err) return databaseFatalError(res, err, 'changeForgottenPassword failed');
                if (results.length > 0) {
                    const updateQuery = 'UPDATE user SET password = ? WHERE email = ?';
                    pool.query(updateQuery, [hashedPassword, email], (err) => {
                        if (err) return databaseFatalError(res, err, 'changeForgottenPassword failed');
                        const deleteQuery = 'DELETE FROM resettoken WHERE email = ?';
                        pool.query(deleteQuery, [email], (err) => {
                            if (err) return databaseFatalError(res, err, 'delete reset token failed');
                        });
                        res.json({ error: 0 });
                    });
                }
            });
        });
    }

    getTop5masters = (req: express.Request, res: express.Response) => {
        /**
         * @returns {json} - top 5 users with highest average rate
         */
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
            if (err) return databaseFatalError(res, err, 'getTop5masters failed');
            if (users.length) {
                res.json({ error: 0, top5: users });
            }
            else {
                res.json({ error: 1, message: null });
            }
        });
    }

    support = async (req: express.Request, res: express.Response) => {
        /**
         * @param {string} nameAndSurname - name and surname of the user
         * @param {string} contact - contact of the user
         * @param {string} message - message from the user
         * @returns {json} - success or error message
         * @description - send email to support
         */
        var text = req.body.message + "\n\n\n" + "FROM: " + req.body.contact + " - " + req.body.nameAndSurname    
        var mailOptions = {
            from: "support@vorki.rs",
            to: "support@vorki.rs",
            subject: 'Pitanje korisnika',
            text: text
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) return databaseFatalError(res, err, 'support failed');
            else return res.json({ error: 0, message: "0" });
        });
    }

    verifyUser = (req: express.Request, res: express.Response) => {
        /**
         * @param {string} routeId - id of the route
         * @param {string} token - jwt token to verify
         * @returns {json} - authorized or unauthorized
         */
        const { routeId, token } = req.body;
        logger.info({ token }, 'Verifying user for routeId: ' + routeId);
        if (!token) {
            return res.status(401).json({ authorized: false, message: "No token provided" });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            logger.info({ decoded }, 'Decoded token');
            logger.info({ routeId }, 'Route ID');
            if (decoded.userId == routeId) {
                return res.json({ authorized: true });
            } else {
                return res.json({ authorized: false, message: "Unauthorized user" });
            }
        } catch (error) {
            return res.status(401).json({ authorized: false, message: "Invalid token" });
        }
    };


    verifyToken = (req: express.Request, res: express.Response) => {
        /**
         * @param {string} token - jwt token to verify
         * @returns {json} - authorized or unauthorized
         */
        const { token } = req.body;
        logger.info({ token }, 'Verifying token');
        if (!token) {
            return res.status(401).json({ authorized: false, message: "No token provided" });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            logger.info({ decoded }, 'Decoded token');
            return res.json({ authorized: true });
        } catch (error) {
            return res.status(401).json({ authorized: false, message: "Invalid token" });
        }
    }

}