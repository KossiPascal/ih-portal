import { Router } from 'express';
import { UserController } from "../controllers/user";

const userRouter = Router();
userRouter.get('/all', UserController.allUsers);

export = userRouter;
