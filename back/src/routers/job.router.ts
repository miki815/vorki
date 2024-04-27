import express from 'express'
import { JobController } from '../controllers/job.controller';


const jobRouter = express.Router();

jobRouter.route('/insertJob').post(
    (req, res) => new JobController().insertJob(req, res)
)

export default jobRouter;