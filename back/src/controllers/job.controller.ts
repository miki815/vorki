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
}