import { getChwsDataSyncRepository, ChwsData, getFamilySyncRepository, Families, Sites, getSiteSyncRepository, getPatientSyncRepository, Patients, getChwsSyncRepository, Chws, getZoneSyncRepository, Zones, Districts, getDistrictSyncRepository } from "../entity/Sync";
import { CouchDbFetchData, Dhis2DataFormat } from "../utils/appInterface";
import { Dhis2SyncConfig, Functions, isNotNull, CouchDbFetchDataOptions, getChwsByDhis2Uid, getDataValuesAsMap, getSiteByDhis2Uid, getValue, sslFolder, httpHeaders } from "../utils/functions";
import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import https from 'https';
import { DataIndicators } from "../entity/DataAggragate";

const fetch = require('node-fetch');
const request = require('request');

require('dotenv').config({ path: sslFolder('.env') });



export async function getDhis2Chws(req: Request, res: Response, next: NextFunction) {
    if (!validationResult(req).isEmpty()) {
        return res.status(201).json({ status: 201, data: 'Error when getting chws from dhis2' });
    }
    try {
        const link = `https://${process.env.DHIS_HOST}/api/options`;
        const params = `.json?paging=false&filter=optionSet.id:eq:uOKgQa2W8tn&fields=id,code,name,optionSet&order=created:desc`;
        request({
            url: link + params,
            method: 'GET',
            headers: httpHeaders('Basic ' + req.body.dhisusersession)
        }, async function (err: any, response: any, body: any) {
            if (err) return res.status(201).json({ status: 201, data: 'Error when getting chws from dhis2' });
            const jsonBody = JSON.parse(body);
            if (jsonBody.hasOwnProperty('options')) return res.status(200).json({ status: 200, data: jsonBody["options"] });
            return res.status(201).json({ status: 201, data: 'Error when getting chws from dhis2' });
        });
    } catch (err: any) {
        return res.status(201).json({ status: 201, data: err.toString() });
    }

}

export async function fetchChwsDataFromDhis2(req: Request, res: Response, next: NextFunction) {

    var outPutInfo: any = {};
    if (!validationResult(req).isEmpty()) {
        // outPutInfo.status = 201;
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["errorElements"] = "Your request provides was rejected !";
        return res.status(201).json(outPutInfo);
    }

    const repository = await getChwsDataSyncRepository();
    const _repoSite = await getSiteSyncRepository();
    req.body['host'] = process.env.DHIS_HOST;
    req.body['cibleName'] = 'events';
    req.body['program'] = 'siupB4uk4O2';

    const dhis2Sync = new Dhis2SyncConfig(req.body);

    var siteName = (await _repoSite.findOneBy({ external_id: req.body.orgUnit }))?.name;

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
                                const siteId: any = await getSiteByDhis2Uid(row.orgUnit);
                                var districtId = undefined;
                                try {
                                    districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                } catch (error) {
                                    // console.log('No district found !')
                                }
                                const chwsId: any = await getChwsByDhis2Uid(getValue(row.dataValues, 'JkMyqI3e6or'));
                                const dateVal = getValue(row.dataValues, 'RlquY86kI66');
                                if (districtId && isNotNull(siteId) && isNotNull(chwsId) && isNotNull(dateVal)) {
                                    if (!outPutInfo.hasOwnProperty(`Données Total ${siteName}`)) outPutInfo[`Données Total ${siteName}`] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' }
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
                                        outPutInfo[`Données Total ${siteName}`]["successCount"] += 1;
                                    } catch (error: any) {
                                        outPutInfo[`Données Total ${siteName}`]["errorCount"] += 1;
                                        outPutInfo[`Données Total ${siteName}`]["errorElements"] += `\n\n\n\n__________\n\n\n\n${error.toString()}`;
                                        outPutInfo[`Données Total ${siteName}`]["errorIds"] += `\n\n\n\n__________\n\n\n\n${row.event}`;
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
                    outPutInfo[`Message ${siteName}`]["errorElements"] = err.message;
                    return res.status(201).json(outPutInfo);
                });
                process.on('uncaughtException', (err: any) => {
                    // outPutInfo.status = 201;
                    outPutInfo[`Message ${siteName}`] = {}
                    outPutInfo[`Message ${siteName}`]["errorElements"] = err.message;
                    return res.status(201).json(outPutInfo);
                });

            } catch (err: any) {
                // outPutInfo.status = 201;
                outPutInfo[`Message ${siteName}`] = {}
                outPutInfo[`Message ${siteName}`]["errorElements"] = err.message;
                return res.status(201).json(outPutInfo);
            }
        }).catch(async (err: any) => {
            // outPutInfo.status = 201;
            outPutInfo[`Message ${siteName}`] = {}
            outPutInfo[`Message ${siteName}`]["errorElements"] = err.message;
            return res.status(201).json(outPutInfo);
        });

    // request(dhis2Sync.headerOptions(), async (err: any, res: any, body: any) => {});

};

export async function fetchChwsDataFromCouchDb(req: Request, resp: Response, next: NextFunction) {

    var outPutInfo: any = {};

    if (!validationResult(req).isEmpty()) {
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["errorElements"] = "Your request provides was rejected !";
        resp.status(500).json(outPutInfo);
        return;
    }

    var params: CouchDbFetchData = {
        viewName: 'reports_by_date',
        startKey: [Functions.date_to_milisecond(req.body.start_date, true)],
        endKey: [Functions.date_to_milisecond(req.body.end_date, false)],
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
                                        // console.log('No district found !')
                                    }
                                    if (districtId && siteId) {
                                        if (!outPutInfo.hasOwnProperty("Données Total")) outPutInfo["Données Total"] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' }
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
                                            outPutInfo["Données Total"]["successCount"] += 1;
                                        } catch (err: any) {
                                            outPutInfo["Données Total"]["errorCount"] += 1;
                                            outPutInfo["Données Total"]["errorElements"] += `\n\n\n\n__________\n\n\n\n${err.toString()}`;
                                            outPutInfo["Données Total"]["errorIds"] += `\n\n\n\n__________\n\n\n\n${row.doc._id}`;

                                            // outPutInfo["ErrorMsg"] = {}
                                            // outPutInfo["ErrorMsg"]["error"] = err.toString()
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
                    outPutInfo["Message"]["errorElements"] = err.message;
                    resp.status(err.statusCode).json(outPutInfo);
                }
            });
            process.on('uncaughtException', (err: any) => {
                if (!err.statusCode) err.statusCode = 500;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["errorElements"] = err.message;
                resp.status(err.statusCode).json(outPutInfo);
            });
            res.on('error', (err: any) => {
                if (!err.statusCode) err.statusCode = 500;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["errorElements"] = err.message;
                resp.status(err.statusCode).json(outPutInfo);
            });
        });
    } catch (err: any) {
        if (!err.statusCode) err.statusCode = 500;
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["errorElements"] = err.message;
        resp.status(err.statusCode).json(outPutInfo);
    }
}

export async function fetchOrgUnitsFromCouchDb(req: Request, resp: Response, next: NextFunction) {

    var outPutInfo: any = {};
    if (!validationResult(req).isEmpty()) {
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["errorElements"] = "Your request provides was rejected !";
        return resp.status(500).json(outPutInfo);
    }

    var params: CouchDbFetchData = {
        viewName: 'contacts_by_type',
        // startKey: [Functions.date_to_milisecond(req.body.start_date, true)],
        // endKey: [Functions.date_to_milisecond(req.body.end_date, false)],
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
                        site: req.body.site,
                        zone: req.body.zone,
                        family: req.body.family,
                        patient: req.body.patient,
                        chw: req.body.chw
                    };

                    if (authorized.site) {
                        outDoneLenght++;
                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'district_hospital') {
                                const siteId = row.doc._id;
                                if (siteId) {
                                    if (!outPutInfo.hasOwnProperty("Sites")) outPutInfo["Sites"] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' };
                                    try {
                                        const _syncSite = new Sites();
                                        if (row.doc.hasOwnProperty("district_external_id")) {
                                            const districtId = row.doc.district_external_id;
                                            const districtName = row.doc.district_external_name;
                                            try {
                                                if (isNotNull(districtId) && isNotNull(districtName)) {
                                                    if (!outPutInfo.hasOwnProperty("Districts")) outPutInfo["Districts"] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' };
                                                    const _syncDistrict = new Districts();
                                                    _syncDistrict.id = districtId
                                                    _syncDistrict.name = districtName;
                                                    _syncDistrict.source = dataSource;
                                                    await _repoDistrict.save(_syncDistrict);
                                                    if (!districtList.includes(districtId)) {
                                                        districtList.push(districtId);
                                                        outPutInfo["Districts"]["successCount"] += 1;
                                                    }
                                                    _syncSite.district = districtId;
                                                }
                                            } catch (err: any) {
                                                if (!districtList.includes(districtId)) {
                                                    districtList.push(districtId);
                                                    outPutInfo["Districts"]["errorCount"] += 1;
                                                    outPutInfo["Districts"]["errorElements"] += `\n\n\n\n__________\n\n\n\n${err.toString()}`;
                                                    outPutInfo["Districts"]["errorIds"] += `\n\n\n\n__________\n\n\n\n${districtId}`;
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
                                        outPutInfo["Sites"]["successCount"] += 1;
                                    } catch (err: any) {
                                        outPutInfo["Sites"]["errorCount"] += 1;
                                        outPutInfo["Sites"]["errorElements"] += `\n\n\n\n__________\n\n\n\n${err.toString()}`;
                                        outPutInfo["Sites"]["errorIds"] += `\n\n\n\n__________\n\n\n\n${siteId}`;
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
                                    // console.log('No district found !')
                                }
                                if (siteId && districtId) {
                                    if (!outPutInfo.hasOwnProperty("Zones")) outPutInfo["Zones"] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' };
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
                                        outPutInfo["Zones"]["successCount"] += 1;
                                    } catch (err: any) {
                                        outPutInfo["Zones"]["errorCount"] += 1;
                                        outPutInfo["Zones"]["errorElements"] += `\n\n\n\n__________\n\n\n\n${err.toString()}`;
                                        outPutInfo["Zones"]["errorIds"] += `\n\n\n\n__________\n\n\n\n${row.doc._id}`;
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
                                        // console.log('No district found !')
                                    }
                                    if (siteId && districtId) {
                                        if (!outPutInfo.hasOwnProperty("Familles")) outPutInfo["Familles"] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' }
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
                                            outPutInfo["Familles"]["successCount"] += 1;
                                        } catch (err: any) {
                                            outPutInfo["Familles"]["errorCount"] += 1;
                                            outPutInfo["Familles"]["errorElements"] += `\n\n\n\n__________\n\n\n\n${err.toString()}`;
                                            outPutInfo["Familles"]["errorIds"] += `\n\n\n\n__________\n\n\n\n${row.doc._id}`;
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
                                            // console.log('No district found !')
                                        }
                                        if (districtId && siteId) {
                                            if (!outPutInfo.hasOwnProperty("Patients")) outPutInfo["Patients"] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '', }
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
                                                outPutInfo["Patients"]["successCount"] += 1;
                                            } catch (err: any) {
                                                outPutInfo["Patients"]["errorCount"] += 1;;
                                                outPutInfo["Patients"]["errorElements"] += `\n\n\n\n__________\n\n\n\n${err.toString()}`;
                                                outPutInfo["Patients"]["errorIds"] += `\n\n\n\n__________\n\n\n\n${row.doc._id}`;
                                                // console.log(row.doc._id)
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
                                        // console.log('No district found !')
                                    }
                                    if (districtId && siteId) {
                                        if (!outPutInfo.hasOwnProperty("Asc")) outPutInfo["Asc"] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' };
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
                                            _syncChws.district = districtId;
                                            _syncChws.site = siteId;
                                            _syncChws.zone = row.doc.parent._id;
                                            await _repoChws.save(_syncChws);
                                            outPutInfo["Asc"]["successCount"] += 1;
                                        } catch (err: any) {
                                            outPutInfo["Asc"]["errorCount"] += 1;
                                            outPutInfo["Asc"]["errorElements"] += `\n\n\n\n__________\n\n\n\n${err.toString()}`;
                                            outPutInfo["Asc"]["errorIds"] += `\n\n\n\n__________\n\n\n\n${row.doc._id}`;
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
                    outPutInfo["Message"]["errorElements"] = err.message;
                    resp.status(err.statusCode).json(outPutInfo);
                }
            });
            process.on('uncaughtException', (err: any) => {
                if (!err.statusCode) err.statusCode = 500;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["errorElements"] = err.message;
                resp.status(err.statusCode).json(outPutInfo);
            });
            res.on('error', (err: any) => {
                if (!err.statusCode) err.statusCode = 500;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["errorElements"] = err.message;
                resp.status(err.statusCode).json(outPutInfo);
            });
        }).on('error', (err: any) => {
            if (!err.statusCode) err.statusCode = 500;
            outPutInfo["Message"] = {}
            outPutInfo["Message"]["errorElements"] = err.message;
            resp.status(err.statusCode).json(outPutInfo);
        });

    } catch (err: any) {
        if (!err.statusCode) err.statusCode = 500;
        outPutInfo["Message"] = {}
        outPutInfo["Message"]["errorElements"] = err.message;
        resp.status(err.statusCode).json(outPutInfo);
    }
}


export async function insertOrUpdateDataToDhis2(req: Request, res: Response, next: NextFunction) {
    const { dhisusersession, chwsDataToDhis2 } = req.body;

    const chwsData = chwsDataToDhis2 as DataIndicators;

    try {
        if (isNotNull(chwsData)) {
            var jsonData = matchDhis2Data(chwsData);
            const date = getValue(jsonData["dataValues"], "lbHrQBTbY1d");  // reported_date
            const srce = getValue(jsonData["dataValues"], "FW6z2Ha2GNr");  // data_source
            const dist = getValue(jsonData["dataValues"], "JC752xYegbJ");  // district
            const chw = getValue(jsonData["dataValues"], "JkMyqI3e6or");  // code_asc
            const site = jsonData['orgUnit'];
            const program = jsonData['program'];
            const data_filter = "JC752xYegbJ:EQ:" + dist + ",JkMyqI3e6or:like:" + chw + ",lbHrQBTbY1d:EQ:" + date + ",FW6z2Ha2GNr:like:" + srce;
            const fields = "event,eventDate,dataValues[dataElement, value]";
            const headers = httpHeaders('Basic ' + dhisusersession);
            const link = `https://${process.env.DHIS_HOST}/api/events`;
            const params = `.json?paging=false&program=${program}&orgUnit=${site}&filter=${data_filter}&fields=${fields}&order=created:desc`;

            await request({
                url: link + params,
                method: 'GET',
                headers: headers
            }, async function (err: any, response1: any, body: any) {
                if (err) return res.status(201).json({ status: 201, data: err.toString(), chw:chw });
                try {
                    const jsonBody = JSON.parse(body);
                    if (jsonBody.hasOwnProperty('events')) {
                        var reqData: Dhis2DataFormat[] = jsonBody["events"] as Dhis2DataFormat[];
                        const dataId = reqData.length == 1 ? reqData[0].event : ''
    
                        await request({
                          url: reqData .length == 1 ? `${link}/${dataId}` : link,
                          cache: 'no-cache',
                          mode: "cors",
                          credentials: "include",
                          referrerPolicy: 'no-referrer',
                          method: reqData .length == 1 ? 'PUT' : 'POST',
                          body: JSON.stringify(jsonData),
                          headers: headers
                        }, async function (err: any, response2: any, body: any) {
                            if (err) return res.status(201).json({ status: 201, data: err.toString(), chw:chw });
                            if (response2.statusCode != 200) return res.status(201).json({status:  201, data: `Error Found, retry!`, chw:chw })
                            return res.status(200).json({status: 200 , data: reqData .length == 1 ? `Updated` : `Created`})
                        });
    
                    } else {
                        return res.status(201).json({ status: 201, data: 'Connection Error! Retry', chw:chw  });
                    }
                } catch (error) {
                    console.log(link + params);
                }
            });
        } else {
            return res.status(201).json({ status: 201, data: 'No Data Available!', chw:''  });
        }
    } catch (err:any) {
        return res.status(201).json({ status: 201, data: err.toString(), chw:'' });
    }
}



export function matchDhis2Data(datas: DataIndicators) {

    var dataValues = [
        {
            "dataElement": "FW6z2Ha2GNr",  // source de données
            "value": datas["data_source"],
        },
        {
            "dataElement": "lbHrQBTbY1d",  // report_date
            "value": datas["reported_date"],
        },
        {
            "dataElement": "JkMyqI3e6or",  // list des ASC
            "value": datas["code_asc"],
        },
        {
            "dataElement": "JC752xYegbJ",  // admin_org_unit_district
            "value": datas["district"],
        },
        {
            "dataElement": "lvW5Kj1cisa", // "Nombre d'enfant 0 à 5 ans pris en charge à domicile
            "value": datas["total_vad_pcime_c"],
        },
        {
            "dataElement": "M6WRPsREqsZ",  // "Total Vad PCIME Suivi
            "value": datas["total_suivi_pcime_c"],
        },
        {
            "dataElement": "oeDKJi4BICh",  // total_vad
            "value": datas["total_vad"],
        },
        {
            "dataElement": "PrN89trdUGm", // "Nombre de femme enceinte nouveau cas
            "value": datas["total_vad_femmes_enceintes_NC"],
        },
        {
            "dataElement": "wdg7jjP9ZRg", // "Nombre de femmes référée pour plannification familiale
            "value": datas["reference_femmes_pf"],
        },
        {
            "dataElement": "qNxNXSwDAaI", // "promptitude diarrhée 24h
            "value": datas["prompt_diarrhee_24h_pcime_soins"],
        },
        {
            "dataElement": "S1zPDVOIVLZ",  // "promptitude diarrhee 48h
            "value": datas["prompt_diarrhee_48h_pcime_soins"],
        },
        {
            "dataElement": "nW3O5ULr75J", // "promptitude diarrhée 72h
            "value": datas["prompt_diarrhee_72h_pcime_soins"],
        },
        {
            "dataElement": "NUpARMZ383s", // "promptitude paludisme 24h
            "value": datas["prompt_paludisme_24h_pcime_soins"],
        },
        {
            "dataElement": "yQa48SF9bua", // "promptitude paludisme 48h
            "value": datas["prompt_paludisme_48h_pcime_soins"],
        },
        {
            "dataElement": "NzKjJuAniNx", // "promptitude paludisme 72h
            "value": datas["prompt_paludisme_72h_pcime_soins"],
        },
        {
            "dataElement": "AA2We0Ao5sv", // "promptitude pneumonie 24h
            "value": datas["prompt_pneumonie_24h_pcime_soins"],
        },
        {
            "dataElement": "PYwikai4k2J", // "promptitude pneumonie 48h
            "value": datas["prompt_pneumonie_48h_pcime_soins"],
        },
        {
            "dataElement": "rgjFO0bDVUL", // "promptitude pneumonie 72h
            "value": datas["prompt_pneumonie_72h_pcime_soins"],
        },
        {
            "dataElement": "WR9u3cGJn9W", // "total consultation femme enceinte
            "value": datas["total_vad_femmes_enceinte"],
        },
        {
            "dataElement": "Pl6qRNgjd3a", // "total de femmes référées par les asc
            "value": datas["reference_femmes_enceinte_postpartum"],
        },
        {
            "dataElement": "DicYcTqr9xT", // "Total de référence pcime
            "value": datas["reference_pcime"],
        },
        {
            "dataElement": "caef2rf638P", // "total diarrhee pcime
            "value": datas["total_diarrhee_pcime_soins"],
        },
        {
            "dataElement": "Q0BQtUdJOCy", // "Total femmes en postpartum
            "value": datas["total_vad_femmes_postpartum"],
        },
        {
            "dataElement": "dLYksBMOqST", // "total malnutrition pcime
            "value": datas["total_malnutrition_pcime_soins"],
        },
        {
            "dataElement": "jp2i3vN3VJk", // "total paludisme pcime
            "value": datas["total_paludisme_pcime_soins"],
        },
        {
            "dataElement": "LZ3R8fj9CGG", // "total pneumonie pcime
            "value": datas["total_pneumonie_pcime_soins"],
        },
        {
            "dataElement": "O9EZVn3C3pF", // "Total postpartum nouveau cas
            "value": datas["total_vad_femme_postpartum_NC"],
        },
        {
            "dataElement": "lsBS60uQPtc", // "Total recherche active
            "value": datas["total_recherche_active"],
        },
        {
            "dataElement": "lopdYxQrgyj", // "Total test de grossesse administrée
            "value": datas["total_test_de_grossesse_domicile"],
        },
        {
            "dataElement": "AzwUzgh0nd7",  // "Total Vad Pf
            "value": datas["total_vad_family_planning"],
        }
    ]

    return {
        "program": "aaw8nwnmmcC",
        "orgUnit": datas["orgUnit"],  // "PgoyKuRs20z",
        "eventDate": datas["reported_date"] + "T00:00:00.000",  // "2021-05-07T00:00:00.000",
        "status": "COMPLETED",
        "completedDate": datas["reported_date"] + "T00:00:00.000",  // "2021-05-07T00:00:00.000",
        "dataValues": dataValues
    };
}


