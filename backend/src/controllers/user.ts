import { Request, Response, NextFunction, Router } from 'express';
import { User, getUserRepository } from '../entity/User';
import { JsonDatabase } from '../json-data-source';

export class UserController {

    static allUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _repoUser = await getUserRepository();
            var users: User[] = await _repoUser.find();
            return res.status(200).json({ status: 200, data: users });
        } catch (err: any) {
            return res.status(201).json({ status: 201, data: `${err}` });
        }
    }

    static updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _repoUser = await getUserRepository();
            const { userId, dhisusersession } = req.body;
            const { id, roles, groups, meeting_report, actions } = req.body.user_to_update;
            const user = await _repoUser.findOneBy({ id: id });
            if (user) {
                user.roles = roles;
                user.groups = groups;
                user.meeting_report = meeting_report;
                user.actions = actions;
                const finalUser = await _repoUser.save(user);
                //var users: User[] = await _repoUser.find();
                return res.status(200).json({ status: 200, data: finalUser });
            }
            return res.status(201).json({ status: 201, data: 'Not Found' });
        } catch (err: any) {
            return res.status(201).json({ status: 201, data: `${err}` });
        }
    }

    static deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const repo = await getUserRepository();
            // if (req.body.isSuperAdmin!==true) {
            //     const user = await repo.delete({ id: req.body.id });
            //     return res.status(200).json({status:200, data:user});
            // } else {
            //     return res.status(res.statusCode).json({status:401, data:'Vous ne pouvez pas supprimer cet utilisateur'});
            // }
        } catch (err: any) {
            return res.status(201).json({ status: 201, data: `${err}` });
        }
    }
}




// {
//     order: {
//         singer: {
//             name: "ASC"
//         }
//     }
// }



// const { parse } = require('postgres-array')
// parse('{1,2,3}', (value) => parseInt(value, 10))  //=> [1, 2, 3]
// console.log(usersFound.toString);

// ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||


// let res = await repository.findAndCount({
//     where: [{ username : Like(`%${searchValue}%`) }, { action : Like(`%${searchValue}%`) }, { ip : Like(`%${searchValue}%`) }],
//     order: { [sortField]: sortOrder === "descend" ? 'DESC' : 'ASC', },
//     skip: (current - 1) * pageSize,
//     take: pageSize,
//   });

// ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||






// export const router: Router = Router();

// router.post('/api/register', async function (req: Request, res: Response, next: NextFunction) {
//     try {
//         const repository = await getUserRepository();
//         const username = req.body.username;
//         const email = req.body.email;
//         const user = toMap(req.body)
//         const usernameFound = await repository.findOneBy({ username: username });
//         const useremailFound = await repository.findOneBy({ email: email });
//         if (usernameFound || useremailFound) {
//             return res.status(res.statusCode).send('This Credential is already used !');
//         }
//         const hashedPassword = await bcrypt.hash(req.body.password, 12);
//         user.password = hashedPassword;
//         //   const uid = _function.uuid(filePath);
//         const result = await repository.save(user);
//         res.status(200).send(result);
//         next();
//     }
//     catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             return res.status(500).end();
//         }
//         next(err);
//         return res.status(err.statusCode).end();
//     }

// });

// router.post('/api/login', async function (req: Request, res: Response, next: NextFunction) {
//     try {
//         const repository = await getUserRepository();
//         const credential = req.body.credential;
//         const password = req.body.password;
//         const usernameFound = await repository.findOneBy({ username: credential });
//         const useremailFound = await repository.findOneBy({ email: credential });

//         if (!usernameFound && !useremailFound) {
//             return res.status(res.statusCode).send('No user with this crediential');
//         }

//         const userFound = usernameFound ?? useremailFound;

//         const isEqual = await bcrypt.compare(password, userFound.password);
//         if (!isEqual) {
//             return res.status(res.statusCode).send('Wrong password or Not Authorized !');
//         }
//         const token = jwt.sign(
//             {
//                 username: userFound.username,
//                 userId: userFound.id,
//             },
//             Config().secretOrPrivateKey,
//             { expiresIn: '1h' }
//         );
//         res.status(200).send({ token: token, userId: userFound.id });
//         next();
//     }
//     catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             return res.status(500).end();
//         }
//         next(err);
//         return res.status(err.statusCode).end();
//     }
// });






//   const user = new User();
//   user.username = req.body.username;
//   user.password = req.body.password;
// //   user.price = Number.parseFloat(req.body.price);
// //   user.stock = Number.parseInt(req.body.stock);

//   const result = await repository.save(user);
//   res.send(result);

// const OktaJwtVerifier = require('@okta/jwt-verifier');

// const oktaJwtVerifier = new OktaJwtVerifier({
//   clientId: '{YourClientId}',
//   issuer: 'https://{yourOktaDomain}/oauth2/default'
// });

// export async function oktaAuth(req:Request, res:Response, next:NextFunction) {
//   try {
//     const token = (req as any).token;
//     if (!token) {
//       return res.status(res.statusCode).send('Not Authorized');
//     }
//     const jwt = await oktaJwtVerifier.verifyAccessToken(token, 'api://default');
//     // @ts-ignore
//     req.user = {
//       uid: jwt.claims.uid,
//       email: jwt.claims.sub
//     };
//     next();
//   }
//   catch (err) {
//     return res.status(res.statusCode).send(err.message);
//   }
