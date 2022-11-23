import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import https = require('https');
const request = require('request');

import { getChwsDataSyncRepository, ChwsData, getFamilySyncRepository, Families, Sites, getSiteSyncRepository, getPatientSyncRepository, Patients, getChwsSyncRepository, Chws, getZoneSyncRepository, Zones, Districts, getDistrictSyncRepository } from "../entity/Sync";
import { Dhis2DataFormat } from "../utils/appInterface";
import { Dhis2SyncConfig, Functions, isNotNull, MedicSyncConfig } from "../utils/functions";

require('dotenv').config({ path: `${Functions.sslFolder('.env')}` });


function genarateKozahChwsCode(code: string): string {
    const d: string[] = code.split('');
    return `KKO${d[0]}${d[1]}${d[2]}-${d[3]}${d[4]}${d[5]}`;
}

const sitesKozah = [
    { id: 'HROrwGFFFR6', name: 'Adabawéré', external_id: '904158c2-5920-4003-9c15-9bf1e18b093d' },
    { id: 'PJUDnUoUOXC', name: 'Djamdè', external_id: 'da388770-c361-40e0-ba60-e106781184d1' },
    { id: 'S99zHZFkiKU', name: 'Kpindi', external_id: 'e6b3fc59-2580-4552-93c9-a4a40cef13da' },
    { id: 'PLqoLdWlKg9', name: 'Sarakawa', external_id: '5827654a-1c65-4aa3-a917-c83f294d965e' },
];

function getKozahSitesExternalId(id: string): string {
    for (let i = 0; i < sitesKozah.length; i++) {
        const el = sitesKozah[i];
        if (el.external_id == id) {
            return el.id;
        }
    }
    return '';
}

function getAllKozahExternalIds(): string[] {
    var res: string[] = [];
    for (let i = 0; i < sitesKozah.length; i++) {
        const el = sitesKozah[i];
        res.push(el.external_id);
    }
    return res;
}

const sitesBassar = [
    { id: 'PgoyKuRs20z', name: 'Bangeli', external_id: '' },
    { id: 'ObvNuNoKi46', name: 'Kabou-Sara', external_id: '' },
    { id: 'KoA5gCxrxkr', name: 'Koundoum', external_id: '' },
    { id: 'ris2jRhudfy', name: 'Manga', external_id: '' },
    { id: 'qN7l0oPDA7m', name: 'Sanda-Afohou', external_id: '' },
];

const sitesDankpen = [
    { id: 'w6YTNjy898U', name: 'Koutiere', external_id: '' },
    { id: 'Ubc4fWZAAz9', name: 'Kpetab', external_id: '' },
    { id: 'QRtRvWW1VBL', name: 'Naware', external_id: '' },
    { id: 'kCD9l4Qx2WP', name: 'Solidarite', external_id: '' },
];

const sitesKeran = [
    { id: 'WI3DehMC7KX', name: 'Kokou-Temberma', external_id: '' },
    { id: 'k52TtOanhCc', name: 'Nadoba', external_id: '' },
    { id: 'n8KsML0ncGk', name: 'Natiponi', external_id: '' },
    { id: 'SdrxZwN9YeK', name: 'Pangouda', external_id: '' },
    { id: 'coB3NqYIMOW', name: 'Warengo', external_id: '' },
];

const sitesBinah = [
    { id: 'eEQIxvIsWib', name: 'Assere', external_id: '' },
    { id: 'oQandBcJt22', name: 'Boufalé', external_id: '' },
    { id: 'RDuBzY0i1As', name: 'Kouyoria', external_id: '' },
    { id: 'tltz80zDS85', name: 'N\'djei', external_id: '' },
    { id: 'BY9niUgBS0k', name: 'Pessare', external_id: '' },
    { id: 'PYeCQPNnSAn', name: 'Sirka', external_id: '' },
    { id: 'eJtIZ3ZMkfH', name: 'Solla', external_id: '' },
];

const districts = [
    { id: 'x8f4IKAC7TO', name: 'Kozah', child: sitesKozah },
    { id: 'J6T6ZkEGTo7', name: 'Bassar', child: sitesBassar },
    { id: 'ozy7P6dwv5X', name: 'Dankpen', child: sitesDankpen },
    { id: 'MK4n2uGqxs3', name: 'Kéran', child: sitesKeran },
    { id: 'KOEmjPzRmPd', name: 'Binah', child: sitesBinah },
];

const kozahHost: string = "hth-togo.app.medicmobile.org";
const chtHost: string = "portal-integratehealth.org";
const dhisHost: string = "dhis2.integratehealth.org/dhis"

function formatDataId(host: any, id: any, port: any): string {
    const val = `${host}`.replace('.org', '').replace('.', '').replace('-', '').replace('/', '').trim();
    return `${id}_${val}.${port}`;
}

// 01445bec-67d5-471f-bb49-ade68d62fc5a, 
// 1d5c2ffc-b579-4956-ab8a-b8b12f19f197

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



export class SyncFromCouchDbController {

    static fetchChwsDataFromDhis2 = async (req: Request, resp: Response, next: NextFunction) => {
        var outPutInfo: any = {};
        if (!validationResult(req).isEmpty()) {
            outPutInfo["Message"] = {}
            outPutInfo["Message"]["error"] = "Your request provides was rejected !";
            return resp.status(500).json(outPutInfo);
        }
        
        const repository = await getChwsDataSyncRepository();

        try {
            req.body['host'] = process.env.DHIS_HOST;
            req.body['username'] = process.env.DHIS_USER;
            req.body['password'] = process.env.DHIS_PASS;
            req.body['cibleName'] = 'events';
            req.body['program'] = 'siupB4uk4O2';

            const dhis2Sync = new Dhis2SyncConfig(req.body);

            request(dhis2Sync.headerOptions(), async (err: any, res: any, body: any) => {
                if (err) {
                    if (!err.statusCode) err.statusCode = 500;
                    outPutInfo.status = err.statusCode;
                    outPutInfo.data = "Your request provides was rejected !";
                    return resp.status(err.statusCode).json(outPutInfo);
                };
                outPutInfo.status = res.statusCode;
                var jsonBody: Dhis2DataFormat[] = JSON.parse(body)['events'] as Dhis2DataFormat[];

                if (isNotNull(jsonBody)) {
                    var len = jsonBody.length;
                    var done: number = 0;
                    for (let i = 0; i < len; i++) {
                        done++;
                        const row: Dhis2DataFormat = jsonBody[i];
                        if (isNotNull(row)) {
                            if (row.dataValues.length > 0) {
                                const siteId = await getSiteByDhis2Uid(row.orgUnit);
                                const chwsId = await getChwsByDhis2Uid(getValue(row.dataValues, 'JkMyqI3e6or'));
                                const dateVal = getValue(row.dataValues, 'RlquY86kI66');
                                if (isNotNull(siteId) && isNotNull(chwsId) && isNotNull(dateVal)) {
                                    if (!outPutInfo.hasOwnProperty("Données Total")) outPutInfo["Données Total"] = { error: 0, success: 0 }
                                    try {
                                        const _dhis2Sync = new ChwsData();
                                        _dhis2Sync.source = `${dhis2Sync.host}.${dhis2Sync.port}`;
                                        _dhis2Sync.id = formatDataId(dhis2Sync.host, row.event, dhis2Sync.port);
                                        _dhis2Sync.form = getValue(row.dataValues, 'plW6bCSnXKU');
                                        _dhis2Sync.reported_date = Functions.milisecond_to_date(dateVal, 'dateOnly');
                                        _dhis2Sync.chw = chwsId;
                                        _dhis2Sync.site = siteId;
                                        // _dhis2Sync.district = getValue(row.dataValues, 'JC752xYegbJ')
                                        _dhis2Sync.fields = getDataValuesAsMap(row.dataValues, ['JkMyqI3e6or', 'plW6bCSnXKU', 'RlquY86kI66', 'JC752xYegbJ']);
                                        await repository.save(_dhis2Sync);
                                        outPutInfo["Données Total"]["success"] += 1;
                                    } catch (error: any) {
                                        outPutInfo["Données Total"]["error"] += 1
                                    }
                                }
                            }
                        }
                    }
                    if (done === len) return resp.status(res.statusCode).json(outPutInfo);
                }
                return resp.status(res.statusCode).json(outPutInfo);
            });
            process.on('UnhandledPromiseRejectionWarning', (err: any) => {
                console.log(err)
            });
            process.on('uncaughtException', (err: any) => {
                if (!err.statusCode) err.statusCode = 500;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["error"] = err.message;
                return resp.status(err.statusCode).json(outPutInfo);
            });
        } catch (err: any) {
            if (!err.statusCode) err.statusCode = 500;
            outPutInfo["Message"] = {}
            outPutInfo["Message"]["error"] = err.message;
            return resp.status(err.statusCode).json(outPutInfo);
        }

    };

    static fetchChwsDataByReportsDateViewFromCouchDb = async (req: Request, resp: Response, next: NextFunction) => {

        var outPutInfo: any = {};

        if (!validationResult(req).isEmpty()) {
            outPutInfo["Message"] = {}
            outPutInfo["Message"]["error"] = "Your request provides was rejected !";
            resp.status(500).json(outPutInfo);
            return;
        }

        try {
            const sync = new MedicSyncConfig(req.body, 'reports_by_date');
            if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';


            https.get(sync.headerOptions(), async function (res) {
                var body = "";
                res.on('data', (data) => {
                    body += data.toString();
                });
                res.on('end', async () => {
                    try {
                        const repository = await getChwsDataSyncRepository();
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
                                        if (sync.host != kozahHost || sync.host === kozahHost && getAllKozahExternalIds().includes(siteId)) {
                                            if (!outPutInfo.hasOwnProperty("Données Total")) outPutInfo["Données Total"] = { error: 0, success: 0 }
                                            try {
                                                const _sync = new ChwsData();
                                                _sync.source = `${sync.host}.${sync.port}`;
                                                _sync.id = formatDataId(sync.host, row.doc._id, sync.port);
                                                _sync.form = row.doc.form;
                                                _sync.phone = row.doc.from;
                                                _sync.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                                _sync.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                                _sync.chw = row.doc.contact._id;
                                                _sync.zone = row.doc.contact.parent._id;
                                                _sync.site = siteId;
                                                _sync.fields = Functions.getJsonFieldsAsKeyValue('', row.doc.fields);
                                                _sync.patient_id = row.doc.fields.patient_id;
                                                if (!row.doc.geolocation.hasOwnProperty('code')) _sync.geolocation = Functions.getJsonFieldsAsKeyValue('', row.doc.geolocation);
                                                await repository.save(_sync);
                                                outPutInfo["Données Total"]["success"] += 1;
                                            } catch (error: any) {
                                                outPutInfo["Données Total"]["error"] += 1
                                            }
                                        }
                                    }
                                }
                            }

                            if (done === len) resp.status(200).json(outPutInfo);
                        } else {
                            resp.status(200).json(outPutInfo);
                        }
                        if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '1';
                    } catch (err: any) {
                        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '1';
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

    static fetchAllSitesFamiliesPersonsRegisteredFromCouchDb = async (req: Request, resp: Response, next: NextFunction) => {

        var outPutInfo: any = {};

        if (!validationResult(req).isEmpty()) {
            outPutInfo["Message"] = {}
            outPutInfo["Message"]["error"] = "Your request provides was rejected !";
            return resp.status(500).json(outPutInfo);
        }

        try {
            const sync = new MedicSyncConfig(req.body, 'contacts_by_type');
            if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';

            https.get(sync.headerOptions(), async function (res) {
                var body = "";
                res.on('data', (data) => {
                    body += data.toString();
                });
                res.on('end', async () => {
                    try {
                        var jsonBody: any = JSON.parse(body).rows;
                        var len = jsonBody.length;
                        var done: number = 0;
                        const _repoDistrict = await getDistrictSyncRepository();
                        const _repoSite = await getSiteSyncRepository();
                        const _repoZone = await getZoneSyncRepository();
                        const _repoFamily = await getFamilySyncRepository();
                        const _repoPatient = await getPatientSyncRepository();
                        const _repoChws = await getChwsSyncRepository();

                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'district_hospital') {
                                const siteId = row.doc._id;
                                if (sync.host != kozahHost || sync.host === kozahHost && getAllKozahExternalIds().includes(siteId)) {
                                    if (!outPutInfo.hasOwnProperty("Sites")) outPutInfo["Sites"] = { error: 0, success: 0 };
                                    try {
                                        const _syncSite = new Sites();
                                        if (isNotNull(row.doc.district_external_id)) {
                                            try {
                                                const _syncDistrict = new Districts();
                                                _syncDistrict.id = row.district_external_id;
                                                _syncDistrict.name = row.district_external_name;
                                                _syncDistrict.source = `${sync.host}.${sync.port}`;
                                                await _repoDistrict.save(_syncDistrict);
                                                outPutInfo["Districts"]["success"] += 1;
                                            } catch (error) {
                                                outPutInfo["Districts"]["error"] += 1
                                            }
                                            _syncSite.district = row.district_external_id;
                                        }

                                        _syncSite.source = `${sync.host}.${sync.port}`;
                                        _syncSite.id = siteId;
                                        _syncSite.name = row.doc.name;
                                        _syncSite.external_id = sync.host === kozahHost ? getKozahSitesExternalId(siteId) : row.doc.external_id;
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

                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'health_center' && row.doc.hasOwnProperty('parent')) {
                                const siteId = row.doc.parent._id;
                                if (sync.host != kozahHost || sync.host === kozahHost && getAllKozahExternalIds().includes(siteId)) {
                                    if (!outPutInfo.hasOwnProperty("Zones")) outPutInfo["Zones"] = { error: 0, success: 0 };
                                    try {
                                        const _syncZone = new Zones();
                                        _syncZone.source = `${sync.host}.${sync.port}`;
                                        _syncZone.id = row.doc._id;
                                        _syncZone.name = row.doc.name;
                                        _syncZone.external_id = row.doc.external_id;
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

                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'clinic' && row.doc.hasOwnProperty('parent')) {
                                if (row.doc.parent.hasOwnProperty('parent')) {
                                    const siteId = row.doc.parent.parent._id;
                                    if (sync.host != kozahHost || sync.host === kozahHost && getAllKozahExternalIds().includes(siteId)) {
                                        if (!outPutInfo.hasOwnProperty("Famille")) outPutInfo["Famille"] = { error: 0, success: 0 }
                                        try {
                                            const _syncFamily = new Families();
                                            _syncFamily.source = `${sync.host}.${sync.port}`;
                                            _syncFamily.id = row.doc._id;
                                            _syncFamily.name = row.doc.name;
                                            _syncFamily.external_id = row.doc.external_id;
                                            _syncFamily.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _syncFamily.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _syncFamily.zone = row.doc.parent._id;
                                            _syncFamily.site = siteId;
                                            await _repoFamily.save(_syncFamily);
                                            outPutInfo["Famille"]["success"] += 1;
                                        } catch (error: any) {
                                            outPutInfo["Famille"]["error"] += 1
                                        }
                                    }
                                }
                            }
                        }

                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'person' && row.doc.role === 'patient' && row.doc.hasOwnProperty('parent')) {
                                if (row.doc.parent.hasOwnProperty('parent')) {
                                    if (row.doc.parent.parent.hasOwnProperty('parent')) {
                                        const siteId = row.doc.parent.parent.parent._id;
                                        if (sync.host != kozahHost || sync.host === kozahHost && getAllKozahExternalIds().includes(siteId)) {
                                            if (!outPutInfo.hasOwnProperty("Patients")) outPutInfo["Patients"] = { error: 0, success: 0, }
                                            try {
                                                const _syncPatient = new Patients();
                                                _syncPatient.source = `${sync.host}.${sync.port}`;
                                                _syncPatient.id = row.doc._id;
                                                _syncPatient.name = row.doc.name;
                                                _syncPatient.external_id = row.doc.external_id;
                                                _syncPatient.role = row.doc.role;
                                                _syncPatient.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                                _syncPatient.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                                _syncPatient.family = row.doc.parent._id;
                                                _syncPatient.zone = row.doc.parent.parent._id;
                                                _syncPatient.site = siteId;
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

                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'person' && row.doc.role === 'chw' && row.doc.hasOwnProperty('parent')) {
                                if (row.doc.parent.hasOwnProperty('parent')) {
                                    const siteId = row.doc.parent.parent._id;
                                    if (sync.host != kozahHost || sync.host === kozahHost && getAllKozahExternalIds().includes(siteId)) {
                                        if (!outPutInfo.hasOwnProperty("Asc")) outPutInfo["Asc"] = { error: 0, success: 0 };
                                        try {
                                            const _syncChws = new Chws();
                                            _syncChws.source = `${sync.host}.${sync.port}`;
                                            _syncChws.id = row.doc._id;
                                            _syncChws.name = row.doc.name;
                                            _syncChws.external_id = sync.host === kozahHost ? genarateKozahChwsCode(row.doc.external_id) : row.doc.external_id;
                                            _syncChws.role = row.doc.role;
                                            _syncChws.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _syncChws.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _syncChws.zone = row.doc.parent._id;
                                            _syncChws.site = siteId;
                                            await _repoChws.save(_syncChws);
                                            outPutInfo["Asc"]["success"] += 1;
                                        } catch (error: any) {
                                            outPutInfo["Asc"]["error"] += 1;
                                        }
                                    }
                                }
                            }
                        }

                        if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '1';
                        if (done === len * 5) resp.status(200).json(outPutInfo);
                    } catch (err: any) {
                        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '1';
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
    }


}





