"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const server_1 = require("../server");
class JobController {
    constructor() {
        this.insertJob = (req, res) => {
            const { description, title, city, profession, id, type } = req.body;
            console.log("data received: " + description + " " + title + " " + city + " " + profession + " " + id + " " + type);
            var sql = 'INSERT INTO job (idUser, title, description, city, profession, type) VALUES (?, ?, ?, ?, ?, ?)';
            server_1.pool.query(sql, [id, title, description, city, profession, type], (err, job) => {
                if (err)
                    console.log(err);
                else
                    console.log(job);
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                console.log('User ' + id + ' added job: ' + title);
                res.json({ message: "0" });
            });
        };
        this.getJobs = (req, res) => {
            var sql = 'SELECT * FROM job';
            server_1.pool.query(sql, (err, jobs) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                res.json(jobs);
            });
        };
        this.getJobById = (req, res) => {
            console.log("Getting job with ID " + req.params.id);
            var sql = 'SELECT * FROM job WHERE id = ?';
            server_1.pool.query(sql, [req.params.id], (err, job) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                console.log(job);
                res.json(job);
            });
        };
        this.getJobsWithUserInfo = (req, res) => {
            var sql = 'SELECT * FROM job';
            server_1.pool.query(sql, (err, jobs) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                var sql = 'SELECT * FROM user';
                server_1.pool.query(sql, (err, users) => {
                    if (err) {
                        res.json({ error: 1, message: "Fatal error: " + err });
                        return;
                    }
                    jobs.forEach(job => {
                        job.user = users.find(user => user.id === job.idUser);
                    });
                    res.json(jobs);
                });
            });
        };
        this.getJobsWithUserInfo2 = (req, res) => {
            console.log("Getting jobs with user info");
            var sql = 'SELECT job.id, job.profession, job.title, job.description, job.city, job.idUser, user.username, user.photo,';
            sql += 'COALESCE((SELECT AVG(rate) FROM rate r WHERE r.idUser = job.idUser GROUP BY r.idUser), 0) AS avgRate, job.type ';
            sql += 'FROM job INNER JOIN user ON job.idUser = user.id;';
            server_1.pool.query(sql, (err, jobs) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                console.log(jobs);
                res.json(jobs);
            });
        };
        this.requestForAgreement = (req, res) => {
            const { idJob, idUser, idMaster, startDate, endDate, additionalInfo } = req.body;
            var sql = 'INSERT INTO agreements (idJob, idUser, idMaster, startTime, endTime, additionalInfo, currentStatus) VALUES (?, ?, ?, ?, ?, ?, "pending")';
            server_1.pool.query(sql, [idJob, idUser, idMaster, startDate, endDate, additionalInfo], (err, user) => {
                if (err) {
                    console.log(err);
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                console.log('User ' + idUser + ' requested agreement for job ' + idJob);
                res.json({ message: "0" });
            });
        };
        this.updateJob = (req, res) => {
            const { job } = req.body;
            console.log("Updating job " + job.id);
            var sql = 'UPDATE job SET title = ?, description = ?, city = ?, profession = ? WHERE id = ?';
            server_1.pool.query(sql, [job.title, job.description, job.city, job.profession, job.id], (err, info) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                console.log('Job ' + job.id + ' updated');
                res.json({ message: "Job updated" });
            });
        };
        this.getJobRequests = (req, res) => {
            var sql = 'SELECT agreements.*, job.title, user.username FROM agreements JOIN job ON agreements.idJob = job.id JOIN user ON agreements.idUser = user.id WHERE agreements.idMaster = ?;';
            console.log("Getting job requests for master " + req.params.idMaster);
            server_1.pool.query(sql, [req.params.idMaster], (err, requests) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                res.json(requests);
            });
        };
        this.updateAgreement = (req, res) => {
            const { idAgreements, status, startTime } = req.body;
            console.log("Updating agreement " + idAgreements + " to " + status);
            var sql = 'UPDATE agreements SET currentStatus = ?, startTime = ? WHERE idAgreements = ?';
            server_1.pool.query(sql, [status, startTime, idAgreements], (err, info) => {
                if (err) {
                    console.log(err);
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                console.log('Agreement ' + idAgreements + ' updated');
                res.json({ message: "0" });
            });
        };
        this.getJobRequestsForUser = (req, res) => {
            var sql = 'SELECT agreements.*, job.title, user.username FROM agreements JOIN job ON agreements.idJob = job.id JOIN user ON agreements.idMaster = user.id WHERE agreements.idUser = ?;';
            console.log("Getting job requests for user " + req.params.idUser);
            server_1.pool.query(sql, [req.params.idUser], (err, requests) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                res.json(requests);
            });
        };
        this.getMastersCount = (req, res) => {
            const { jobsArray } = req.body;
            var sql = 'SELECT profession, COUNT(*) AS count FROM job WHERE profession IN(?) GROUP BY profession;';
            server_1.pool.query(sql, [jobsArray], (err, masters) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                console.log(masters);
                res.json(masters);
            });
        };
    }
}
exports.JobController = JobController;
