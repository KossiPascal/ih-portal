import { Request, Response, NextFunction, Router } from 'express';
import { getUserRepository, toMap, User } from '../entity/User';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Config } from '../utils/config';


export class UserController {
    static allUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const repository = await getUserRepository();
            req.body.userId = 1;
            req.body.data = {roles:'[super_admin,admin]'};
            
            await repository.update({ id:req.body.userId, }, req.body.data);

            const usernameFound = await repository.find();
            
            // const { parse } = require('postgres-array')
            // parse('{1,2,3}', (value) => parseInt(value, 10))  //=> [1, 2, 3]
            // console.log(usernameFound.toString);

            return res.json(usernameFound);
        } catch (err:any) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
            return res.json(err.statusCode).end();
        }
    }

    static updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const repository = await getUserRepository();
            // req.body.data = {
            //     fullname: name,
            //     roles: roles,
            //     username: username
            //   }
            const usernameFound = await repository.update({ id:req.body.userId, }, req.body.data);

            // const { parse } = require('postgres-array')
            // parse('{1,2,3}', (value) => parseInt(value, 10))  //=> [1, 2, 3]
            console.log(usernameFound.toString);
        } catch (err:any) {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
            return res.json(err.statusCode).end();
        }
    }
}






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
//             return res.status(401).send('This Credential is already used !');
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
//             return res.status(401).send('No user with this crediential');
//         }

//         const userFound = usernameFound ?? useremailFound;

//         const isEqual = await bcrypt.compare(password, userFound.password);
//         if (!isEqual) {
//             return res.status(401).send('Wrong password or Not Authorized !');
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
//       return res.status(401).send('Not Authorized');
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
//     return res.status(401).send(err.message);
//   }
