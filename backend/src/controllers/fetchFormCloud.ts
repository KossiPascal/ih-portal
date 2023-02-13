import { privateEncrypt } from "crypto";
import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import https from 'https';
const fetch = require('node-fetch');

import { getChwsDataSyncRepository, ChwsData, getFamilySyncRepository, Families, Sites, getSiteSyncRepository, getPatientSyncRepository, Patients, getChwsSyncRepository, Chws, getZoneSyncRepository, Zones, Districts, getDistrictSyncRepository } from "../entity/Sync";
import sync from "../routes/sync";
import { CouchDbFetchData, Dhis2DataFormat } from "../utils/appInterface";
import { Dhis2SyncConfig, Functions, isNotNull, CouchDbFetchDataOptions, httpHeaders } from "../utils/functions";

require('dotenv').config({ path: `${Functions.sslFolder('.env')}` });


// function formatDataId(host: any, id: any, port: any): string {
//     const val = `${host}`.replace('.org', '').replace('.', '').replace('-', '').replace('/', '').trim();
//     return `${id}_${val}.${port}`;
// }

async function getSiteByDhis2Uid(uid: string): Promise<string | undefined> {
    var res: string | undefined = undefined;
    try {
        const _repoSite = await getSiteSyncRepository();
        const site: Sites = await _repoSite.findOneByOrFail({ external_id: uid })
        return site.id;
    } catch (error) {

    }
    return res;
}

async function getChwsByDhis2Uid(id: string): Promise<string | undefined> {
    var res: string | undefined = undefined;
    try {
        const _repoChws = await getChwsSyncRepository();
        const asc: Chws = await _repoChws.findOneByOrFail({ external_id: id })
        return asc.id;
    } catch (error) {

    }
    return res;
}

function getValue(dataValues: { dataElement: string, value: any }[], elementId: string): string {
    for (let i = 0; i < dataValues.length; i++) {
        const data = dataValues[i];
        if (data.dataElement == elementId) {
            return data.value;
        }
    }
    return '';
}

function getDataValuesAsMap(dataValues: { dataElement: string, value: any }[], excludeDataElement?: string[]) {
    var finalData: any = {};

    for (let i = 0; i < dataValues.length; i++) {
        const data = dataValues[i];
        if (isNotNull(excludeDataElement)) {
            if (!excludeDataElement!.includes(data.dataElement)) {
                finalData[data.dataElement] = data.value;
            }
        } else {
            finalData[data.dataElement] = data.value;
        }
    }
    return finalData;
}



export async function fetchChwsDataFromDhis2(req: Request, res: Response, next: NextFunction) {

    var outPutInfo: any = {};
    if (!validationResult(req).isEmpty()) {
        // outPutInfo.status = 201;
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["error"] = "Your request provides was rejected !";
        return res.status(201).json(outPutInfo);
    }

    const repository = await getChwsDataSyncRepository();
    const _repoSite = await getSiteSyncRepository();
    // const _repoChws = await getChwsSyncRepository();

    req.body['host'] = process.env.DHIS_HOST;
    // req.body['username'] = process.env.DHIS_USER;
    // req.body['password'] = process.env.DHIS_PASS;
    req.body['cibleName'] = 'events';
    req.body['program'] = 'siupB4uk4O2';

    const dhis2Sync = new Dhis2SyncConfig(req.body);

    var siteName = (await _repoSite.findOneBy({external_id:req.body.orgUnit}))?.name;

    await fetch(dhis2Sync.url, dhis2Sync.fecthOptions())
        .then((response: any) => response.json())
        .then(async (jsonDatas: any) => {
            try {
                var jsonBody: Dhis2DataFormat[] = jsonDatas["events"] as Dhis2DataFormat[];

                if (isNotNull(jsonBody)) {
                    var len = jsonBody.length;
                    var done: number = 0;
                    for (let i = 0; i < len; i++) {
                        done++;
                        const row: Dhis2DataFormat = jsonBody[i];
                        if (isNotNull(row)) {
                            if (row.dataValues.length > 0) {
                                const siteId:any = await getSiteByDhis2Uid(row.orgUnit);
                                var districtId = undefined;
                                try {
                                    districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                } catch (error) {
                                    console.log('No district found !')
                                }
                                const chwsId:any = await getChwsByDhis2Uid(getValue(row.dataValues, 'JkMyqI3e6or'));
                                const dateVal = getValue(row.dataValues, 'RlquY86kI66');
                                if (districtId && isNotNull(siteId) && isNotNull(chwsId) && isNotNull(dateVal)) {
                                    if (!outPutInfo.hasOwnProperty(`Données Total ${siteName}`)) outPutInfo[`Données Total ${siteName}`] = { error: 0, success: 0 }
                                    try {
                                        const _dhis2Sync = new ChwsData();
                                        _dhis2Sync.source = 'dhis2';
                                        _dhis2Sync.id = row.event;
                                        _dhis2Sync.rev = row.event;
                                        _dhis2Sync.form = getValue(row.dataValues, 'plW6bCSnXKU');
                                        _dhis2Sync.reported_date = Functions.milisecond_to_date(dateVal, 'dateOnly');
                                        _dhis2Sync.district = districtId;
                                        _dhis2Sync.site = siteId;
                                        _dhis2Sync.chw = chwsId;
                                        _dhis2Sync.fields = getDataValuesAsMap(row.dataValues, ['JkMyqI3e6or', 'plW6bCSnXKU', 'RlquY86kI66', 'JC752xYegbJ']);
                                        await repository.save(_dhis2Sync);
                                        outPutInfo[`Données Total ${siteName}`]["success"] += 1;
                                    } catch (error: any) {
                                        outPutInfo[`Données Total ${siteName}`]["error"] += 1
                                    }
                                }
                            }
                        }
                    }
                    if (done === len) {
                        // outPutInfo.status = 200;
                        return res.status(200).json(outPutInfo);
                    }
                } else {
                    // outPutInfo.status = 201;
                    return res.status(201).json(outPutInfo);
                }
                process.on('UnhandledPromiseRejectionWarning', (err: any) => {
                    // outPutInfo.status = 201;
                    outPutInfo[`Message ${siteName}`] = {}
                    outPutInfo[`Message ${siteName}`]["error"] = err.message;
                    return res.status(201).json(outPutInfo);
                });
                process.on('uncaughtException', (err: any) => {
                    // outPutInfo.status = 201;
                    outPutInfo[`Message ${siteName}`] = {}
                    outPutInfo[`Message ${siteName}`]["error"] = err.message;
                    return res.status(201).json(outPutInfo);
                });

            } catch (err: any) {
                // outPutInfo.status = 201;
                outPutInfo[`Message ${siteName}`] = {}
                outPutInfo[`Message ${siteName}`]["error"] = err.message;
                return res.status(201).json(outPutInfo);
            }
        }).catch(async(err: any) => {
            // outPutInfo.status = 201;
            outPutInfo[`Message ${siteName}`] = {}
            outPutInfo[`Message ${siteName}`]["error"] = err.message;
            return res.status(201).json(outPutInfo);
        });

    // request(dhis2Sync.headerOptions(), async (err: any, res: any, body: any) => {});

};

export async function fetchChwsDataFromCouchDb(req: Request, resp: Response, next: NextFunction) {

    var outPutInfo: any = {};

    if (!validationResult(req).isEmpty()) {
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["error"] = "Your request provides was rejected !";
        resp.status(500).json(outPutInfo);
        return;
    }

    var params: CouchDbFetchData = {
        viewName: 'reports_by_date',
        startKey: [Functions.date_to_milisecond(req.body.start_date, true)],
        endKey: [Functions.date_to_milisecond(req.body.end_date, false)],

        medic_host: process.env.CHT_HOST ?? '',
        port: parseInt(process.env.CHT_PORT ?? '443'),
        medic_username: process.env.CHT_USER ?? '',
        medic_password: process.env.CHT_PASS ?? '',
        ssl_verification: true,
    };

    try {

        https.get(CouchDbFetchDataOptions(params), async function (res) {
            var body = "";
            res.on('data', (data) => {
                body += data.toString();
            });
            res.on('end', async () => {
                try {
                    const repository = await getChwsDataSyncRepository();
                    const _repoSite = await getSiteSyncRepository();
                    var jsonBody: any = JSON.parse(body).rows;
                    if (jsonBody !== undefined && jsonBody !== '' && jsonBody !== null) {
                        var len = jsonBody.length;
                        var done: number = 0;

                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.hasOwnProperty('form') && row.doc.hasOwnProperty('fields')) {
                                if (row.doc.fields.hasOwnProperty('patient_id')) {
                                    const siteId = row.doc.contact.parent.parent._id;
                                    var districtId = undefined;
                                    try {
                                        districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                    } catch (error) {
                                        console.log('No district found !')
                                    }
                                    if (districtId && siteId) {
                                        if (!outPutInfo.hasOwnProperty("Données Total")) outPutInfo["Données Total"] = { error: 0, success: 0 }
                                        try {
                                            const _sync = new ChwsData();
                                            _sync.source = 'Tonoudayo';
                                            _sync.id = row.doc._id;
                                            _sync.rev = row.doc._rev;
                                            _sync.form = row.doc.form;
                                            _sync.phone = row.doc.from;
                                            _sync.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _sync.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _sync.district = districtId;
                                            _sync.site = siteId;
                                            _sync.zone = row.doc.contact.parent._id;
                                            _sync.chw = row.doc.contact._id;

                                            _sync.family_id = row.doc.fields.inputs.contact.parent
                                            _sync.patient_id = row.doc.fields.inputs.contact._id
                                            _sync.fields = Functions.getJsonFieldsAsKeyValue('', row.doc.fields);
                                            // _sync.patient_id = row.doc.fields.patient_id;
                                            if (!row.doc.geolocation.hasOwnProperty('code')) _sync.geolocation = Functions.getJsonFieldsAsKeyValue('', row.doc.geolocation);
                                            await repository.save(_sync);
                                            outPutInfo["Données Total"]["success"] += 1;
                                        } catch (err: any) {
                                            console.log()
                                            outPutInfo["Données Total"]["error"] += 1
                                            outPutInfo["ErrorMsg"] = {}
                                            outPutInfo["ErrorMsg"]["error"] = err.toString()
                                        }
                                    }
                                }
                            }
                        }

                        if (done === len) return resp.status(200).json(outPutInfo);
                    } else {
                        return resp.status(200).json(outPutInfo);
                    }
                    // if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = undefined;
                } catch (err: any) {
                    // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = undefined;
                    if (!err.statusCode) err.statusCode = 500;
                    outPutInfo["Message"] = {}
                    outPutInfo["Message"]["error"] = err.message;
                    resp.status(err.statusCode).json(outPutInfo);
                }
            });
            process.on('uncaughtException', (err: any) => {
                if (!err.statusCode) err.statusCode = 500;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["error"] = err.message;
                resp.status(err.statusCode).json(outPutInfo);
            });
            res.on('error', (err: any) => {
                if (!err.statusCode) err.statusCode = 500;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["error"] = err.message;
                resp.status(err.statusCode).json(outPutInfo);
            });
        });
    } catch (err: any) {
        if (!err.statusCode) err.statusCode = 500;
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["error"] = err.message;
        resp.status(err.statusCode).json(outPutInfo);
    }
};

export async function fetchOrgUnitsFromCouchDb(req: Request, resp: Response, next: NextFunction) {

    var outPutInfo: any = {};
    if (!validationResult(req).isEmpty()) {
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["error"] = "Your request provides was rejected !";
        return resp.status(500).json(outPutInfo);
    }

    var params: CouchDbFetchData = {
        viewName: 'contacts_by_type',
        startKey: [Functions.date_to_milisecond(req.body.start_date, true)],
        endKey: [Functions.date_to_milisecond(req.body.end_date, false)],
        medic_host: process.env.CHT_HOST ?? '',
        port: parseInt(process.env.CHT_PORT ?? ''),
        medic_username: process.env.CHT_USER ?? '',
        medic_password: process.env.CHT_PASS ?? '',
        ssl_verification: true,
    };

    try {

        https.get(CouchDbFetchDataOptions(params), async function (res) {
            var body = "";
            res.on('data', (data) => {
                body += data.toString();
            });
            res.on('end', async () => {
                try {
                    const _repoDistrict = await getDistrictSyncRepository();
                    const _repoSite = await getSiteSyncRepository();
                    const _repoZone = await getZoneSyncRepository();
                    const _repoFamily = await getFamilySyncRepository();
                    const _repoPatient = await getPatientSyncRepository();
                    const _repoChws = await getChwsSyncRepository();

                    var jsonBody: any = JSON.parse(body).rows;
                    var len = jsonBody.length;
                    var done: number = 0;
                    var districtList: string[] = [];
                    var outDoneLenght: number = 0;
                    const dataSource: string = 'Tonoudayo';

                    var authorized = {
                        site: req.body.site == true,
                        zone: req.body.zone == true,
                        family: req.body.family == true,
                        patient: req.body.patient == true,
                        chw: req.body.chw == true
                    };

                    if (authorized.site) {
                        outDoneLenght++;
                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'district_hospital') {
                                const siteId = row.doc._id;
                                if (siteId) {
                                    if (!outPutInfo.hasOwnProperty("Sites")) outPutInfo["Sites"] = { error: 0, success: 0 };
                                    try {
                                        const _syncSite = new Sites();
                                        if (row.doc.hasOwnProperty("district_external_id")) { 
                                            const districtId = row.doc.district_external_id;
                                            const districtName = row.doc.district_external_name;
                                            try {
                                                if (isNotNull(districtId) && isNotNull(districtName)) {
                                                    if (!outPutInfo.hasOwnProperty("Districts")) outPutInfo["Districts"] = { error: 0, success: 0 };
                                                    const _syncDistrict = new Districts();
                                                    _syncDistrict.id = districtId
                                                    _syncDistrict.name = districtName;
                                                    _syncDistrict.source = dataSource;
                                                    await _repoDistrict.save(_syncDistrict);
                                                    if (!districtList.includes(districtId)) {
                                                        districtList.push(districtId);
                                                        outPutInfo["Districts"]["success"] += 1;
                                                    }
                                                    _syncSite.district = districtId;

                                                }
                                            } catch (error) {
                                                if (!districtList.includes(districtId)) {
                                                    districtList.push(districtId);
                                                    outPutInfo["Districts"]["error"] += 1;
                                                }
                                            }
                                        }
                                        _syncSite.source = dataSource;
                                        _syncSite.id = siteId;
                                        _syncSite.rev = row.doc._rev;
                                        _syncSite.name = row.doc.name;
                                        _syncSite.external_id = row.doc.external_id;
                                        _syncSite.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                        _syncSite.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                        await _repoSite.save(_syncSite);
                                        outPutInfo["Sites"]["success"] += 1;
                                    } catch (error: any) {
                                        outPutInfo["Sites"]["error"] += 1
                                    }
                                }
                            }
                        }

                    }

                    if (authorized.zone) {
                        outDoneLenght++;
                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'health_center' && row.doc.hasOwnProperty('parent')) {
                                const siteId = row.doc.parent._id;
                                var districtId = undefined;
                                try {
                                    districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                } catch (error) {
                                    console.log('No district found !')
                                }
                                if (siteId && districtId) {
                                    if (!outPutInfo.hasOwnProperty("Zones")) outPutInfo["Zones"] = { error: 0, success: 0 };
                                    try {
                                        const _syncZone = new Zones();
                                        _syncZone.source = dataSource;
                                        _syncZone.id = row.doc._id;
                                        _syncZone.rev = row.doc._rev;
                                        _syncZone.name = row.doc.name;
                                        _syncZone.external_id = row.doc.external_id;
                                        _syncZone.district = districtId;
                                        _syncZone.site = siteId;
                                        _syncZone.chw_id = row.doc.contact._id;
                                        _syncZone.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                        _syncZone.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                        await _repoZone.save(_syncZone);
                                        outPutInfo["Zones"]["success"] += 1;
                                    } catch (error: any) {
                                        outPutInfo["Zones"]["error"] += 1
                                    }
                                }
                            }
                        }

                    }

                    if (authorized.family) {
                        outDoneLenght++;
                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'clinic' && row.doc.hasOwnProperty('parent')) {
                                if (row.doc.parent.hasOwnProperty('parent')) {
                                    const siteId = row.doc.parent.parent._id;
                                    var districtId = undefined;
                                    try {
                                        districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                    } catch (error) {
                                        console.log('No district found !')
                                    }
                                    if (siteId && districtId) {
                                        if (!outPutInfo.hasOwnProperty("Familles")) outPutInfo["Familles"] = { error: 0, success: 0 }
                                        try {
                                            const _syncFamily = new Families();
                                            _syncFamily.source = dataSource;
                                            _syncFamily.id = row.doc._id;
                                            _syncFamily.rev = row.doc._rev;
                                            _syncFamily.name = row.doc.name;
                                            _syncFamily.external_id = row.doc.external_id;
                                            _syncFamily.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _syncFamily.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _syncFamily.district = districtId;
                                            _syncFamily.site = siteId;
                                            _syncFamily.zone = row.doc.parent._id;
                                            await _repoFamily.save(_syncFamily);
                                            outPutInfo["Familles"]["success"] += 1;
                                        } catch (error: any) {
                                            outPutInfo["Familles"]["error"] += 1
                                        }
                                    }
                                }
                            }
                        }

                    }

                    if (authorized.patient) {
                        outDoneLenght++;
                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'person' && row.doc.role === 'patient' && row.doc.hasOwnProperty('parent')) {
                                if (row.doc.parent.hasOwnProperty('parent')) {
                                    if (row.doc.parent.parent.hasOwnProperty('parent')) {
                                        const siteId = row.doc.parent.parent.parent._id;
                                        var districtId = undefined;
                                        try {
                                            districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                        } catch (error) {
                                            console.log('No district found !')
                                        }
                                        if (districtId && siteId) {
                                            if (!outPutInfo.hasOwnProperty("Patients")) outPutInfo["Patients"] = { error: 0, success: 0, }
                                            try {
                                                const _syncPatient = new Patients();
                                                _syncPatient.source = dataSource;
                                                _syncPatient.id = row.doc._id;
                                                _syncPatient.rev = row.doc._rev;
                                                _syncPatient.name = row.doc.name;
                                                _syncPatient.external_id = row.doc.external_id;
                                                _syncPatient.role = row.doc.role;
                                                _syncPatient.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                                _syncPatient.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                                _syncPatient.district = districtId;
                                                _syncPatient.site = siteId;
                                                _syncPatient.zone = row.doc.parent.parent._id;
                                                _syncPatient.family = row.doc.parent._id;
                                                await _repoPatient.save(_syncPatient);
                                                outPutInfo["Patients"]["success"] += 1;
                                            } catch (error: any) {
                                                outPutInfo["Patients"]["error"] += 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }

                    if (authorized.chw) {
                        outDoneLenght++;
                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'person' && row.doc.role === 'chw' && row.doc.hasOwnProperty('parent')) {
                                if (row.doc.parent.hasOwnProperty('parent')) {
                                    const siteId = row.doc.parent.parent._id;
                                    var districtId = undefined;
                                    try {
                                        districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                    } catch (error) {
                                        console.log('No district found !')
                                    }
                                    if (districtId && siteId) {
                                        if (!outPutInfo.hasOwnProperty("Asc")) outPutInfo["Asc"] = { error: 0, success: 0 };
                                        try {
                                            const _syncChws = new Chws();
                                            _syncChws.source = dataSource;
                                            _syncChws.id = row.doc._id;
                                            _syncChws.rev = row.doc._rev;
                                            _syncChws.name = row.doc.name;
                                            _syncChws.external_id = row.doc.external_id;
                                            _syncChws.role = row.doc.role;
                                            _syncChws.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _syncChws.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _syncChws.district = districtId ;
                                            _syncChws.site = siteId;
                                            _syncChws.zone = row.doc.parent._id;
                                            await _repoChws.save(_syncChws);
                                            outPutInfo["Asc"]["success"] += 1;
                                        } catch (error: any) {
                                            outPutInfo["Asc"]["error"] += 1;
                                        }
                                    }
                                }
                            }
                        }

                    }

                    // if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = undefined;
                    if (done === len * outDoneLenght) resp.status(200).json(outPutInfo);
                    // resp.status(200).json(outPutInfo);
                } catch (err: any) {
                    // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = undefined;
                    if (!err.statusCode) err.statusCode = 500;
                    outPutInfo["Message"] = {};
                    outPutInfo["Message"]["error"] = err.message;
                    resp.status(err.statusCode).json(outPutInfo);
                }
            });
            process.on('uncaughtException', (err: any) => {
                if (!err.statusCode) err.statusCode = 500;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["error"] = err.message;
                resp.status(err.statusCode).json(outPutInfo);
            });
            res.on('error', (err: any) => {
                if (!err.statusCode) err.statusCode = 500;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["error"] = err.message;
                resp.status(err.statusCode).json(outPutInfo);
            });
        }).on('error', (err: any) => {
            if (!err.statusCode) err.statusCode = 500;
            outPutInfo["Message"] = {}
            outPutInfo["Message"]["error"] = err.message;
            resp.status(err.statusCode).json(outPutInfo);
        });

    } catch (err: any) {
        if (!err.statusCode) err.statusCode = 500;
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["error"] = err.message;
        resp.status(err.statusCode).json(outPutInfo);
    }
};





