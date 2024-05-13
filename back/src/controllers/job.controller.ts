import User from '../models/user';
import Job from '../models/job';
import express from 'express';
import { connection } from '../server';


export class JobController {

    insertJob = (req: express.Request, res: express.Response) => {
        const { description, title, city, profession, id } = req.body;
        var sql = 'INSERT INTO job (idUser, title, description, city, profession) VALUES (?, ?, ?, ?, ?)';
        connection.query(sql, [id, title, description, city, profession], (err, user) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            console.log('User ' + id + ' added job: ' + title);
            res.json({ message: "0" });
        });
    }

    insertJobUser = (req: express.Request, res: express.Response) => {
        const { description, title, city, profession, id, telephone } = req.body;
        var sql = 'INSERT INTO jobUser (idUser, title, description, city, profession, telephone) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(sql, [id, title, description, city, profession, telephone], (err, user) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            console.log('User ' + id + ' added job: ' + title);
            res.json({ message: "0" });
        });
    }

    getJobs = (req: express.Request, res: express.Response) => {
        var sql = 'SELECT * FROM job';
        connection.query(sql, (err, jobs) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            res.json(jobs);
        });
    }

    getJobById = (req: express.Request, res: express.Response) => {
        var sql = 'SELECT * FROM job WHERE id = ?';
        connection.query(sql, [req.params.id], (err, job) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            res.json(job);
        });
    }

    getJobsWithUserInfo = (req: express.Request, res: express.Response) => {
        var sql = 'SELECT * FROM job';
        connection.query(sql, (err, jobs) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            var sql = 'SELECT * FROM user';
            connection.query(sql, (err, users) => {
                if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
                jobs.forEach(job => {
                    job.user = users.find(user => user.id === job.idUser);
                });
                res.json(jobs);
            });
        });
    }

    getJobsWithUserInfo2 = (req: express.Request, res: express.Response) => {
        var sql = 'SELECT job.id, job.profession, job.title, job.description, job.city, job.idUser, user.username, user.photo,'
        sql += 'COALESCE((SELECT AVG(rate) FROM rate r WHERE r.idUser = job.idUser GROUP BY r.idUser), 0) AS avgRate '
        sql += 'FROM job INNER JOIN user ON job.idUser = user.id;';
        connection.query(sql, (err, jobs) => {
            if (err) { res.json({ error: 1, message: "Fatal error: " + err }); return; }
            res.json(jobs);
        });
    }

}