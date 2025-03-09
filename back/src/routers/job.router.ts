import express from 'express'
import { JobController } from '../controllers/job.controller';
import { authenticateToken } from "..//auth";


const jobRouter = express.Router();

jobRouter.route('/insertJob').post( // only user can insert job
    authenticateToken, (req, res) => new JobController().insertJob(req, res)
)

jobRouter.route('/getJobs').get(
    (req, res) => new JobController().getJobs(req, res)
)

jobRouter.route('/getJobById/:id').get(
    (req, res) => new JobController().getJobById(req, res)
)

jobRouter.route('/getJobsWithUserInfo').get(
    (req, res) => new JobController().getJobsWithUserInfo(req, res)
)

jobRouter.route('/getJobsWithUserInfo2').get(
    (req, res) => new JobController().getJobsWithUserInfo2(req, res)
)

jobRouter.route('/get_job_and_user_info/:id').get(
    (req, res) => new JobController().get_job_and_user_info(req, res)
)

jobRouter.route('/requestForAgreement').post( // only user can request for agreement
    authenticateToken, (req, res) => new JobController().requestForAgreement(req, res)
)

jobRouter.route('/updateJob').post( // only job owner can update job
    authenticateToken, (req, res) => new JobController().updateJob(req, res)
)

jobRouter.route('/getJobRequests/:idMaster').get(
    authenticateToken, (req, res) => new JobController().getJobRequests(req, res)
)

jobRouter.route('/updateAgreement').post(
    authenticateToken, (req, res) => new JobController().updateAgreement(req, res)
)

jobRouter.route('/getJobRequestsForUser/:idUser').get(
    authenticateToken, (req, res) => new JobController().getJobRequestsForUser(req, res)
)

jobRouter.route('/getMastersCount').post(
    (req, res) => new JobController().getMastersCount(req, res)
)

jobRouter.route('/getJobGallery/:idJob').get(
    (req, res) => new JobController().getJobGallery(req, res)
)

jobRouter.route('/changeJobLocationForUser').post(
    authenticateToken, (req, res) => new JobController().changeJobLocationForUser(req, res)
)

export default jobRouter;