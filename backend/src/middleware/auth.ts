import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { generateSecret, getUsersRepository } from "../entity/User";
import { GetRolesAndNamesPagesActionsList } from "../entity/Roles";
import { notEmpty, sslFolder } from "../utils/functions";

export class Middelware {
  static authMiddleware = async (req: Request, res: Response, next: any) => {
    const { userId, privileges, appLoadToken, accessRoles, accessPages, accessActions } = req.body;
    if (privileges == true) return next();
    const authHeader = req.get('Authorization');
    if (!authHeader) return res.status(res.statusCode).send('Not authenticated!');
    const token = authHeader.split(' ')[1];
    if (userId && appLoadToken == 'Kossi TSOLEGNAGBO') {
      const userRepo = await getUsersRepository();
      const user = await userRepo.findOneBy({ id: userId });
      if (user) {
        const formatedRoles = (await GetRolesAndNamesPagesActionsList(user.roles));
        const isSameRoles = accessRoles && notEmpty(accessRoles) ? (accessRoles as string[]).every(r => (user.roles as string[]).includes(r)) : false;
        const isSamePages = accessPages && notEmpty(accessPages) && formatedRoles?.pages ? (accessPages as string[]).every(r => (formatedRoles.pages as string[]).includes(r)) : false;
        const isSameActions = accessActions && notEmpty(accessActions) && formatedRoles?.actions ? (accessActions as string[]).every(r => (formatedRoles.actions as string[]).includes(r)) : false;
        // const isChws = formatedRoles && notEmpty(formatedRoles) ? formatedRoles.rolesNames[0] == 'chws' : false;
        if (isSameRoles && isSamePages && isSameActions) {
          jwt.verify(token, generateSecret(false).secretOrPrivateKey, function (err, decoded) {
            if (err) {
              return res.status(res.statusCode).send(err);
            } else {
              require('dotenv').config({ path: sslFolder('.ih-env') });
              const { DHIS_HOST, DHIS_USER, DHIS_PASS } = process.env;
              
              req.body.dhisusername = req.body.dhisusername ?? DHIS_USER;
              req.body.dhispassword = req.body.dhispassword ?? DHIS_PASS
              return next();
            }
            
          });
        } else {
          return res.status(500).send('You do not have access');
        }
      } else {
        return res.status(500).send('You do not have access');
      }
    } else {
      return res.status(600).send('You do not have access');
    }
  };
}
