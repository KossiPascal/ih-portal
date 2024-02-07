
import { body } from "express-validator";
import { AuthUserController } from "../controllers/auth-user";
import { Router } from 'express';
import { getUsersRepository } from "../entity/User";
import { Middelware } from "../middleware/auth";

const AuthUserRouter = Router();

AuthUserRouter.post('/newToken', Middelware.authMiddleware, AuthUserController.newToken);
AuthUserRouter.post('/check-reload-user', Middelware.authMiddleware, AuthUserController.CheckReloadUser);

AuthUserRouter.post('/users-list', Middelware.authMiddleware, AuthUserController.allUsers);
AuthUserRouter.post('/update-user', Middelware.authMiddleware, AuthUserController.updateUser);
AuthUserRouter.post('/delete-user', Middelware.authMiddleware, AuthUserController.deleteUser);
AuthUserRouter.post('/update-user-password', Middelware.authMiddleware, AuthUserController.updateUserPassWord);

AuthUserRouter.post('/roles-list', Middelware.authMiddleware, AuthUserController.GetRolesList);
AuthUserRouter.post('/create-role', Middelware.authMiddleware, AuthUserController.CreateRole);
AuthUserRouter.post('/update-role', Middelware.authMiddleware, AuthUserController.UpdateRole);
AuthUserRouter.post('/delete-role', Middelware.authMiddleware, AuthUserController.DeleteRole);

AuthUserRouter.post('/actions-list', Middelware.authMiddleware, AuthUserController.UserActionsList);
AuthUserRouter.post('/pages-list', Middelware.authMiddleware, AuthUserController.UserPagesList);

AuthUserRouter.post('/api-access-key', Middelware.authMiddleware, AuthUserController.ApiAccessKeyList);

AuthUserRouter.post(
    '/login',
    // [
    //     body('credential')
    //         .trim().not().isEmpty().isString()
    //         .withMessage('Please provide credential'),

    //     body('password')
    //         .trim().isLength({ min: 7 })
    //         .withMessage('Mot de passe trop cours (min:7)'),
    // ],
    AuthUserController.login
);

AuthUserRouter.post(
    '/register',
    // [
    //     body('username')
    //         .trim().not().isEmpty().isString()
    //         .withMessage('Please enter username.')
    //         .custom(async (username) => {
    //             const userRepo = await getUsersRepository();
    //             const user = await userRepo.findOneBy({ username: username });
    //             if (user) return Promise.reject('username already exist!');
    //         }),

    //     body('email').isEmail()
    //         .trim().isString()
    //         .withMessage('Please enter a valid email.')
    //         .custom(async (email) => {
    //             const userRepo = await getUsersRepository();
    //             const user = await userRepo.findOneBy({ email: email });
    //             if (user) return Promise.reject('Email address already exist!');
    //         }), // .normalizeEmail(),

    //     body('password').trim().isLength({ min: 7 }),
    // ],
    Middelware.authMiddleware,
    AuthUserController.register
);


export = AuthUserRouter;
