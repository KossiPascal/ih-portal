import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { Config } from "../utils/config";

export class Middelware {
  static authMiddleware = async (req: Request, res: Response, next:any) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) return res.status(401).send('Not authenticated!');
    const token = authHeader.split(' ')[1];

    jwt.verify(token, Config().secretOrPrivateKey, function (err, decoded) {
      if (err) return res.status(401).send(err);
      if (!err)  next();
    });
  };
}
