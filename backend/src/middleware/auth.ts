import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { Functions } from "../utils/functions";

export class Middelware {
  static authMiddleware = async (req: Request, res: Response, next:any) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) return res.status(res.statusCode).send('Not authenticated!');
    const token = authHeader.split(' ')[1];
    jwt.verify(token, Functions.Utils().secretOrPrivateKey, function (err, decoded) {
      if (err) return res.status(res.statusCode).send(err);
      if (!err)  next();
    });
  };
}
