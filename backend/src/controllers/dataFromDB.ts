import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
// import https = require('https');
import { Between, In } from "typeorm";
// const request = require('request');

import { getChwsDataSyncRepository, ChwsData, getFamilySyncRepository, Families, Sites, getSiteSyncRepository, getPatientSyncRepository, Patients, getChwsSyncRepository, Chws, getZoneSyncRepository, Zones, getDistrictSyncRepository, Districts } from "../entity/Sync";
import { Dhis2SyncConfig, Functions, isNotNull } from "../utils/functions";

require('dotenv').config({ path: `${Functions.sslFolder('.env')}` });

export class DataFromDbController {

    static getAllData = async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(500).json('Informations you provided are not valid');
        try {
            const repository = await getChwsDataSyncRepository();
            const allSync = await repository.find();
            if (!allSync) return res.status(401).json('No Data Found !');
            res.status(200).json(allSync);
        }
        catch (err) {
            return next(err);
        }
    };

    static getAllDataWithParams = async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(500).json('Informations you provided are not valid');
        try {
            const repository = await getChwsDataSyncRepository();
             var allSync: ChwsData[] = await repository.find({
                    where: {
                        reported_date: isNotNull(req.body.start_date) || isNotNull(req.body.end_date) ? Between(req.body.start_date, req.body.end_date) : undefined,
                        source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                        form: isNotNull(req.body.forms) ? In(req.body.forms) : undefined,
                        site: isNotNull(req.body.sites) ? In(req.body.sites) : undefined,
                        chw: isNotNull(req.body.chws) ? In(req.body.chws)  : undefined,
                    }
                });
            if (!allSync) return res.status(401).json('No Data Found !');
            return res.status(200).json(allSync);
        }
        catch (err) {
            return next(err);
        }
    };

    static getDataByParams = async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(500).json('Informations you provided are not valid');
        try {
            const repository = await getChwsDataSyncRepository();
            const sync = await repository.findOneByOrFail({ 'id': req.params.id });
            if (!sync) return res.status(401).json('No Data Found !');
            return res.status(200).json(sync);
        } catch (err: any) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    };
    
    static getDistricts = async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(500).json('Informations you provided are not valid');
        try {
            const repository = await getDistrictSyncRepository();
            var districts: Districts[] = [];
            if (req.body.sources != '' && req.body.sources != null && req.body.sources != undefined) {
                districts = await repository.find({
                    where: {
                        source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                    }
                });
            } else {
                districts = await repository.find();
            }

            if (!districts) return res.status(401).json('No Data Found !');
            return res.status(200).json(districts);
        }
        catch (err) {
            return next(err);
        }
    };

    static getSites = async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(500).json('Informations you provided are not valid');
        try {
            const repository = await getSiteSyncRepository();
            var sites: Sites[] = [];
            if (req.body.sources != '' && req.body.sources != null && req.body.sources != undefined) {
                sites = await repository.find({
                    where: {
                        source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                        district: isNotNull(req.body.districts) ? In(req.body.districts) : undefined,
                    }
                });
            } else {
                sites = await repository.find();
            }

            if (!sites) return res.status(401).json('No Data Found !');
            return res.status(200).json(sites);
        }
        catch (err) {
            return next(err);
        }
    };

    static getZones = async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(500).json('Informations you provided are not valid');
        try {
            const repository = await getZoneSyncRepository();
            var zones: Zones[] = [];
            if (req.body.sources != '' && req.body.sources != null && req.body.sources != undefined) {
                zones = await repository.find({
                    where: {
                        source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                        site: isNotNull(req.body.sites) ? In(req.body.sites) : undefined,
                    }
                });
            } else {
                zones = await repository.find();
            }
            if (!zones) return res.status(401).json('No Data Found !');
            return res.status(200).json(zones);
        }
        catch (err) {
            return next(err);
        }
    };

    static getChws = async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(500).json('Informations you provided are not valid');
        try {
            const repository = await getChwsSyncRepository();
            var chws: Chws[] = [];
            if (req.body.sources != '' && req.body.sources != null && req.body.sources != undefined) {
                chws = await repository.find({
                    where: {
                        source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                        site: isNotNull(req.body.sites) ? In(req.body.sites) : undefined,
                    }
                });
            } else {
                chws = await repository.find();
            }
            if (!chws) return res.status(401).json('No Data Found !');
            return res.status(200).json(chws);
        }
        catch (err) {
            return next(err);
        }
    };

    static getFamilies = async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(500).json('Informations you provided are not valid');
        try {

            const repository = await getFamilySyncRepository();
            var families: Families[] = [];
            if (req.body.sources != '' && req.body.sources != null && req.body.sources != undefined) {
                families = await repository.find({
                    where: {
                        source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                        site: isNotNull(req.body.sites) ? In(req.body.sites) : undefined,
                    }
                });
            } else {
                families = await repository.find();
            }
            if (!families) return res.status(401).json('No Data Found !');
            return res.status(200).json(families);
        }
        catch (err) {
            return next(err);
        }
    };

    static getPatients = async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(500).json('Informations you provided are not valid');
        try {
            const repository = await getPatientSyncRepository();
            var patients: Patients[] = [];
            if (req.body.sources != '' && req.body.sources != null && req.body.sources != undefined) {
                patients = await repository.find({
                    where: {
                        source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
                        site: isNotNull(req.body.sites) ? In(req.body.sites) : undefined,
                        family: isNotNull(req.body.families) ? In(req.body.families) : undefined,
                    }
                });
            } else {
                patients = await repository.find();
            }

            if (!patients) return res.status(401).json('No Data Found !');
            return res.status(200).json(patients);
        }
        catch (err) {
            return next(err);
        }
    };

    static deleteSyncData = async (req: Request, res: Response, next: NextFunction) => { }

    static deleteAllSyncData = async (req: Request, res: Response, next: NextFunction) => { }

}

