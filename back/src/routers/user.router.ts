import express from 'express'
import { UserController } from '../controllers/user.controller';


const userRouter = express.Router();

userRouter.route('/login').post(
    (req, res) => new UserController().login(req, res)
)
userRouter.route('/register').post(
    (req, res) => new UserController().register(req, res)
)

userRouter.route('/getUserById').post(
    (req, res) => new UserController().getUserById(req, res)
)

userRouter.route('/addComment').post(
    (req, res) => new UserController().addComment(req, res)
)

userRouter.route('/getCommentById').post(
    (req, res) => new UserController().getCommentById(req, res)
)

userRouter.route('/deleteCommentById').post(
    (req, res) => new UserController().deleteCommentById(req, res)
)

userRouter.route('/rate').post(
    (req, res) => new UserController().rate(req, res)
)

userRouter.route('/getRateByIdUser').post(
    (req, res) => new UserController().getRateByIdUser(req, res)
)

userRouter.route('/getRateByIdUserAndRater').post(
    (req, res) => new UserController().getRateByIdUserAndRater(req, res)
)



export default userRouter;