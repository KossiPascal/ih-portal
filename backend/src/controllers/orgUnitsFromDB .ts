import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
// import https = require('https');
import { Between, Equal, In } from "typeorm";
// const request = require('request');

import { getFamilySyncRepository, Families, Sites, getSiteSyncRepository, getPatientSyncRepository, Patients, getChwsSyncRepository, Chws, getZoneSyncRepository, Zones, getDistrictSyncRepository, Districts } from "../entity/Sync";
import { isNotNull, sslFolder } from "../utils/functions";

require('dotenv').config({ path: sslFolder('.env') });


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
        var districts: Districts[] = [];
        districts = await repository.find({
            where: {
                id: isNotNull(req.body.id) ? req.body.id : undefined,
                source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
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
        var sites: Sites[] = [];
        sites = await repository.find({
            where: {
                id: isNotNull(req.body.id) ? req.body.id : undefined,
                // reported_date: isNotNull(req.body.start_date) && isNotNull(req.body.end_date) ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                district: isNotNull(req.body.districts) ? { id: In(req.body.districts) } : undefined
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
        var zones: Zones[] = [];
        zones = await repository.find({
            where: {
                id: isNotNull(req.body.id) ? req.body.id : undefined,
                // reported_date: isNotNull(req.body.start_date) && isNotNull(req.body.end_date) ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                district: isNotNull(req.body.districts) ? { id: In(req.body.districts) } : undefined,
                site: isNotNull(req.body.sites) ? { id: In(req.body.sites) } : undefined,
                chw_id: isNotNull(req.body.chws) ? In(req.body.chws) : undefined,
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
        const user: string[] = req.body.user;
        var chws: Chws[] = [];
        var chws = await _chwRepo.find({
            where: {
                id: isNotNull(req.body.id) ? req.body.id : undefined,
                // reported_date: req.body.start_date && req.body.end_date ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                district: isNotNull(req.body.districts) ? { id: In(req.body.districts) } : undefined,
                site: isNotNull(req.body.sites) ? { id: In(req.body.sites) } : undefined,
                zone: {
                    id: isNotNull(req.body.zones) ? In(req.body.zones) : undefined,
                    chw_id: isNotNull(req.body.chws) ? In(req.body.chws) : undefined,
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
        var families: Families[] = [];
        families = await repository.find({
            where: {
                id: isNotNull(req.body.id) ? req.body.id : undefined,
                // reported_date: req.body.start_date && req.body.end_date ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                district: isNotNull(req.body.districts) ? { id: In(req.body.districts) } : undefined,
                site: isNotNull(req.body.sites) ? { id: In(req.body.sites) } : undefined,
                zone: {
                    id: isNotNull(req.body.zones) ? In(req.body.zones) : undefined,
                    chw_id: isNotNull(req.body.chws) ? In(req.body.chws) : undefined,
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
        var patients: Patients[] = [];
        patients = await repository.find({
            where: {
                id: isNotNull(req.body.id) ? req.body.id : undefined,
                // reported_date: req.body.start_date && req.body.end_date ? Between(req.body.start_date, req.body.end_date) : undefined,
                source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                district: isNotNull(req.body.districts) ? { id: In(req.body.districts) } : undefined,
                site: isNotNull(req.body.sites) ? { id: In(req.body.sites) } : undefined,
                family: isNotNull(req.body.families) ? { id: In(req.body.families) } : undefined,
                zone: {
                    id: isNotNull(req.body.zones) ? In(req.body.zones) : undefined,
                    chw_id: isNotNull(req.body.chws) ? In(req.body.chws) : undefined,
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

