import { Request, Response, NextFunction, Router } from 'express';
import { Utils } from '../utils/utils';
import { UserValue } from '../utils/appInterface';
import moment from "moment";
import { ConversionUtils } from 'turbocommons-ts';
import { getUserRepository, User, toMap } from '../entity/User';

export class AuthController {
    static register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const repository = await getUserRepository();
            const user: User = toMap(req.body)

            const usernameFound = await repository.findOneBy({ username: user.username });
            const useremailFound = await repository.findOneBy({ email: user.email });
            if (usernameFound || useremailFound) return res.status(res.statusCode).send({ status: 401, data: 'This Credential is already used !' });

            user.password = await user.hashPassword();
            const result = await repository.save(user);
            return res.status(res.statusCode).send({ status: 200, data: result });
            // next();
        }
        catch (err: any) {
            if (!err.statusCode) err.statusCode = 500;
            // next(err);
            return res.status(err.statusCode).send({ status: err.statusCode, data: `${err}` });

        }
    }

    static login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const credential = req.body.credential;
            const password = req.body.password;

            if (credential && password) {
                const repository = await getUserRepository();
                const usernameFound = await repository.findOneBy({ username: credential });
                let useremailFound: User | null | undefined;

                if (!usernameFound) useremailFound = await repository.findOneBy({ email: credential });

                if (!usernameFound && !useremailFound) {
                    return res.status(res.statusCode).json({ status: 401, data: 'No user found with this crediential, retry!' });
                } else {
                    const userFound = usernameFound ?? useremailFound;
                    if (userFound) {
                        if (userFound.isActive !== true && userFound.isSuperAdmin !== true) {
                            return res.status(res.statusCode).json({ status: 401, data: "You don't have permission to login!" });
                        }
                        const isEqual = await userFound.comparePassword(password);
                        if (!isEqual) {
                            return res.status(res.statusCode).json({ status: 401, data: 'Wrong password or Not Authorized !' });
                        }

                        var user: UserValue = {
                            token: userFound.token(),
                            id: userFound.id,
                            username: userFound.username,
                            fullname: userFound.fullname,
                            roles: ConversionUtils.stringToBase64(userFound.roles),
                            isActive: userFound.isActive,
                            expiresIn: JSON.stringify((moment().add(Utils().expiredIn, 'seconds')).valueOf())
                            // moment(moment(), "DD-MM-YYYY hh:mm:ss").add(Utils().expiredIn, 'seconds');
                        };

                        return res.status(res.statusCode).json({ status: 200, data: user });
                    } else {
                        return res.status(res.statusCode).json({ status: 401, data: 'No user found with this crediential, retry!' });
                    }
                }
            } else {

                if (!credential) {
                    return res.status(res.statusCode).json({ status: 401, data: 'No username given' });
                } else if (!password) {
                    return res.status(res.statusCode).json({ status: 401, data: 'You not give password!' });
                } else {
                    return res.status(res.statusCode).json({ status: 401, data: 'crediential error' });
                }
            }
        }
        catch (err: any) {
            if (!err.statusCode) err.statusCode = 500;
            // next(err);
            return res.status(err.statusCode).end();
            // return res.status(err.statusCode).send("You don't have permission to logIn");
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
//             Utils().secretOrPrivateKey,
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
