import { NextFunction, Request, Response, Router } from 'express';
import { User, getUserRepository } from '../entity/User';
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
      const { userId, dhisusersession } = req.body;

      if (!dhisusersession) {
          return res.status(400).json({ status: 400, data: 'Credential error' });
      }

      try {
          const isUserAuthorized = await userLoginStatus(dhisusersession);

          if (isUserAuthorized) {
              try {
                  const user = await getMe(dhisusersession);

                  if (!user.isActive) {
                      return res.status(201).json({ status: 201, data: "You don't have permission to login!" });
                  }

                  const _repoUser = await getUserRepository();
                  const userFound = await _repoUser.findOneBy({ id: user.id });
                  const userData = await generateUserMapData(userFound ? userFound : user, dhisusersession);
                  const finalUser = await _repoUser.save(userData);

                  return res.status(200).json({ status: 200, data: finalUser });
              } catch (err) {
                  return res.status(201).json({ status: 201, data: 'No user found with these credentials, retry!' });
              }
          } else {
              return res.status(201).json({ status: 201, data: 'Problem found when trying to connect' });
          }
      } catch (err) {
          return res.status(201).json({ status: 201, data: 'Error when getting user information, retry!' });
      }
  } catch (err) {
      return res.status(201).json({ status: 201, data: `${err}` });
  }
});



export = configRouter;
