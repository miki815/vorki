import express from 'express'
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticateToken } from "..//auth";

const subscriptionRouter = express.Router();

subscriptionRouter.route('/get_related_subscribers').post(
    (req, res) => new SubscriptionController().get_related_subscribers(req, res)
)

subscriptionRouter.route('/inform_master_of_job').post(
    (req, res) => new SubscriptionController().inform_master_of_job(req, res)
)

subscriptionRouter.route('/inform_user_of_master_accept_their_job').post(
    (req, res) => new SubscriptionController().inform_user_of_master_accept_their_job(req, res)
)

subscriptionRouter.route('/subscribe').post(
    (req, res) => new SubscriptionController().subscribe(req, res)
)

subscriptionRouter.route('/save_subscription').post(
    (req, res) => new SubscriptionController().save_subscription(req, res)
)

subscriptionRouter.route('/unsubscribe').post(
    (req, res) => new SubscriptionController().unsubscribe(req, res)
)

export default subscriptionRouter;