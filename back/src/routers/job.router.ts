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

jobRouter.route('/getGalleryByIdUser/:idUser').get(
    (req, res) => new JobController().getGalleryByIdUser(req, res)
)

jobRouter.route('/getUserGallery/:idUser').get(
    (req, res) => new JobController().getUserGallery(req, res)
)

jobRouter.route('/changeJobLocationForUser').post(
    authenticateToken, (req, res) => new JobController().changeJobLocationForUser(req, res)
)

jobRouter.route('/sendOffer').post(
    authenticateToken, (req, res) => new JobController().sendOffer(req, res)
)

jobRouter.route('/checkUserRequestForAgreement').post(
    authenticateToken, (req, res) => new JobController().checkUserRequestForAgreement(req, res)
)

jobRouter.route('/getTop3Jobs').get(
    (req, res) => new JobController().getTop3Jobs(req, res)
)

jobRouter.route('/getJobsCountByStatus').post(
    (req, res) => new JobController().getJobsCountByStatus(req, res)
)

jobRouter.route('/deleteImageFromGallery').post(
    authenticateToken, (req, res) => new JobController().deleteImageFromGallery(req, res)
)

jobRouter.route('/uploadImage').post(
    authenticateToken, (req, res) => new JobController().uploadImage(req, res)
)

export default jobRouter;