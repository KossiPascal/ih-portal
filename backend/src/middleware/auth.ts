import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { User } from "../entity/User";
import { JsonDatabase } from "../json-data-source";
import { Functions, isNotNull } from "../utils/functions";

export class Middelware {
  static authMiddleware = async (req: Request, res: Response, next: any) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) return res.status(res.statusCode).send('Not authenticated!');
    const token = authHeader.split(' ')[1];
    const userId = req.body.userId;
    jwt.verify(token, Functions.Utils().secretOrPrivateKey, function (err, decoded) {
      return err ? res.status(res.statusCode).send(err) : next();
    });
  };
}
