import { NextFunction, Request, Response, Router } from 'express';
import { getConfigRepository } from '../entity/Configs';
import { User } from '../entity/User';
import { JsonDatabase } from '../json-data-source';
import { UserValue } from '../utils/appInterface';
import { Functions, genarateToken, generateUserMapData, isNotNull } from '../utils/functions';

const configRouter = Router();

configRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
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

configRouter.get('/appVersion', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(res.statusCode).json(Functions.appVersion());
  }
  catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    return res.status(err.statusCode).end();
  }
});

configRouter.post('/newToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.body.userId;
    const dhisusersession = req.body.dhisusersession;
    const _repoUser = new JsonDatabase('users');

    // console.log(id)
    // console.log('-----------------------')
    // console.log(dhisusersession)

    
    // var users: User[] = (Object.values(_repoUser.getBy(id)) as User[]);

    // if (!isNotNull(users)) {
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
