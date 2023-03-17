import { NextFunction, Request, Response, Router } from 'express';
import { User } from '../entity/User';
import { JsonDatabase } from '../json-data-source';
import { userLoginStatus, getMe } from '../utils/dhis2-api-functions';
import { Functions, generateUserMapData } from '../utils/functions';

const configRouter = Router();

configRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _repoConfig = new JsonDatabase('configs');
    const found = (Object.values(_repoConfig.all()))[0];
    // const _repoConfig = await getConfigRepository();
    // const found = (await _repoConfig.find())[0];
    return res.status(res.statusCode).json(found);
  }
  catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    return res.status(err.statusCode).end();
  }

});

configRouter.post('/appVersion', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json(Functions.appVersion());
  }
  catch (err: any) {
    return res.status(500).end();
  }
});

configRouter.post('/newToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.userId;
    const dhisusersession = req.body.dhisusersession;
    try {
      if (dhisusersession) {
        await userLoginStatus(dhisusersession)
          .then(r => {
            if (r == true) {
              getMe(dhisusersession).then((user: User) => {
                if (user.isActive !== true) {
                  return res.status(201).json({ status: 201, data: "You don't have permission to login!" });
                }
                const userData = generateUserMapData(user, dhisusersession);
                const _repoUser = new JsonDatabase('users');
                _repoUser.save(userData);

                return res.status(200).json({ status: 200, data: userData });
              }).catch(err => res.status(201).json({ status: 201, data: 'No user found with this crediential, retry!' }))

            } else {
              return res.status(201).json({ status: 201, data: 'Problem found when trying to connect' });
            }
          }).catch(err => res.status(201).json({ status: 201, data: 'Error When getting user informations, retry!' }));
      } else {
        return res.status(201).json({ status: 201, data: 'crediential error' });
      }
    }
    catch (err: any) {
      return res.status(201).json({ status: 201, data: `${err}` });
    }


    // console.log(id);
    // console.log(dhisusersession);
    // var users: User[] = (Object.values(_repoUser.getBy(id)) as User[]);

    // if (!notNull(users)) {
    //   return res.status(201).json({ status: 201, data: 'No User Found' });
    // } else {
    //   var user = generateUserMapData(users[0], dhisusersession);
    //   return res.status(200).json({ status: 200, data: user });
    // };

    // const repository = await getUserRepository();
    // const userFound = await repository.findOneBy({ id: id });

    // if (!userFound) {
    //   return res.status(201).json({ status: 201, data: 'No User Found' });
    // } else {
    //   var user: UserValue = generateAuthSuccessData(userFound);
    //   return res.status(200).json({ status: 200, data: user });
    // };
  }
  catch (err: any) {
    // if (!err.statusCode) err.statusCode = 500;
    return res.status(201).json({ status: 201, data: err });
  }
});



export = configRouter;
