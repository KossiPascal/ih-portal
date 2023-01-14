import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import { getConfigRepository } from '../entity/Configs';
import { getUserRepository } from '../entity/User';
import { UserValue } from '../utils/appInterface';
import { Functions, genarateToken, generateAuthSuccessData } from '../utils/functions';
import { Utils } from '../utils/utils';
import { ConversionUtils } from 'turbocommons-ts';

const configRouter = Router();

configRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = await getConfigRepository();
    const found = (await repository.find())[0];
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
    const repository = await getUserRepository();
    const userFound = await repository.findOneBy({ id: id });

    if (!userFound) {
      return res.status(401).json({ status: 401, data: 'No User Found' });
    } else {
      var user: UserValue = generateAuthSuccessData(userFound);
      return res.status(res.statusCode).json({ status: 200, data: user });
    };
  }
  catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    return res.status(err.statusCode).json({ status: err.statusCode, data: err });
  }
});



export = configRouter;
