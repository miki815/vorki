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

userRouter.route('/getCommentsByJobId').post(
    (req, res) => new UserController().getCommentsByJobId(req, res)
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

userRouter.route('/changePassword').post(
    (req, res) => new UserController().changePassword(req, res)
)

userRouter.route('/getIdByEmail').post(
    (req, res) => new UserController().getIdByEmail(req, res)
)

userRouter.route('/getIdByUsername').post(
    (req, res) => new UserController().getIdByUsername(req, res)
)

userRouter.route('/updateUser').post(
    (req, res) => new UserController().updateUser(req, res)
)

userRouter.route('/forgotPasswordRequest').post(
    (req, res) => new UserController().forgotPasswordRequest(req, res)
)

userRouter.route('/tokenValidation').post(
    (req, res)=>new UserController().tokenValidation(req, res)
)

userRouter.route('/changeForgottenPassword').post(
    (req, res)=>new UserController().changeForgottenPassword(req, res)
)

userRouter.route('/getTop5masters').get(
    (req, res)=>new UserController().getTop5masters(req, res)
)

userRouter.route('/support').post(
    (req, res)=>new UserController().support(req, res)
)

userRouter.route('/verify-user').post(
    (req, res)=>new UserController().verifyUser(req, res)
)

userRouter.route('/verify-token').post(
    (req, res)=>new UserController().verifyToken(req, res)
)

export default userRouter;