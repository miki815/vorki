import express from 'express'
import { JobController } from '../controllers/job.controller';


const jobRouter = express.Router();

jobRouter.route('/insertJob').post(
    (req, res) => new JobController().insertJob(req, res)
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

jobRouter.route('/requestForAgreement').post(
    (req, res) => new JobController().requestForAgreement(req, res)
)

jobRouter.route('/updateJob').post(
    (req, res) => new JobController().updateJob(req, res)
)


export default jobRouter;