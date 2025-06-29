"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const server_1 = require("../server");
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const reset_token_1 = __importDefault(require("../models/reset_token"));
const dotenv_1 = __importDefault(require("dotenv"));
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config();
const SECRET_KEY = process.env.JWT_SECRET || 'moj_tajni_kljuc';
const logger = require('../logger');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const emailBodyMaster = `
Poštovani/a,

Hvala što ste se registrovali na Vorki!

Vaš profil je uspešno kreiran, ali da biste što pre počeli da dobijate poslove, važno je da ga sredite do kraja.

👉 Idite na Profil → Podešavanja i unesite:
- detaljan opis usluga koje nudite
- fotografije Vaših radova

Što više informacija unesete - to će klijenti pre odabrati baš Vas!

Za bilo kakvu pomoć, tu smo:
📧 support@vorki.rs
📞 Dane: +381658020404
🌐 vorki.rs


Srdačno,
Vaš Vorki.rs tim`;
const emailBodyUser = `
Dobrodošli na Vorki.rs – pronađite pouzdane majstore brzo i lako! 🛠️



Poštovani/a,

Hvala što ste se registrovali na Vorki.rs – mesto gde se kvalitetni majstori i korisnici lako pronalaze!

Od sada možete:
🔎 Brzo pronaći proverenog majstora u svom gradu
📝 Objaviti besplatan oglas sa detaljima posla koji vam je potreban
💬 Komunicirati direktno sa majstorima
⭐ Ocenjivati i deliti iskustva sa drugima

Sve je kreirano tako da vam olakšamo potragu za pouzdanim profesionalcima – bilo da vam treba električar, moler, vodoinstalater ili neko drugi.

Ako vam je potrebna pomoć ili imate pitanja, slobodno nas kontaktirajte na support@vorki.rs.

Dobrodošli u Vorki zajednicu!
Vaš Vorki.rs tim`;
function databaseFatalError(res, err, msg) {
    logger.error({ err }, msg);
    return res.json({ error: 1, message: "Fatal error: " + err });
}
const transporter = nodemailer_1.default.createTransport({
    host: "mail.vorki.rs", // SMTP server tvog provajdera
    port: 465, // 587 za STARTTLS, 465 za SSL
    secure: true, // true za port 465, false za 587
    auth: {
        user: "support@vorki.rs",
        pass: process.env.SUPPORT_EMAIL_PASSWORD
    }
});
// const uri = 'http://localhost:4200'
const uri = 'https://vorki.rs';
class UserController {
    constructor() {
        this.login = (req, res) => {
            /**
             * @param {string} emailOrUsername - user email or username
             * @param {string} password - user password
             * @returns {json} - success or error message
             */
            const { email, password } = req.body;
            logger.info({ email }, 'Login attempt');
            var sql = 'SELECT * FROM user WHERE email = ? OR username = ?';
            server_1.pool.query(sql, [email, email], (err, user) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    logger.error({ err }, 'Database query error during login');
                    return;
                }
                if (!user.length) {
                    logger.warn({ email }, 'Login failed: user not found');
                    return res.json({ error: 1, message: "Korisnik sa datim emailom ili korisničkim imenom ne postoji" });
                }
                else if (!(yield this.verifyPassword(password, user[0].password))) {
                    logger.warn({ email }, 'Login failed: incorrect password');
                    return res.json({ error: 1, message: "Pogrešna lozinka za uneti email ili korisničko ime." });
                }
                logger.info({ userId: user[0].id, email }, 'Login successful');
                const token = jwt.sign({ userId: user[0].id }, SECRET_KEY, { expiresIn: '24h' });
                res.cookie('httpToken', token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000 // 24h u milisekundama
                    //secure: process.env.NODE_ENV === 'production' // Uključi samo u produkciji
                });
                res.json({ error: 0, message: "Uspešna prijava", token: token, userId: user[0].id, userType: user[0].type });
            }));
        };
        this.register = (req, res) => {
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
             * @param {string} phone - user phone
             * @returns {json} - success or error message
             */
            const { firstname, lastname, username, password, location, type, email, backPhoto, selectedProfessions, phone } = req.body;
            const schema = joi_1.default.object({
                password: joi_1.default.string().min(6).required(),
                location: joi_1.default.string().min(2).max(100).required(),
                type: joi_1.default.string().valid("0", "1").required(),
                email: joi_1.default.string().email().required(),
                backPhoto: joi_1.default.string().allow(null, '').optional(),
                selectedProfessions: joi_1.default.array().items(joi_1.default.string()).optional()
            });
            // const { error } = schema.validate(req.body);
            // if (error) return res.status(400).json({ error: 1, message: error.details[0].message });
            var sql = 'SELECT * FROM user WHERE username = ?';
            server_1.pool.query(sql, [username], (err, result) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error" });
                    logger.error('Register error:', err);
                    return;
                }
                if (result.length) {
                    res.json({ error: 1, message: "Korisnik sa datim korisničkim imenom već postoji." });
                    return;
                }
                sql = 'SELECT * FROM user WHERE email = ?';
                server_1.pool.query(sql, [email], (err, result) => {
                    if (err) {
                        res.json({ error: 1, message: "Fatal error: " + err });
                        return;
                    }
                    if (result.length) {
                        res.json({ error: 1, message: "Korisnik sa datim email-om već postoji." });
                        return;
                    }
                    bcryptjs_1.default.hash(password, 10).then((hashedPassword) => {
                        sql = 'INSERT INTO user (username, firstname, lastname, password, birthday, phone, location, type, email, backPhoto, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                        server_1.pool.query(sql, [username, firstname, lastname, hashedPassword, null, phone, location, type, email, backPhoto, "data:image/png;base64,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"], (err, result) => {
                            if (err) {
                                res.json({ error: 1, message: "Fatal error: " + err });
                                logger.error('Register error: ' + err);
                                return;
                            }
                            const idUser = result.insertId;
                            logger.info({ email, idUser }, 'User registered');
                            selectedProfessions.forEach((profession) => {
                                sql = 'INSERT INTO job (idUser, profession, city, type) VALUES (?, ?, ?, ?)';
                                server_1.pool.query(sql, [idUser, profession, location, type], (err, result) => {
                                    if (err) {
                                        res.json({ error: 1, message: "Fatal error: " + err });
                                        logger.error('Register error: ' + err);
                                        return;
                                    }
                                    // else logger.info('Profession ' + profession + ' added to user ' + idUser);
                                });
                            });
                            var mailOptions = {
                                from: "support@vorki.rs",
                                to: email,
                                subject: 'Dobrodošli na Vorki - Vaša registracija je uspešna!',
                                text: type == '0' ? emailBodyMaster : emailBodyUser,
                            };
                            transporter.sendMail(mailOptions, function (err, info) {
                                if (err)
                                    return databaseFatalError(res, err, 'register failed: email error');
                                logger.info({ email }, 'Register welcome email sent');
                                res.json({ error: 0 });
                            });
                            res.json({ error: 0, idUser: idUser });
                        });
                    });
                });
            });
        };
        this.getUserById = (req, res) => {
            /**
             * @param {number} id - id of the user
             * @returns {json} - user data
             */
            const { id } = req.body;
            logger.info({ id }, 'getUserById attempt');
            if (!id || !Number.isInteger(Number(id))) {
                return databaseFatalError(res, null, 'getUserById failed: Invalid userID');
            }
            const sql = 'SELECT username, firstname, lastname, birthday, phone, location, email, photo, backPhoto, type, instagram, facebook, info, distance, rate, profile_clicks, phone_clicks FROM user WHERE id = ?';
            server_1.pool.query(sql, [id], (err, user) => {
                if (err)
                    return databaseFatalError(res, err, 'getUserById failed');
                if (user.length) {
                    return res.json({ error: 0, message: user[0] });
                }
                else {
                    logger.warn({ id }, 'getUserById failed: user not found');
                    return res.json({ error: 1, message: 'User not found' });
                }
            });
        };
        this.getUserProfessionsById = (req, res) => {
            /**
             * @param {number} id - id of the user
             * @returns {json} - user professions
             */
            const { id } = req.body;
            logger.info({ id }, 'getUserProfessionsById attempt');
            if (!id || !Number.isInteger(Number(id))) {
                return databaseFatalError(res, null, 'getUserProfessionsById failed: Invalid userID');
            }
            const sql = 'SELECT profession FROM job WHERE idUser = ?';
            server_1.pool.query(sql, [id], (err, professions) => {
                if (err)
                    return databaseFatalError(res, err, 'getUserProfessionsById failed');
                if (professions.length) {
                    return res.json({ error: 0, message: professions });
                }
                else {
                    logger.warn({ id }, 'getUserProfessionsById failed: user not found');
                    return res.json({ error: 1, message: 'User not found' });
                }
            });
        };
        this.addComment = (req, res) => {
            /**
             * @param {number} idUser - id of the user that is being commented
             * @param {number} idCommentator - id of the user that is commenting
             * @param {string} comment - comment text
             * @param {string} dateC - date of the comment
             * @param {number} jobId - id of the job that is being commented
             * @returns {json} - success or error message
             */
            const { idUser, idCommentator, comment, dateC, jobId } = req.body;
            const idUserReq = req.userId; // jwt token
            if (idCommentator != idUserReq)
                return databaseFatalError(res, null, 'addComment failed: Unauthorized');
            if (!idUser || !idCommentator || !jobId) {
                return databaseFatalError(res, null, 'addComment failed: Missing required fields');
            }
            if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
                return databaseFatalError(res, null, 'addComment failed: Comment cannot be empty');
            }
            let convertedDate = moment(dateC).format('YYYY-MM-DD HH:mm:ss');
            const sql = 'INSERT INTO comments (idUser, idCommentator, comment, dateC, jobId) VALUES (?, ?, ?, ?, ?)';
            server_1.pool.query(sql, [idUser, idCommentator, comment, convertedDate, jobId], (err, d) => {
                if (err) {
                    logger.error('addComment failed', err);
                    return databaseFatalError(res, err, 'addComment failed');
                }
                logger.info({ idUser, idCommentator, comment, dateC, jobId }, 'New comment added');
                res.json({ error: 0 });
            });
        };
        this.getCommentById = (req, res) => {
            /**
             * @param {number} idUser - id of the user that is being commented
             * @returns {json} - comments for the user
             */
            const { idUser } = req.body;
            const idUserReq = req.userId; // jwt token
            if (idUser != idUserReq)
                return databaseFatalError(res, null, 'getCommentById failed: Unauthorized');
            const sql = 'SELECT * FROM comments where idUser = ?';
            server_1.pool.query(sql, [idUser], (err, comments) => {
                if (err) {
                    logger.error('getCommentById failed', err);
                    return res.json({ error: 1, message: "Fatal error: " + err });
                }
                logger.info({ idUser }, 'Get comments for user');
                res.json({ error: 0, message: comments });
            });
        };
        this.getCommentsByJobId = (req, res) => {
            /**
             * @param {number} jobId - id of the job that is being commented
             * @returns {json} - comments for the job
             */
            const { jobId } = req.body;
            if (!jobId || !Number.isInteger(Number(jobId))) {
                return databaseFatalError(res, null, 'getCommentsByJobId failed: Invalid jobID');
            }
            const sql = 'SELECT * FROM comments where jobId = ?';
            server_1.pool.query(sql, [jobId], (err, comments) => {
                if (err) {
                    logger.error('getCommentsByJobId failed', err);
                    return res.json({ error: 1, message: "Fatal error: " + err });
                    ;
                }
                logger.info({ jobId, count: comments.length }, 'Fetched comments for job');
                res.json({ error: 0, message: comments });
            });
        };
        this.deleteCommentById = (req, res) => {
            /**
             * @param {number} id - id of the comment that is being deleted
             * @returns {json} - success or error message
             */
            const { id } = req.body;
            const userId = req.userId; // jwt token
            if (!id || !Number.isInteger(Number(id))) {
                return databaseFatalError(res, null, 'deleteCommentById failed: Invalid comment ID');
            }
            const checkSql = `SELECT idCommentator FROM comments WHERE id = ?`;
            server_1.pool.query(checkSql, [id], (err, results) => {
                if (err) {
                    logger.error({ id, error: err }, "deleteCommentById failed: Database error");
                    return databaseFatalError(res, err, 'deleteCommentById failed');
                }
                if (results.length === 0) {
                    return databaseFatalError(res, null, 'deleteCommentById failed: Comment not found');
                }
                const commentOwner = results[0].idUser;
                if (commentOwner !== userId) {
                    return databaseFatalError(res, null, 'deleteCommentById failed: Unauthorized');
                }
                const deleteSql = `DELETE FROM comments WHERE id = ?`;
                server_1.pool.query(deleteSql, [id], (err, _) => {
                    if (err) {
                        logger.error({ id, error: err }, "deleteCommentById failed: Database error");
                        return databaseFatalError(res, err, 'deleteCommentById failed');
                    }
                    logger.info({ id, userId }, "Comment deleted");
                    res.json({ error: 0, message: "Comment deleted successfully" });
                });
            });
        };
        this.rate = (req, res) => {
            /**
             * @param {number} idUser - id of the user that is being rated
             * @param {number} idRater - id of the user that is rating
             * @param {number} rate - rate value
             * @returns {json} - success or error message
             */
            const { idUser, idRater, rate } = req.body;
            const idUserReq = req.userId; // jwt token
            if (!idUser || !idRater || rate === undefined)
                return databaseFatalError(res, null, 'rate failed: Missing required fields');
            if (idUser === idRater)
                return databaseFatalError(res, null, 'rate failed: User cannot rate himself');
            if (idRater != idUserReq)
                return databaseFatalError(res, null, 'rate failed: Unauthorized');
            if (typeof rate !== "number" || rate < 1 || rate > 5)
                return databaseFatalError(res, null, 'rate failed: Invalid rate value');
            const sql = `
        INSERT INTO rate (idUser, idRater, rate)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE rate = VALUES(rate)`; // If rate already exists, update it
            server_1.pool.query(sql, [idUser, idRater, rate], (err, _) => {
                if (err) {
                    logger.error({ idUser, idRater, rate, error: err }, "rate failed: Database error");
                    return databaseFatalError(res, err, 'rate failed');
                }
                const sqlUpdateAvg = `
                UPDATE user
                SET rate = (SELECT ROUND(AVG(rate), 2) FROM rate WHERE idUser = ?)
                WHERE id = ?
            `;
                server_1.pool.query(sqlUpdateAvg, [idUser, idUser], (err) => {
                    if (err)
                        return databaseFatalError(res, err, 'Error updating user average rating');
                    logger.info({ idUser, idRater, rate }, 'rate added or updated');
                    return res.json({ error: 0, message: 'Rating saved and average updated' });
                });
            });
        };
        this.getRateByIdUser = (req, res) => {
            /**
             * @param {number} idUser - id of the user that is being rated
             * @returns {json} - rates for the user
             */
            const { idUser } = req.body;
            const idUserReq = req.userId; // jwt token
            if (idUser != idUserReq)
                return databaseFatalError(res, null, 'getRateByIdUser failed: Unauthorized');
            var sql = 'SELECT * FROM rate WHERE idUser = ?';
            server_1.pool.query(sql, [idUser], (err, data) => {
                if (err)
                    return databaseFatalError(res, err, 'getRateByIdUser failed');
                res.json({ error: 0, message: data });
            });
        };
        this.getRateByIdUserAndRater = (req, res) => {
            /**
             * @param {number} idUser - id of the user that is being rated
             * @param {number} idRater - id of the user that is rating
             * @returns {json} - rate for the user
             */
            const { idUser, idRater } = req.body;
            const idUserReq = req.userId; // jwt token
            if (idUser != idUserReq && idRater != idUserReq)
                return databaseFatalError(res, null, 'getRateByIdUserAndRater failed: Unauthorized');
            var sql = 'SELECT rate FROM rate WHERE idUser = ? and idRater = ?';
            server_1.pool.query(sql, [idUser, idRater], (err, data) => {
                if (err)
                    return databaseFatalError(res, err, 'getRateByIdUserAndRater failed');
                res.json({ error: 0, message: data });
            });
        };
        this.changePassword = (req, res) => {
            /**
             * @param {number} idUser - id of the user
             * @param {string} password - old password
             * @param {string} newPassword - new password
             * @returns {json} - success or error message
             */
            const { idUser, password, newPassword } = req.body;
            logger.info({ idUser, password, newPassword }, 'changePassword attempt');
            if (!idUser || !password || !newPassword) {
                return res.status(400).json({ error: 1, message: "Missing required fields" });
            }
            const idUserReq = req.userId; // jwt token
            if (idUser != idUserReq)
                return databaseFatalError(res, null, 'changePassword failed: Unauthorized');
            const sqlGetPassword = 'SELECT password FROM user WHERE id = ?';
            server_1.pool.query(sqlGetPassword, [idUser], (err, results) => {
                if (err)
                    return databaseFatalError(res, err, 'changePassword failed');
                if (!results.length)
                    return res.json({ error: 1, message: "User not found" });
                const hashedPassword = results[0].password;
                bcryptjs_1.default.compare(password, hashedPassword).then((result) => {
                    if (!result) {
                        logger.warn({ idUser }, 'Invalid old password for changePassword');
                        return res.json({ error: 1, message: "Invalid password" });
                    }
                    else {
                        bcryptjs_1.default.hash(newPassword, 10).then((hashedNewPassword) => {
                            const sql = 'UPDATE user SET password = ? WHERE id = ?';
                            server_1.pool.query(sql, [hashedNewPassword, idUser], (err, _) => {
                                if (err)
                                    return databaseFatalError(res, err, 'changePassword failed');
                                logger.info({ idUser }, 'Password changed');
                                res.json({ error: 0 });
                            });
                        });
                    }
                });
            });
        };
        this.getIdByEmail = (req, res) => {
            /**
             * @param {string} email - email of the user
             * @returns {json} - id of the user
             */
            const { email } = req.body;
            var sql = 'SELECT id FROM user WHERE email = ?';
            server_1.pool.query(sql, [email], (err, id) => {
                if (err)
                    return databaseFatalError(res, err, 'getIdByEmail failed');
                res.json({ error: 0, message: id });
            });
        };
        this.getIdByUsername = (req, res) => {
            /**
             * @param {string} username - username of the user
             * @returns {json} - id of the user
             */
            const { username } = req.body;
            var sql = 'SELECT id FROM user WHERE username = ?';
            server_1.pool.query(sql, [username], (err, id) => {
                if (err)
                    return databaseFatalError(res, err, 'getIdByUsername failed');
                res.json({ error: 0, message: id });
            });
        };
        this.updateUser = (req, res) => {
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
             * @param {string} info - info of the user
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
            const { idUser, username, email, firstname, lastname, birthday, location, phone, backPhoto, photo, distance, info } = req.body;
            const idUserReq = req.userId;
            if (idUser != idUserReq)
                return databaseFatalError(res, null, 'updateUser failed: Unauthorized');
            logger.info({ idUser, username, email, firstname, lastname, birthday, location, phone, distance, info }, 'updateUser attempt');
            var sql = 'UPDATE user SET username=?, email=?, firstname=?, lastname=?, birthday=?, location=?, phone=?, photo=?, backPhoto = ?, distance = ?, info = ? WHERE id=?';
            server_1.pool.query(sql, [username, email, firstname, lastname, birthday, location, phone, photo, backPhoto, distance, info, idUser], (err, message) => {
                if (err)
                    return databaseFatalError(res, err, 'updateUser failed');
                logger.info({ idUser }, 'User updated');
                return res.json({ error: 0, message: message });
            });
        };
        this.forgotPasswordRequest = (req, res) => {
            /**
             * @param {string} email - email of the user
             * @returns {json} - success or error message
             */
            let expire_time = new Date();
            const email = req.body.email;
            expire_time.setMinutes(expire_time.getMinutes() + 30);
            let reset_token = new reset_token_1.default({
                token: crypto_1.default.randomBytes(16).toString('hex'),
                email: email, expire_time: expire_time
            });
            var query = 'SELECT id FROM user WHERE email = ?';
            server_1.pool.query(query, [email], (err, results) => {
                if (err)
                    return databaseFatalError(res, err, 'forgotPasswordRequest failed');
                if (results.length != 1) {
                    res.json({ error: 1 });
                    return;
                }
                query = 'DELETE FROM resettoken WHERE email = ? ';
                server_1.pool.query(query, [email], (err) => {
                    if (err)
                        return databaseFatalError(res, err, 'forgotPasswordRequest failed');
                    query = 'INSERT INTO resettoken (token, email, expire_time) VALUES (?, ?, ?)';
                    server_1.pool.query(query, [reset_token.token, email, expire_time], (err) => {
                        if (err)
                            return databaseFatalError(res, err, 'forgotPasswordRequest failed');
                        var mailOptions = {
                            from: "support@vorki.rs",
                            to: email,
                            subject: 'Password change',
                            text: `${uri}/autentikacija/promena_zaboravljene_lozinke/${reset_token.token}`
                        };
                        transporter.sendMail(mailOptions, function (err, info) {
                            if (err)
                                return databaseFatalError(res, err, 'forgotPasswordRequest failed');
                            logger.info({ email }, 'Password reset email sent');
                            res.json({ error: 0 });
                        });
                    });
                });
            });
        };
        this.tokenValidation = (req, res) => {
            /**
             * @param {string} token - token for password reset
             * @returns {json} - success or error message
             */
            let token = req.body.token;
            logger.info({ token }, 'Validating token for password reset');
            const query = 'SELECT * FROM resettoken WHERE token = ?';
            server_1.pool.query(query, [token], (err, results) => {
                if (err)
                    return databaseFatalError(res, err, 'tokenValidation failed');
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
        };
        this.changeForgottenPassword = (req, res) => {
            /**
             * @param {string} email - email of the user
             * @param {string} password - new password
             * @returns {json} - success or error message
             */
            let email = req.body.email;
            let password = req.body.password;
            logger.info({ email }, 'Changing forgotten password');
            bcryptjs_1.default.hash(password, 10).then((hashedPassword) => {
                const searchQuery = 'SELECT * FROM user WHERE email = ?';
                server_1.pool.query(searchQuery, [email], (err, results) => {
                    if (err)
                        return databaseFatalError(res, err, 'changeForgottenPassword failed');
                    if (results.length > 0) {
                        const updateQuery = 'UPDATE user SET password = ? WHERE email = ?';
                        server_1.pool.query(updateQuery, [hashedPassword, email], (err) => {
                            if (err)
                                return databaseFatalError(res, err, 'changeForgottenPassword failed');
                            const deleteQuery = 'DELETE FROM resettoken WHERE email = ?';
                            server_1.pool.query(deleteQuery, [email], (err) => {
                                if (err)
                                    return databaseFatalError(res, err, 'delete reset token failed');
                            });
                            res.json({ error: 0 });
                        });
                    }
                });
            });
        };
        this.getTop5masters = (req, res) => {
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
            server_1.pool.query(sql, (err, users) => {
                if (err)
                    return databaseFatalError(res, err, 'getTop5masters failed');
                if (users.length) {
                    res.json({ error: 0, top5: users });
                }
                else {
                    res.json({ error: 1, message: null });
                }
            });
        };
        this.support = (req, res) => __awaiter(this, void 0, void 0, function* () {
            /**
             * @param {string} nameAndSurname - name and surname of the user
             * @param {string} contact - contact of the user
             * @param {string} message - message from the user
             * @returns {json} - success or error message
             * @description - send email to support
             */
            var text = req.body.message + "\n\n\n" + "FROM: " + req.body.contact + " - " + req.body.nameAndSurname;
            var mailOptions = {
                from: "support@vorki.rs",
                to: "support@vorki.rs",
                subject: 'Pitanje korisnika',
                text: text
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    return databaseFatalError(res, err, 'support failed');
                else
                    return res.json({ error: 0, message: "0" });
            });
        });
        this.verifyUser = (req, res) => {
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
                }
                else {
                    return res.json({ authorized: false, message: "Unauthorized user" });
                }
            }
            catch (error) {
                return res.status(401).json({ authorized: false, message: "Invalid token" });
            }
        };
        this.verifyToken = (req, res) => {
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
            }
            catch (error) {
                return res.status(401).json({ authorized: false, message: "Invalid token" });
            }
        };
        this.isUserSubscribed = (req, res) => {
            /**
             * @param {number} userId - id of the user
             * @returns {json} - subscribed or not
             */
            const idUserReq = req.userId;
            if (!idUserReq)
                return databaseFatalError(res, null, 'isUserSubscribed failed: Unauthorized');
            const sql = 'SELECT * FROM subscriptions WHERE user_id = ?';
            server_1.pool.query(sql, [idUserReq], (err, results) => {
                if (err)
                    return databaseFatalError(res, err, 'isUserSubscribed failed');
                if (results.length) {
                    return res.json({ subscribed: true });
                }
                return res.json({ subscribed: false });
            });
        };
        this.getTop3Masters = (req, res) => {
            /**
             * @param {string} selectedCity - city of the user | null if not selected
             * @param {string} selectedProfession - profession of the user | null if not selected
             * @returns {json} - top 3 users with highest average rate for the city and profession
             */
            const { selectedCity, selectedProfession } = req.body;
            logger.info({ selectedCity, selectedProfession }, 'getTop3Masters attempt');
            try {
                let query = `
              SELECT DISTINCT u.*
              FROM user u
              LEFT JOIN job j ON j.idUser = u.id
            `;
                const conditions = [];
                const params = [];
                if (selectedCity) {
                    conditions.push('u.location = ?');
                    params.push(selectedCity);
                }
                if (selectedProfession) {
                    conditions.push('j.profession = ?');
                    params.push(selectedProfession);
                }
                if (conditions.length > 0) {
                    query += ' WHERE ' + conditions.join(' AND ');
                }
                query += ' ORDER BY u.rate DESC LIMIT 3';
                server_1.pool.query(query, params, (err, results) => {
                    if (err) {
                        logger.error(err, 'getTop3Masters failed');
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    logger.info({ results }, 'getTop3Masters success');
                    res.status(200).json({ top3: results });
                });
            }
            catch (error) {
                logger.error(error, 'getTop3Masters failed');
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.trackPhoneClick = (req, res) => {
            /**
             * @param {number} userId - id of the user
             * @returns {json} - success or error message
             */
            const { userId } = req.body;
            const sql = 'UPDATE user SET phone_clicks = phone_clicks + 1 WHERE id = ?';
            server_1.pool.query(sql, [userId], (err, result) => {
                if (err) {
                    logger.error(err, 'trackPhoneClick failed');
                    return databaseFatalError(res, err, 'trackPhoneClick failed');
                }
                logger.info('Phone click tracked for user ID: ' + userId);
                res.json({ error: 0 });
            });
        };
        this.trackProfileClick = (req, res) => {
            /**
             * @param {number} userId - id of the user
             * @returns {json} - success or error message
             */
            const { userId } = req.body;
            const sql = 'UPDATE user SET profile_clicks = profile_clicks + 1 WHERE id = ?';
            server_1.pool.query(sql, [userId], (err, result) => {
                if (err) {
                    logger.error(err, 'trackProfileClick failed');
                    return databaseFatalError(res, err, 'trackProfileClick failed');
                }
                logger.info('Profile click tracked for user ID: ' + userId);
                res.json({ error: 0 });
            });
        };
    }
    verifyPassword(plainPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(plainPassword, hashedPassword);
        });
    }
}
exports.UserController = UserController;
