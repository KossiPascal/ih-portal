import { NextFunction, Request, Response } from "express";

export class Errors {
  static get404 = (req: Request, res: Response, next: NextFunction) => {
    return res.status(404).send('Not found.');
  };

  static get500 = (error: any, req: Request, res: Response, next: NextFunction) => {
    const data = error.data;
    return res.status(error.statusCode || 500).json({
      error: {
        message: error.message,
        data: data,
      },
    });
  };
}



