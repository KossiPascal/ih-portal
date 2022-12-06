import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { Utils } from "../utils/utils";

export class Middelware {
  static authMiddleware = async (req: Request, res: Response, next:any) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) return res.status(401).send('Not authenticated!');
    const token = authHeader.split(' ')[1];

    jwt.verify(token, Utils().secretOrPrivateKey, function (err, decoded) {
      if (err) return res.status(401).send(err);
      if (!err)  next();
    });
  };
}
