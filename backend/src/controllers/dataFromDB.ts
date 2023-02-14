import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import { Between, In } from "typeorm";
import { getChwsDataSyncRepository, ChwsData } from "../entity/Sync";
import { Functions, isNotNull } from "../utils/functions";

require('dotenv').config({ path: `${Functions.sslFolder('.env')}` });


export async function getChwsDataWithParams(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(201).json({ status: 201, data: 'Informations you provided are not valid' });

    const errorMsg: string = "Your request provides was rejected !";

    try {
        const repository = await getChwsDataSyncRepository();

        var allSync: ChwsData[] = await repository.find({
            where: {
                id: isNotNull(req.body.id) ? req.body.id : isNotNull(req.params.id) ? req.params.id : undefined,
                reported_date: isNotNull(req.body.start_date) && isNotNull(req.body.end_date) ? Between(req.body.start_date, req.body.end_date) : undefined,
                form: isNotNull(req.body.forms) ? In(req.body.forms) : undefined,
                source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                district: isNotNull(req.body.districts) ? { id: In(req.body.districts) } : undefined,
                site: isNotNull(req.body.sites) ? { id: In(req.body.sites) } : undefined,
                zone: isNotNull(req.body.zones) ? { id: In(req.body.zones) } : undefined,
                chw: isNotNull(req.body.chws) ? { id: In(req.body.chws) } : undefined
            }
        });
        if (!allSync) return res.status(201).json({ status: 201, data: 'Not data found with parametter!' });
        return res.status(200).json({ status: 200, data: allSync });
    }
    catch (err) {
        // return next(err);
        return res.status(201).json({ status: 201, data: errorMsg });
    }
};



export async function deleteChwsData(req: Request, res: Response, next: NextFunction) { }

