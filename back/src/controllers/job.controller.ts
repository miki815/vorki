import User from '../models/user';
import Job from '../models/job';
import express from 'express';
import { pool } from '../server';


export class JobController {

    insertJob = (req: express.Request, res: express.Response) => {
        const { description, title, city, profession, id, type } = req.body;
        var sql = 'INSERT INTO job (idUser, title, description, city, profession, type) VALUES (?, ?, ?, ?, ?, ?)';
        pool.query(sql, [id, title, description, city, profession, type], (err, user) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            console.log('User ' + id + ' added job: ' + title);
            res.json({ message: "0" });
        });
    }


    getJobs = (req: express.Request, res: express.Response) => {
        var sql = 'SELECT * FROM job';
        pool.query(sql, (err, jobs) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            res.json(jobs);
        });
    }

    getJobById = (req: express.Request, res: express.Response) => {
        console.log("Getting job with ID " + req.params.id);
        var sql = 'SELECT * FROM job WHERE id = ?';
        pool.query(sql, [req.params.id], (err, job) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            console.log(job);
            res.json(job);
        });
    }

    getJobsWithUserInfo = (req: express.Request, res: express.Response) => {
        var sql = 'SELECT * FROM job';
        pool.query(sql, (err, jobs) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            var sql = 'SELECT * FROM user';
            pool.query(sql, (err, users) => {
                if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
                jobs.forEach(job => {
                    job.user = users.find(user => user.id === job.idUser);
                });
                res.json(jobs);
            });
        });
    }

    getJobsWithUserInfo2 = (req: express.Request, res: express.Response) => {
        console.log("Getting jobs with user info");
        var sql = 'SELECT job.id, job.profession, job.title, job.description, job.city, job.idUser, user.username, user.photo,'
        sql += 'COALESCE((SELECT AVG(rate) FROM rate r WHERE r.idUser = job.idUser GROUP BY r.idUser), 0) AS avgRate, job.type '
        sql += 'FROM job INNER JOIN user ON job.idUser = user.id;';
        pool.query(sql, (err, jobs) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            console.log(jobs);
            res.json(jobs);
        });
    }

    requestForAgreement = (req: express.Request, res: express.Response) => {
        const { idJob, idUser, idMaster, startDate, endDate, additionalInfo } = req.body;
        var sql = 'INSERT INTO agreements (idJob, idUser, idMaster, startTime, endTime, additionalInfo, currentStatus) VALUES (?, ?, ?, ?, ?, ?, "pending")';
        pool.query(sql, [idJob, idUser, idMaster, startDate, endDate, additionalInfo], (err, user) => {
            if (err) { console.log(err); res.json({ error: 1, message: "Fatal error: " + err }); return; }
            console.log('User ' + idUser + ' requested agreement for job ' + idJob);
            res.json({ message: "0" });
        });
    }


    updateJob = (req: express.Request, res: express.Response) => {
        const { job } = req.body;
        console.log("Updating job " + job.id);
        var sql = 'UPDATE job SET title = ?, description = ?, city = ?, profession = ? WHERE id = ?';
        pool.query(sql, [job.title, job.description, job.city, job.profession, job.id], (err, info) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            console.log('Job ' + job.id + ' updated');
            res.json({ message: "Job updated" });
        });
    }

    getJobRequests = (req: express.Request, res: express.Response) => {
        var sql = 'SELECT agreements.*, job.title, user.username FROM agreements JOIN job ON agreements.idJob = job.id JOIN user ON agreements.idUser = user.id WHERE agreements.idMaster = ?;';
        console.log("Getting job requests for master " + req.params.idMaster);
        pool.query(sql, [req.params.idMaster], (err, requests) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            res.json(requests);
        });
    }

    updateAgreement = (req: express.Request, res: express.Response) => {
        const { idAgreements, status, startTime } = req.body;
        console.log("Updating agreement " + idAgreements + " to " + status);
        var sql = 'UPDATE agreements SET currentStatus = ?, startTime = ? WHERE idAgreements = ?';
        pool.query(sql, [status, startTime, idAgreements], (err, info) => {
            if (err) { console.log(err); res.json({ error: 1, message: "Fatal error: " + err }); return; }
            console.log('Agreement ' + idAgreements + ' updated');
            res.json({ message: "0" });
        });
    }

    getJobRequestsForUser = (req: express.Request, res: express.Response) => {
        var sql = 'SELECT agreements.*, job.title, user.username FROM agreements JOIN job ON agreements.idJob = job.id JOIN user ON agreements.idMaster = user.id WHERE agreements.idUser = ?;';
        console.log("Getting job requests for user " + req.params.idUser);
        pool.query(sql, [req.params.idUser], (err, requests) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            res.json(requests);
        });
    }
}