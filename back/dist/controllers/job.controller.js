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
    }
}
exports.JobController = JobController;
