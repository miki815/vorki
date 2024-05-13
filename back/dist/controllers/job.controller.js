"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const server_1 = require("../server");
class JobController {
    constructor() {
        this.insertJob = (req, res) => {
            const { description, title, city, profession, id } = req.body;
            var sql = 'INSERT INTO job (idUser, title, description, city, profession) VALUES (?, ?, ?, ?, ?)';
            server_1.connection.query(sql, [id, title, description, city, profession], (err, user) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                console.log('User ' + id + ' added job: ' + title);
                res.json({ message: "0" });
            });
        };
        this.insertJobUser = (req, res) => {
            const { description, title, city, profession, id, telephone } = req.body;
            var sql = 'INSERT INTO jobUser (idUser, title, description, city, profession, telephone) VALUES (?, ?, ?, ?, ?, ?)';
            server_1.connection.query(sql, [id, title, description, city, profession, telephone], (err, user) => {
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
            var sql = 'SELECT * FROM job WHERE id = ?';
            server_1.connection.query(sql, [req.params.id], (err, job) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
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
            sql += 'COALESCE((SELECT AVG(rate) FROM rate r WHERE r.idUser = job.idUser GROUP BY r.idUser), 0) AS avgRate ';
            sql += 'FROM job INNER JOIN user ON job.idUser = user.id;';
            server_1.connection.query(sql, (err, jobs) => {
                if (err) {
                    res.json({ error: 1, message: "Fatal error: " + err });
                    return;
                }
                res.json(jobs);
            });
        };
    }
}
exports.JobController = JobController;
