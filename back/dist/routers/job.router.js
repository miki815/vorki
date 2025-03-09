"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const job_controller_1 = require("../controllers/job.controller");
const auth_1 = require("..//auth");
const jobRouter = express_1.default.Router();
jobRouter.route('/insertJob').post(// only user can insert job
auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().insertJob(req, res));
jobRouter.route('/getJobs').get((req, res) => new job_controller_1.JobController().getJobs(req, res));
jobRouter.route('/getJobById/:id').get((req, res) => new job_controller_1.JobController().getJobById(req, res));
jobRouter.route('/getJobsWithUserInfo').get((req, res) => new job_controller_1.JobController().getJobsWithUserInfo(req, res));
jobRouter.route('/getJobsWithUserInfo2').get((req, res) => new job_controller_1.JobController().getJobsWithUserInfo2(req, res));
jobRouter.route('/get_job_and_user_info/:id').get((req, res) => new job_controller_1.JobController().get_job_and_user_info(req, res));
jobRouter.route('/requestForAgreement').post(// only user can request for agreement
auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().requestForAgreement(req, res));
jobRouter.route('/updateJob').post(// only job owner can update job
auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().updateJob(req, res));
jobRouter.route('/getJobRequests/:idMaster').get(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().getJobRequests(req, res));
jobRouter.route('/updateAgreement').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().updateAgreement(req, res));
jobRouter.route('/getJobRequestsForUser/:idUser').get(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().getJobRequestsForUser(req, res));
jobRouter.route('/getMastersCount').post((req, res) => new job_controller_1.JobController().getMastersCount(req, res));
jobRouter.route('/getJobGallery/:idJob').get((req, res) => new job_controller_1.JobController().getJobGallery(req, res));
jobRouter.route('/changeJobLocationForUser').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().changeJobLocationForUser(req, res));
exports.default = jobRouter;
