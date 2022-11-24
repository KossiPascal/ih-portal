import * as express from 'express';
import { body } from 'express-validator';
import { getUserRepository, User } from "../entity/User";
import { UserController } from "../controllers/user";

const userRouter = express.Router();
userRouter.get('/all', UserController.allUsers);

export = userRouter;
