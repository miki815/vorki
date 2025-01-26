import express from 'express'
import { SubscriptionController } from '../controllers/subscription.controller';

const subscriptionRouter = express.Router();

subscriptionRouter.route('/get_related_subscribers').post(
    (req, res) => new SubscriptionController().get_related_subscribers(req, res)
)

export default subscriptionRouter;