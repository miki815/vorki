"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const server_1 = require("../server");
class JobController {
    constructor() {
        this.insertJob = (req, res) => {
            const { description, title, city, profession, id, type } = req.body;
            var sql = 'INSERT INTO job (idUser, title, description, city, profession, type) VALUES (?, ?, ?, ?, ?, ?)';
            server_1.connection.query(sql, [id, title, description, city, profession, type], (err, user) => {
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
            server_1.connection.query(sql, (err, jobs) => {
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
            server_1.connection.query(sql, [req.params.id], (err, job) => {
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
            server_1.connection.query(sql, (err, jobs) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                var sql = 'SELECT * FROM user';
                server_1.connection.query(sql, (err, users) => {
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
            var sql = 'SELECT job.id, job.profession, job.title, job.description, job.city, job.idUser, user.username, user.photo,';
            sql += 'COALESCE((SELECT AVG(rate) FROM rate r WHERE r.idUser = job.idUser GROUP BY r.idUser), 0) AS avgRate, job.type ';
            sql += 'FROM job INNER JOIN user ON job.idUser = user.id;';
            server_1.connection.query(sql, (err, jobs) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                res.json(jobs);
            });
        };
        this.requestForAgreement = (req, res) => {
            const { idJob, idUser, idMaster, startDate, endDate, additionalInfo } = req.body;
            var sql = 'INSERT INTO agreements (idJob, idUser, idMaster, startTime, endTime, additionalInfo, currentStatus) VALUES (?, ?, ?, ?, ?, ?, "pending")';
            server_1.connection.query(sql, [idJob, idUser, idMaster, startDate, endDate, additionalInfo], (err, user) => {
                if (err) {
                    console.log(err);
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                console.log('User ' + idUser + ' requested agreement for job ' + idJob);
                res.json({ message: "0" });
            });
        };
    }
}
exports.JobController = JobController;
