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

export default jobRouter;