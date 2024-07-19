"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const job_controller_1 = require("../controllers/job.controller");
const jobRouter = express_1.default.Router();
jobRouter.route('/insertJob').post((req, res) => new job_controller_1.JobController().insertJob(req, res));
jobRouter.route('/getJobs').get((req, res) => new job_controller_1.JobController().getJobs(req, res));
jobRouter.route('/getJobById/:id').get((req, res) => new job_controller_1.JobController().getJobById(req, res));
jobRouter.route('/getJobsWithUserInfo').get((req, res) => new job_controller_1.JobController().getJobsWithUserInfo(req, res));
jobRouter.route('/getJobsWithUserInfo2').get((req, res) => new job_controller_1.JobController().getJobsWithUserInfo2(req, res));
jobRouter.route('/requestForAgreement').post((req, res) => new job_controller_1.JobController().requestForAgreement(req, res));
jobRouter.route('/updateJob').post((req, res) => new job_controller_1.JobController().updateJob(req, res));
exports.default = jobRouter;
