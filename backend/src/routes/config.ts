import { NextFunction, Request, Response, Router} from 'express';
import { getConfigRepository } from '../entity/Configs';
import { Functions } from '../utils/functions';

const configRouter = Router();

configRouter.get('/',async (req: Request, res: Response, next: NextFunction) => {
  try {
      const repository = await getConfigRepository();
      const found = (await repository.find())[0];
      return res.status(res.statusCode).json(found);
  }
  catch (err:any) {
      if (!err.statusCode) err.statusCode = 500;
      return res.status(err.statusCode).end();
  }

});

configRouter.get('/appVersion',async (req: Request, res: Response, next: NextFunction) => {
  try {
      return res.status(res.statusCode).json(Functions.appVersion());
  }
  catch (err:any) {
      if (!err.statusCode) err.statusCode = 500;
      return res.status(err.statusCode).end();
  }

});



export = configRouter;
