import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
// import https = require('https');
import { Between, Equal, In } from "typeorm";
// const request = require('request');

import { getFamilySyncRepository, Families, Sites, getSiteSyncRepository, getPatientSyncRepository, Patients, getChwsSyncRepository, Chws, getZoneSyncRepository, Zones, getDistrictSyncRepository, Districts } from "../entity/Sync";
import { notEmpty } from "../utils/functions";

// OperatorSymbolToFunction = new Map<FilterOperator, (...args: any[]) => FindOperator<string>>([
//     [FilterOperator.EQ, Equal],
//     [FilterOperator.GT, MoreThan],
//     [FilterOperator.GTE, MoreThanOrEqual],
//     [FilterOperator.IN, In],
//     [FilterOperator.NULL, IsNull],
//     [FilterOperator.LT, LessThan],
//     [FilterOperator.LTE, LessThanOrEqual],
//     [FilterOperator.BTW, Between],
//     [FilterOperator.NOT, Not],
// ])



export async function getDistricts(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(201).json({ status: 201, data: 'Informations you provided are not valid' });
    try {
        const repository = await getDistrictSyncRepository();
        var districts: Districts[] = await repository.find({
            where: {
                id: notEmpty(req.body.id) ? req.body.id : (notEmpty(req.body.districts) ? In(req.body.districts) : undefined),
                source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
            }
        });
        if (!districts) return res.status(201).json({ status: 201, data: 'No Data Found !' });
        return res.status(200).json({ status: 200, data: districts });
    }
    catch (err) {
        // return next(err);
        return res.status(201).json({ status: 201, data: err });
    }
};

export async function getSites(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(201).json({ status: 201, data: 'Informations you provided are not valid' });
    try {
        const repository = await getSiteSyncRepository();
        var sites: Sites[] = await repository.find({
            where: {
                id: notEmpty(req.body.id) ? req.body.id : (notEmpty(req.body.sites) ? In(req.body.sites) : undefined),
                // reported_date: notEmpty(req.body.start_date) && notEmpty(req.body.end_date) ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
                district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined
            }
        });
        if (!sites) return res.status(201).json({ status: 201, data: 'No Data Found !' });
        return res.status(200).json({ status: 200, data: sites });
    } catch (err) {
        // return next(err);
        return res.status(201).json({ status: 201, data: err });
    }
};

export async function getZones(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(201).json({ status: 201, data: 'Informations you provided are not valid' });
    try {
        const repository = await getZoneSyncRepository();
        var zones: Zones[] = await repository.find({
            where: {
                id: notEmpty(req.body.id) ? req.body.id : (notEmpty(req.body.zones) ? In(req.body.zones) : undefined),
                // reported_date: notEmpty(req.body.start_date) && notEmpty(req.body.end_date) ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
                district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
                site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
                chw_id: notEmpty(req.body.chws) ? In(req.body.chws) : undefined,
            }
        });
        if (!zones) return res.status(201).json({ status: 201, data: 'No Data Found !' });
        return res.status(200).json({ status: 200, data: zones });
    }
    catch (err) {
        // return next(err);
        return res.status(200).json({ status: 500, data: err });
    }
};

export async function getChws(req: Request, res: Response, next: NextFunction, onlyData:boolean = false):Promise<any> {
    var respData:{ status: number, data: any };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        respData = { status: 201, data: 'Informations you provided are not valid' }
        return onlyData ? respData : res.status(201).json(respData);
    }
    
    try {
        const _chwRepo = await getChwsSyncRepository();
        const userId: string = req.body.userId;
        var chws: Chws[] = await _chwRepo.find({
            where: {
                id: notEmpty(req.body.id) ? req.body.id : (notEmpty(req.body.chws) ? In(req.body.chws) : undefined),
                // reported_date: req.body.start_date && req.body.end_date ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
                district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
                site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
                zone: {
                    id: notEmpty(req.body.zones) ? In(req.body.zones) : undefined,
                    // chw_id: notEmpty(req.body.chws) ? In(req.body.chws) : undefined,
                },
            },
        });
        respData = !chws ? { status: 201, data: 'No Data Found !' } : { status: 200, data: chws }
    } catch (err) {
        // return next(err);
        respData = { status: 201, data: err };
    }
    return onlyData ? respData : res.status(respData.status).json(respData);
};

export async function getFamilies(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(201).json({ status: 201, data: 'Informations you provided are not valid' });
    try {
        const repository = await getFamilySyncRepository();
        var families: Families[] = await repository.find({
            where: {
                id: notEmpty(req.body.id) ? req.body.id : (notEmpty(req.body.families) ? In(req.body.families) : undefined),
                reported_date: req.body.start_date && req.body.end_date ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
                district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
                site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
                zone: {
                    id: notEmpty(req.body.zones) ? In(req.body.zones) : undefined,
                    chw_id: notEmpty(req.body.chws) ? In(req.body.chws) : undefined,
                }, 
            }
        });
        if (!families) return res.status(201).json({ status: 201, data: 'No Data Found !' });
        return res.status(200).json({ status: 200, data: families });
    }
    catch (err) {
        // return next(err);
        return res.status(201).json({ status: 201, data: err });
    }
};

export async function getPatients(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(201).json({ status: 201, data: 'Informations you provided are not valid' });
    try {
        const repository = await getPatientSyncRepository();
        var patients: Patients[] = await repository.find({
            where: {
                id: notEmpty(req.body.id) ? req.body.id : (notEmpty(req.body.patients) ? In(req.body.patients) : undefined),
                // reported_date: req.body.start_date && req.body.end_date ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
                district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
                site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
                family: notEmpty(req.body.families) ? { id: In(req.body.families) } : undefined,
                zone: {
                    id: notEmpty(req.body.zones) ? In(req.body.zones) : undefined,
                    chw_id: notEmpty(req.body.chws) ? In(req.body.chws) : undefined,
                },
            }
        });
        if (!patients) return res.status(201).json({ status: 201, data: 'No Data Found !' });
        return res.status(200).json({ status: 200, data: patients });
    }
    catch (err) {
        // return next(err);
        return res.status(201).json({ status: 201, data: err });
    }
};

export async function deleteOrgUnits(req: Request, res: Response, next: NextFunction) { }

