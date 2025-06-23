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
jobRouter.route('/get_exchange_and_user_info').get((req, res) => new job_controller_1.JobController().get_exchange_and_user_info(req, res));
jobRouter.route('/requestForAgreement').post(// only user can request for agreement
auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().requestForAgreement(req, res));
jobRouter.route('/updateJob').post(// only job owner can update job
auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().updateJob(req, res));
jobRouter.route('/getJobRequests/:idMaster').get(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().getJobRequests(req, res));
jobRouter.route('/updateAgreement').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().updateAgreement(req, res));
jobRouter.route('/getJobRequestsForUser/:idUser').get(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().getJobRequestsForUser(req, res));
jobRouter.route('/getMastersCount').post((req, res) => new job_controller_1.JobController().getMastersCount(req, res));
jobRouter.route('/getJobGallery/:idJob').get((req, res) => new job_controller_1.JobController().getJobGallery(req, res));
jobRouter.route('/getGalleryByIdUser/:idUser').get((req, res) => new job_controller_1.JobController().getGalleryByIdUser(req, res));
jobRouter.route('/getUserGallery/:idUser').get((req, res) => new job_controller_1.JobController().getUserGallery(req, res));
jobRouter.route('/changeJobLocationForUser').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().changeJobLocationForUser(req, res));
jobRouter.route('/sendOffer').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().sendOffer(req, res));
jobRouter.route('/sendExchangeOffer').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().sendExchangeOffer(req, res));
jobRouter.route('/checkUserRequestForAgreement').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().checkUserRequestForAgreement(req, res));
jobRouter.route('/getTop3Jobs').get((req, res) => new job_controller_1.JobController().getTop3Jobs(req, res));
jobRouter.route('/getJobsCountByStatus').post((req, res) => new job_controller_1.JobController().getJobsCountByStatus(req, res));
jobRouter.route('/deleteImageFromGallery').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().deleteImageFromGallery(req, res));
jobRouter.route('/uploadImage').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().uploadImage(req, res));
jobRouter.route('/updateUserProfessions').post(auth_1.authenticateToken, (req, res) => new job_controller_1.JobController().updateUserProfessions(req, res));
jobRouter.route('/getPageJobs').post((req, res) => new job_controller_1.JobController().getPageJobs(req, res));
jobRouter.route('/getRelationIfExists').post((req, res) => new job_controller_1.JobController().getRelationIfExists(req, res));
exports.default = jobRouter;
