"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const server_1 = require("../server");
const logger = require('../logger');
function databaseFatalError(res, err, msg) {
    logger.error({ err }, msg);
    return res.json({ error: 1, message: "Fatal error: " + err });
}
class JobController {
    constructor() {
        this.insertJob = (req, res) => {
            /**
             * @param {string} description
             * @param {string} title
             * @param {string} city
             * @param {string} profession
             * @param {number} id
             * @param {string} type
             * @description Insert job into database
             * @returns {json} message
             */
            const { description, title, city, profession, type } = req.body;
            const userId = req.userId;
            if (!description || !title || !city || !profession || !type) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            if (!userId) {
                return databaseFatalError(res, null, 'Unauthorized user');
            }
            logger.info({ description, title, city, profession, userId, type }, 'Inserting job');
            const sql = 'INSERT INTO job (idUser, title, description, city, profession, type) VALUES (?, ?, ?, ?, ?, ?)';
            server_1.pool.query(sql, [userId, title, description, city, profession, type], (err, job) => {
                if (err)
                    return databaseFatalError(res, err, 'Error inserting job');
                logger.info({ job_id: job.insertId }, 'Job inserted');
                return res.json({ message: "0", job_id: job.insertId });
            });
        };
        this.getJobs = (_, res) => {
            /**
             * @description Get all jobs from database
             * @returns {json} jobs
             */
            const sql = 'SELECT * FROM job';
            server_1.pool.query(sql, (err, jobs) => {
                if (err)
                    return databaseFatalError(res, err, 'Error getting jobs');
                return res.json(jobs);
            });
        };
        this.getJobById = (req, res) => {
            /**
             * @param {number} id
             * @description Get job by id from database
             * @returns {json} job
             */
            logger.info({ id: req.params.id }, 'Getting job by id');
            const sql = 'SELECT * FROM job WHERE id = ?';
            server_1.pool.query(sql, [req.params.id], (err, job) => {
                if (err)
                    return databaseFatalError(res, err, 'Error getting job by id');
                return res.json(job);
            });
        };
        this.getJobsWithUserInfo = (_, res) => {
            /**
             * @description Get all jobs with user info from database
             * @returns {json} jobs
             */
            const sqlJobs = 'SELECT * FROM job';
            server_1.pool.query(sqlJobs, (err, jobs) => {
                if (err)
                    return databaseFatalError(res, err, 'Error getting jobs');
                const sqlUsers = 'SELECT * FROM user';
                server_1.pool.query(sqlUsers, (err, users) => {
                    if (err)
                        return databaseFatalError(res, err, 'Error getting users');
                    jobs.forEach(job => {
                        job.user = users.find(user => user.id === job.idUser);
                    });
                    return res.json(jobs);
                });
            });
        };
        this.getJobsWithUserInfo2 = (_, res) => {
            /**
             * @description Get all jobs with user info from database
             * @returns {json} jobs
             */
            var sql = 'SELECT job.id, job.profession, job.title, job.description, job.city, job.idUser, user.username, user.photo,';
            sql += 'COALESCE((SELECT AVG(rate) FROM rate r WHERE r.idUser = job.idUser GROUP BY r.idUser), 0) AS avgRate, job.type ';
            sql += 'FROM job INNER JOIN user ON job.idUser = user.id;';
            server_1.pool.query(sql, (err, jobs) => {
                if (err)
                    return databaseFatalError(res, err, 'Error getting jobs');
                return res.json(jobs);
            });
        };
        this.get_job_and_user_info = (req, res) => {
            /**
             * @param {number} id
             * @description Get job and user info by id
             * @returns {json} job
             */
            var sql = 'SELECT job.id, job.profession, job.title, job.description, job.city, job.idUser, user.username, user.photo,';
            sql += 'COALESCE((SELECT AVG(rate) FROM rate r WHERE r.idUser = job.idUser GROUP BY r.idUser), 0) AS avgRate, job.type ';
            sql += 'FROM job INNER JOIN user ON job.idUser = user.id WHERE job.id = ?;';
            server_1.pool.query(sql, [req.params.id], (err, job) => {
                if (err)
                    return databaseFatalError(res, err, 'Error getting job and user info');
                return res.json(job);
            });
        };
        this.requestForAgreement = (req, res) => {
            /**
             * @param {number} idJob
             * @param {number} idMaster
             * @param {string} startDate
             * @param {string} endDate
             * @param {string} additionalInfo
             * @description Request for agreement
             * @returns {json} message
             */
            const { idJob, idMaster, startDate, endDate, additionalInfo } = req.body;
            const userId = req.token.userId;
            if (!idJob || !idMaster || !startDate || !endDate) {
                return databaseFatalError(res, null, "Missing required fields");
            }
            if (!userId) {
                return databaseFatalError(res, null, "Unauthorized user");
            }
            const sql = 'INSERT INTO agreements (idJob, idUser, idMaster, startTime, endTime, additionalInfo, currentStatus) VALUES (?, ?, ?, ?, ?, ?, "pending")';
            server_1.pool.query(sql, [idJob, userId, idMaster, startDate, endDate, additionalInfo], (err, _) => {
                if (err)
                    return databaseFatalError(res, err, 'Error requesting agreement');
                logger.info({ idJob, userId, idMaster, startDate, endDate, additionalInfo }, 'Request for agreement');
                return res.json({ message: "0" });
            });
        };
        this.updateJob = (req, res) => {
            /**
             * @param {object} job
             * @description Update job
             * @returns {json} message
             */
            const userId = req.token.userId;
            const { job } = req.body;
            if (!job || !job.idUser || !job.title || !job.description || !job.city || !job.profession) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            if (job.idUser != userId)
                return databaseFatalError(res, null, 'Unauthorized user');
            const sql = 'UPDATE job SET title = ?, description = ?, city = ?, profession = ? WHERE id = ? AND idUser = ?';
            server_1.pool.query(sql, [job.title, job.description, job.city, job.profession, job.id, userId], (err, _) => {
                if (err)
                    return databaseFatalError(res, err, 'Error updating job');
                logger.info({ job }, 'Job updated');
                return res.json({ message: "Job updated" });
            });
        };
        this.getJobRequests = (req, res) => {
            /**
             * @param {number} idMaster
             * @description Get job requests for master
             * @returns {json} requests
             */
            const idMaster = req.params.idMaster;
            const sql = 'SELECT agreements.*, job.title, user.username FROM agreements JOIN job ON agreements.idJob = job.id JOIN user ON agreements.idUser = user.id WHERE agreements.idMaster = ?;';
            logger.info({ idMaster: idMaster }, 'Getting job requests for master');
            server_1.pool.query(sql, [idMaster], (err, requests) => {
                if (err)
                    return databaseFatalError(res, err, 'Error getting job requests');
                return res.json(requests);
            });
        };
        this.getJobRequestsForUser = (req, res) => {
            /**
             * @param {number} idUser
             * @description Get job requests for user
             * @returns {json} requests
             */
            const idUser = req.params.idUser;
            const sql = 'SELECT agreements.*, job.title, user.username FROM agreements JOIN job ON agreements.idJob = job.id JOIN user ON agreements.idMaster = user.id WHERE agreements.idUser = ?;';
            logger.info({ idUser: idUser }, 'Getting job requests for user');
            server_1.pool.query(sql, [idUser], (err, requests) => {
                if (err)
                    return databaseFatalError(res, err, 'Error getting job requests for user');
                return res.json(requests);
            });
        };
        this.updateAgreement = (req, res) => {
            /**
             * @param {number} idAgreements
             * @param {string} status
             * @description Update agreement status
             * @returns {json} message
             */
            const { idAgreements, status } = req.body;
            logger.info({ idAgreements, status }, 'Updating agreement status');
            const sql = 'UPDATE agreements SET currentStatus = ? WHERE idAgreements = ?';
            server_1.pool.query(sql, [status, idAgreements], (err, _) => {
                if (err)
                    return databaseFatalError(res, err, 'Error updating agreement');
                return res.json({ message: "0" });
            });
        };
        this.getMastersCount = (req, res) => {
            /**
             * @param {array} jobsArray
             * @description Get masters count by profession
             * @returns {json} masters
             */
            const { jobsArray } = req.body;
            const sql = 'SELECT profession, COUNT(*) AS count FROM job WHERE profession IN(?) GROUP BY profession;';
            server_1.pool.query(sql, [jobsArray], (err, masters) => {
                if (err)
                    return databaseFatalError(res, err, 'Error getting masters count');
                return res.json(masters);
            });
        };
        this.getJobGallery = (req, res) => {
            /**
             * @param {number} idJob
             * @description Get job gallery
             * @returns {json} images
             */
            const idJob = req.params.idJob;
            if (!idJob) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            const query = 'SELECT urlPhoto FROM gallery WHERE idJob = ?';
            server_1.pool.query(query, [idJob], (err, results) => {
                if (err)
                    return databaseFatalError(res, err, 'Error fetching images');
                return res.json(results);
            });
        };
        this.getGalleryByIdUser = (req, res) => {
            /**
             * @param {number} idUser
             * @description Get job gallery
             * @returns {json} images
             */
            const idUser = req.params.idUser;
            if (!idUser) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            const query = 'SELECT urlPhoto FROM gallery WHERE idUser = ?';
            server_1.pool.query(query, [idUser], (err, results) => {
                if (err)
                    return databaseFatalError(res, err, 'Error fetching images');
                return res.json(results);
            });
        };
        this.getUserGallery = (req, res) => {
            /**
             * @param {number} idUser
             * @description Get images from all jobs of user
             * @returns {json} images
             */
            const idUser = req.params.idUser;
            if (!idUser) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            const query = 'SELECT gallery.urlPhoto, job.id FROM gallery JOIN job ON gallery.idJob = job.id WHERE job.idUser = ?';
            server_1.pool.query(query, [idUser], (err, results) => {
                if (err)
                    return databaseFatalError(res, err, 'Error fetching images');
                logger.info({ idUser }, 'Getting user gallery');
                logger.info({ results }, 'Results');
                return res.json(results);
            });
        };
        this.changeJobLocationForUser = (req, res) => {
            /**
             * @param {number} idUser
             * @param {string} location
             * @description Change job location for user
             * @returns {json} message
             */
            const { idUser, location } = req.body;
            logger.info({ idUser, location }, 'Changing job location for user');
            const sql = 'UPDATE job SET city = ? WHERE idUser = ?';
            server_1.pool.query(sql, [location, idUser], (err, _) => {
                if (err)
                    return databaseFatalError(res, err, 'Error changing job location for user');
                return res.json({ message: "0" });
            });
        };
        this.sendOffer = (req, res) => {
            const { idJob, idMaster } = req.body;
            const userId = req.userId;
            if (!idJob || !idMaster) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            if (!userId) {
                return databaseFatalError(res, null, 'Unauthorized user');
            }
            const sql = 'INSERT INTO agreements (idJob, idUser, idMaster, currentStatus) VALUES (?, ?, ?, ?)';
            server_1.pool.query(sql, [idJob, userId, idMaster, 'offer'], (err, _) => {
                if (err)
                    return databaseFatalError(res, err, 'Error sending offer');
                logger.info({ idJob, userId, idMaster }, 'Sending offer');
                return res.json({ message: "0" });
            });
        };
        this.checkUserRequestForAgreement = (req, res) => {
            const { jobId } = req.body;
            const userId = req.userId;
            if (!jobId) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            if (!userId) {
                return databaseFatalError(res, null, 'Unauthorized user');
            }
            const sql = 'SELECT currentStatus FROM agreements WHERE idJob = ? AND idUser = ?';
            server_1.pool.query(sql, [jobId, userId], (err, result) => {
                if (err)
                    return databaseFatalError(res, err, 'Error checking user request for agreement');
                return res.json({ 'status': result.length > 0 ? result[0].currentStatus : 'no_request' });
            });
        };
        this.getTop3Jobs = (req, res) => {
            const { searchQuery } = req.query;
            logger.info({ searchQuery }, 'Getting top 3 jobs');
            if (!searchQuery) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            const sql = ` SELECT 
        g.urlPhoto,
        j.title,
        j.id,
        u.photo,
        u.username
        FROM job j JOIN gallery g ON g.idJob = j.id JOIN user u ON u.id = j.idUser 
        WHERE j.title LIKE ? LIMIT 3;`;
            server_1.pool.query(sql, [`%${searchQuery}%`], (err, results) => {
                if (err) {
                    return databaseFatalError(res, err, 'Error fetching top 3 jobs');
                }
                if (results.length === 0) {
                    return databaseFatalError(res, null, 'No jobs found');
                }
                res.status(200).json({
                    message: 'Top 3 jobs fetched successfully',
                    jobs: results
                });
            });
        };
        this.getJobsCountByStatus = (req, res) => {
            const { status, idUser } = req.body;
            if (!status) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            const sql = `SELECT COUNT(*) AS count FROM agreements WHERE currentStatus = ? and idMaster = ?;`;
            server_1.pool.query(sql, [status, idUser], (err, results) => {
                if (err) {
                    return databaseFatalError(res, err, 'Error fetching jobs count by status');
                }
                if (results.length === 0) {
                    res.status(200).json({
                        message: 'No jobs found',
                        count: 0
                    });
                }
                else {
                    res.status(200).json({
                        message: 'Jobs count fetched successfully',
                        count: results[0].count
                    });
                }
            });
        };
        // TODO
        this.deleteImageFromGallery = (req, res) => {
            const { idUser, index } = req.body;
            if (!idUser || !index) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            const sql = 'DELETE FROM gallery WHERE idUser = ? AND index = ?';
            server_1.pool.query(sql, [idUser, index], (err, _) => {
                if (err)
                    return databaseFatalError(res, err, 'Error deleting image from gallery');
                logger.info({ idUser, index }, 'Deleting image from gallery');
                return res.json({ message: "0" });
            });
        };
        this.uploadImage = (req, res) => {
            const { idUser, index, urlPhoto } = req.body;
            if (!idUser || !index || !urlPhoto) {
                return databaseFatalError(res, null, 'Missing required fields');
            }
            const sql = 'INSERT INTO gallery (idUser, index, urlPhoto) VALUES (?, ?, ?)';
            server_1.pool.query(sql, [idUser, index, urlPhoto], (err, _) => {
                if (err)
                    return databaseFatalError(res, err, 'Error uploading image');
                logger.info({ idUser, index }, 'Uploading image');
                return res.json({ message: "0" });
            });
        };
    }
}
exports.JobController = JobController;
