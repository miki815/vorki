"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("..//auth");
const userRouter = express_1.default.Router();
userRouter.route('/login').post((req, res) => new user_controller_1.UserController().login(req, res));
userRouter.route('/register').post((req, res) => new user_controller_1.UserController().register(req, res));
userRouter.route('/getUserById').post((req, res) => new user_controller_1.UserController().getUserById(req, res));
userRouter.route('/addComment').post(// only user can comment
auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().addComment(req, res));
userRouter.route('/getCommentById').post(// only user can see his comment
// deprecated, use getCommentsByJobId instead
auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().getCommentById(req, res));
userRouter.route('/getCommentsByJobId').post(auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().getCommentsByJobId(req, res));
userRouter.route('/deleteCommentById').post(// only user can delete his comment
auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().deleteCommentById(req, res));
userRouter.route('/rate').post(// idRater is taken from token
auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().rate(req, res));
userRouter.route('/getRateByIdUser').post(// only user can see his rate
auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().getRateByIdUser(req, res));
userRouter.route('/getRateByIdUserAndRater').post(// only user and his rater can see his rate
auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().getRateByIdUserAndRater(req, res));
userRouter.route('/changePassword').post(// only user can change his password
auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().changePassword(req, res));
userRouter.route('/getIdByEmail').post((req, res) => new user_controller_1.UserController().getIdByEmail(req, res));
userRouter.route('/getIdByUsername').post((req, res) => new user_controller_1.UserController().getIdByUsername(req, res));
userRouter.route('/updateUser').post(// only user can update his profile
auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().updateUser(req, res));
userRouter.route('/forgotPasswordRequest').post((req, res) => new user_controller_1.UserController().forgotPasswordRequest(req, res));
userRouter.route('/tokenValidation').post((req, res) => new user_controller_1.UserController().tokenValidation(req, res));
userRouter.route('/changeForgottenPassword').post((req, res) => new user_controller_1.UserController().changeForgottenPassword(req, res));
userRouter.route('/getTop5masters').get((req, res) => new user_controller_1.UserController().getTop5masters(req, res));
userRouter.route('/support').post((req, res) => new user_controller_1.UserController().support(req, res));
userRouter.route('/verify-user').post((req, res) => new user_controller_1.UserController().verifyUser(req, res));
userRouter.route('/verify-token').post((req, res) => new user_controller_1.UserController().verifyToken(req, res));
userRouter.route('/isUserSubscribed').get(auth_1.authenticateToken, (req, res) => new user_controller_1.UserController().isUserSubscribed(req, res));
exports.default = userRouter;
