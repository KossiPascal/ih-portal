import { Router } from 'express';
import { UserController } from "../controllers/user";

const userRouter = Router();
userRouter.get('/all', UserController.allUsers);
userRouter.post('/update', UserController.updateUser);
userRouter.post('/delete', UserController.deleteUser);



export = userRouter;
