import { Request, Response, NextFunction } from 'express';
import { User, getUsersRepository, UpdateUserData } from '../entity/User';
import { notEmpty } from '../utils/functions';
import { Roles, GetRolesListOrNamesList, getRolesRepository } from '../entity/Roles';
const crypto = require('crypto');
// const { v4: uuidv4 } = require('uuid');
// const { shortid } = require('shortid');

// function availableUid<T>(datas: Array<T>): string {
//     let newId: string;
//     do {
//         newId = uuidv4(); //shortid.generate(); //
//     } while (datas.some((data: any) => (data as { id: string }).id === newId));
//     return newId;
// }

function generateShortId(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

function availableUid<T>(datas: Array<T>): string {
    let newId: string;
    do {
        newId = generateShortId(11);
    } while (datas.some((data: any) => (data as { id: string }).id === newId));
    return newId;
}

export async function CurrentUser(currentUserId: string): Promise<User | null> {
    const userRepo = await getUsersRepository();
    const userFound = await userRepo.findOneBy({ id: currentUserId });
    return userFound;
}

export class AuthUserController {
    static loginTest = async (username:string, password:string) => {
            const userRepo = await getUsersRepository();
            const rolRepo = await getRolesRepository();

            const roleLs = [
                'super_admin',
                'user_manager',
                'admin',
                'data_manager',
                'chws_data_viewer',
                'reports_manager',
                'chws_manager',
                'chws'
            ];

            for (let i = 0; i < roleLs.length; i++) {
                const r = roleLs[i];
                const role: Roles = new Roles();
                role.id = i+1;
                role.name = r;
                role.pages = this.pagesList;
                role.actions = this.actionsList;
                role.default_page = this.pagesList[0];
                await rolRepo.save(role);
            }

            const user = await userRepo.findOneBy({id:'zearydbk253'});

            if(user){
                user.id = 'zA7a5Wy9bkF';
                user.username = username;
                user.fullname = 'Kossi TSOLEGNAGBO';
                user.email = 'kossi.tsolegnagbo@aiesec.net';
                // user.password = await bcrypt.hash(password, 12);
                user.roles = ['1', '2', '3', '4', '5'];
                user.meeting_report = [];
                user.expiresIn = 0;
                user.token = '';
                user.isActive = true;
                user.isDeleted = false;
                user.mustLogin = true;
                user.useLocalStorage = false;

                const finalUser = await UpdateUserData(user);
    
                await userRepo.update('zearydbk253',finalUser);

                console.log(finalUser)
            }


    }



    static login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { credential, password } = req.body;

            // await AuthUserController.loginTest(credential, password);

            if (!credential || !password) {
                return res.status(201).json({ status: 201, data: 'Invalid credentials' });
            }

            const userRepo = await getUsersRepository();
            const userFound = await userRepo.findOne({ where: [{ username: credential }, { email: credential }] });

            if (!userFound || !userFound.isActive || userFound.isDeleted) {
                return res.status(201).json({ status: 201, data: 'Invalid user or inactive' });
            }

            // const isEqual = await bcrypt.compare(password, userFound.password);
            // if (!isEqual) {
            //     return res.status(201).json({ status: 201, data: 'Invalid password' });
            // }

            const finalUser = await UpdateUserData(userFound);

            finalUser.mustLogin = false;

            await userRepo.save(finalUser);

            finalUser.password = '';
            const formatedRoles = await GetRolesListOrNamesList(finalUser.roles);
            finalUser.roles = formatedRoles && notEmpty(formatedRoles) ? formatedRoles as Roles[] : [];

            return res.status(200).json({ status: 200, data: finalUser });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err.message || 'Internal Server Error'}` });
        }
    };

    static register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, username, email, password, fullname, roles, meeting_report, expiresIn, token, isActive } = req.body;
            if (!username || !password) return res.status(201).json({ status: 201, data: 'Invalid credentials' });

            const userRepo = await getUsersRepository();
            const userFound = await userRepo.findOne({ where: [{ username: username }, notEmpty(email) && email !== '@' ? { email: email } : {}] });

            if (userFound && notEmpty(userFound)) return res.status(201).json({ status: 201, data: 'Username or email already in use' });
            var users: User[] = await userRepo.find();

            const user = new User();
            user.id = availableUid(users);
            user.username = username;
            user.fullname = fullname;
            user.email = email;
            // user.password = await bcrypt.hash(password, 12);
            user.roles = roles;
            user.meeting_report = meeting_report;
            user.expiresIn = expiresIn;
            user.token = token;
            user.isActive = isActive;

            await userRepo.save(user);

            return res.status(200).json({ status: 200, data: 'User registered successfully' });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err.message || 'Internal Server Error'}` });
        }
    };

    static newToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {userId, updateReload} = req.body;
            if (userId) {
                const userRepo = await getUsersRepository();
                const user = await userRepo.findOneBy({ id: userId });
                if (!user || user && (!user.isActive || user.isDeleted)) return res.status(201).json({ status: 201, data: 'error' });

                const userData = await UpdateUserData(user);
                if(updateReload == true) userData.mustLogin = false;
                const finalUser = await userRepo.save(userData);
                finalUser.password = '';

                const formatedRoles = await GetRolesListOrNamesList(finalUser.roles);
                finalUser.roles = formatedRoles && notEmpty(formatedRoles) ? formatedRoles as Roles[] : [];

                return res.status(200).json({ status: 200, data: finalUser });
            }
            return res.status(201).json({ status: 201, data: 'no user ID provided' });
        } catch (err) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    };

    static CheckReloadUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.body.userId;
            if (userId) {
                const userRepo = await getUsersRepository();
                const user = await userRepo.findOneBy({ id: userId });
                if (!user || user && (!user.isActive || user.isDeleted || user.mustLogin)) return res.status(201).json({ status: 201, data: 'error' });
                user.password = '';

                const formatedRoles = await GetRolesListOrNamesList(user.roles);
                user.roles = formatedRoles && notEmpty(formatedRoles) ? formatedRoles as Roles[] : [];

                return res.status(200).json({ status: 200, data: user });
            }
            return res.status(201).json({ status: 201, data: 'no user ID provided' });
        } catch (err) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    };


    static allUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.body.userId;
            const userRepo = await getUsersRepository();
            var users: User[] = await userRepo.find();
            const finalUsers = await Promise.all(users.map(async user => {
                const formatedRoles = await GetRolesListOrNamesList(user.roles);
                const finalRoles = formatedRoles && notEmpty(formatedRoles) ? formatedRoles as Roles[] : [];
                const newUser = { ...user, password: '', roles: finalRoles };
                return newUser;
            }));

            return res.status(200).json({ status: 200, data: finalUsers });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.body.userId;
            const { id, email, password, fullname, roles, meeting_report, isActive } = req.body.user;
            if (!id) return res.status(201).json({ status: 201, data: 'Invalid user ID' });

            const userRepo = await getUsersRepository();
            const userFound = await userRepo.findOneBy({ id: id });
            if (!userFound) return res.status(201).json({ status: 201, data: 'User not found' });

            // if (password && notEmpty(password)) userFound.password = await bcrypt.hash(password, 12);
            if (fullname && notEmpty(fullname)) userFound.fullname = fullname;
            if (email && notEmpty(email)) userFound.email = email;
            if (roles && notEmpty(roles)) userFound.roles = roles;
            if (meeting_report && notEmpty(meeting_report)) userFound.meeting_report = meeting_report;
            if (isActive && notEmpty(isActive)) userFound.isActive = isActive;
            // if (userId != id) userFound.mustLogin = true;
            userFound.mustLogin = true;

            await userRepo.update(userFound.id, userFound);

            userFound.password = '';
            const formatedRoles = await GetRolesListOrNamesList(userFound.roles);
            userFound.roles = formatedRoles && notEmpty(formatedRoles) ? formatedRoles as Roles[] : [];

            return res.status(200).json({ status: 200, data: userFound });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err.message || 'Internal Server Error'}` });
        }
    };

    static updateUserPassWord = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, old_password, new_password, userId } = req.body.user;
            if (!id) return res.status(201).json({ status: 201, data: 'Invalid user ID' });

            const userRepo = await getUsersRepository();
            const userFound = await userRepo.findOneBy({ id });
            if (!userFound) return res.status(201).json({ status: 201, data: 'User not found' });

            if (old_password && notEmpty(old_password) && new_password && notEmpty(new_password)) {
                // const isOldPasswordValid = await bcrypt.compare(old_password, userFound.password);
                // if (!isOldPasswordValid) return res.status(201).json({ status: 201, data: 'Old password does not match' });
                // if (new_password && notEmpty(new_password)) userFound.password = await bcrypt.hash(new_password, 12);
            }
            userFound.mustLogin = true;
            await userRepo.save(userFound);

            userFound.password = '';
            const formatedRoles = await GetRolesListOrNamesList(userFound.roles);
            userFound.roles = formatedRoles && notEmpty(formatedRoles) ? formatedRoles as Roles[] : [];

            return res.status(200).json({ status: 200, data: userFound });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err.message || 'Internal Server Error'}` });
        }
    };

    static deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, permanentDelete, isSuperAdmin } = req.body;
            const id = req.body.user.id;

            const userRepo = await getUsersRepository();

            if (isSuperAdmin == true && id) {
                const user = await userRepo.findOneBy({ id: id });
                if (user) {
                    if (permanentDelete != true) {
                        user.token = '';
                        user.meeting_report = [];
                        user.roles = [];
                        user.isActive = false;
                        user.isDeleted = true;
                        user.deletedAt = new Date();
                        user.mustLogin = true;
                        await userRepo.update(id, user);
                    } else {
                        // await userRepo.delete({ id: id });
                    }
                    return res.status(200).json({ status: 200, data: 'success' });
                }
                return res.status(201).json({ status: 201, data: 'No user found' });
            }
            return res.status(201).json({ status: 201, data: 'Vous ne pouvez pas supprimer cet utilisateur' });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static GetRolesList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const repo = await getRolesRepository();
            var roles: Roles[] = await repo.find();
            return res.status(200).json({ status: 200, data: roles });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static CreateRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, name, pages, actions, default_page, userId } = req.body;
            const repo = await getRolesRepository();
            const roleFound = await repo.findOne({ where: [notEmpty(id) ? { id: id } : {}, notEmpty(name) ? { name: name } : {}] });

            if (roleFound && notEmpty(roleFound)) {
                return res.status(201).json({ status: 201, data: 'Role already exist' });
            }
            const role: Roles = new Roles();
            role.name = name;
            role.pages = pages;
            role.actions = actions;
            role.default_page = default_page;
            await repo.save(role);
            var roles: Roles[] = await repo.find();
            return res.status(200).json({ status: 200, data: roles });

        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static UpdateRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, name, pages, actions, default_page, userId } = req.body;
            const repo = await getRolesRepository();
            const roleFound = await repo.findOne({ where: [{ id: id }, { name: name }] });
            if (roleFound && notEmpty(roleFound) && id) {
                const userRepo = await getUsersRepository();
                const users = await userRepo.find();
                const selectedUsers = users.filter(user => (user.roles as string[]).includes(`${id}`));
                selectedUsers.forEach(user => {
                    user.mustLogin = true;
                    userRepo.update(user.id, user);
                });

                roleFound.id = id;
                roleFound.name = name;
                roleFound.pages = pages;
                roleFound.actions = actions;
                roleFound.default_page = default_page;
                await repo.update(id, roleFound);

                var roles: Roles[] = await repo.find();
                return res.status(200).json({ status: 200, data: roles });
            }
            return res.status(201).json({ status: 201, data: 'No Id Provided' });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static DeleteRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, isSuperAdmin, userId } = req.body;
            if (isSuperAdmin !== true) {
                const repo = await getRolesRepository();
                const role = await repo.findOneBy({ id: id });
                if (role) {
                    const userRepo = await getUsersRepository();
                    const users = await userRepo.find();
                    const selectedUsers = users.filter(user => (user.roles as string[]).includes(id));

                    role.isDeleted = true;
                    role.deletedAt = new Date();
                    repo.update(role.id, role);

                    selectedUsers.forEach(user => {
                        const index = (user.roles as string[]).indexOf(`${id}`);
                        if (index !== -1) {
                            user.roles.splice(index, 1);
                            user.mustLogin = true;
                            userRepo.update(user.id, user);
                        }
                    });

                    return res.status(200).json({ status: 200, data: 'success' });
                }
                return res.status(201).json({ status: 201, data: 'No role found' });
            }
            return res.status(201).json({ status: 201, data: 'Vous ne pouvez pas supprimer cet utilisateur' });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static UserActionsList = async (req: Request, res: Response, next: NextFunction) => {
        return res.status(200).json({ status: 200, data: this.actionsList });
    }

    static UserPagesList = async (req: Request, res: Response, next: NextFunction) => {
        return res.status(200).json({ status: 200, data: this.pagesList });
    }


    static actionsList = [
        'can_create_team',
        'can_create_person',
        'can_create_report',
        'can_create_role',

        'can_update_team',
        'can_update_person',
        'can_update_report',
        'can_update_role',

        'can_delete_team',
        'can_delete_person',
        'can_delete_report',
        'can_delete_role',

        'can_register_user',
        'can_logout',
        'can_view_left_navigation',
        'can_view_top_navigation'
    ];


    static pagesList = [
        "admin/users-list",
        "admin/roles-list",
        "admin/database-utils",
        "admin/documentations",

        "manage-data/auto-full-sync",
        "manage-data/sync-steply",
        "manage-data/sync-to-dhis2",
        "manage-data/sync-weekly-data",

        "manage-chws/replacements",
        "manage-chws/chws-drug",

        "view-chws-data/dashboard1",
        "view-chws-data/dashboard2",
        "view-chws-data/dashboard3",
        "view-chws-data/dashboard4",
        "view-chws-data/highchartmap1",
        "view-chws-data/highchartmap2",
        "view-chws-data/highchartmap3",
        "view-chws-data/googlemap",

        "auths/cache-list",
        "auths/change-password",
        "auths/error",

        "chws/dashboard1",
        "chws/dashboard2",
        "chws/dashboard3",
        "chws/dashboard4",
        "chws/select_orgunit",

        "manage-reports/meeting-report",

        // "auths/lock-screen",
        // "auths/login",
        // "auths/register",
        // "auths/forgot-password"
    ];

}

// let res = await repository.findAndCount({
//     where: [{ username : Like(`%${searchValue}%`) }, { action : Like(`%${searchValue}%`) }, { ip : Like(`%${searchValue}%`) }],
//     order: { [sortField]: sortOrder === "descend" ? 'DESC' : 'ASC', },
//     skip: (current - 1) * pageSize,
//     take: pageSize
// });