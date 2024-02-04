
import { body } from "express-validator";
import { AuthUserController } from "../controllers/auth-user";
import { Router } from 'express';
import { getUsersRepository } from "../entity/User";

const AuthUserRouter = Router();

AuthUserRouter.post('/newToken', AuthUserController.newToken);
AuthUserRouter.post('/check-reload-user', AuthUserController.CheckReloadUser);

AuthUserRouter.post('/users-list', AuthUserController.allUsers);
AuthUserRouter.post('/update-user', AuthUserController.updateUser);
AuthUserRouter.post('/delete-user', AuthUserController.deleteUser);

AuthUserRouter.post('/roles-list', AuthUserController.GetRolesList);
AuthUserRouter.post('/create-role', AuthUserController.CreateRole);
AuthUserRouter.post('/update-role', AuthUserController.UpdateRole);
AuthUserRouter.post('/delete-role', AuthUserController.DeleteRole);

AuthUserRouter.post('/actions-list', AuthUserController.UserActionsList);
AuthUserRouter.post('/pages-list', AuthUserController.UserPagesList);

AuthUserRouter.post(
    '/login',
    [
        body('credential')
            .trim().not().isEmpty().isString()
            .withMessage('Please provide credential'),

        body('password')
            .trim().isLength({ min: 7 })
            .withMessage('Mot de passe trop cours (min:7)'),
    ],
    AuthUserController.login
);

AuthUserRouter.post(
    '/register',
    [
        body('username')
            .trim().not().isEmpty().isString()
            .withMessage('Please enter username.')
            .custom(async (username) => {
                const userRepo = await getUsersRepository();
                const user = await userRepo.findOneBy({ username: username });
                if (user) return Promise.reject('username already exist!');
            }),

        body('email').isEmail()
            .trim().isString()
            .withMessage('Please enter a valid email.')
            .custom(async (email) => {
                const userRepo = await getUsersRepository();
                const user = await userRepo.findOneBy({ email: email });
                if (user) return Promise.reject('Email address already exist!');
            }), // .normalizeEmail(),

        body('password').trim().isLength({ min: 7 }),
    ],
    AuthUserController.register
);


export = AuthUserRouter;
