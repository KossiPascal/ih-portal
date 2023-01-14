import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import https from 'https';
const request = require('request');
// const axios = require('axios');
// import fetch from 'node-fetch';
const fetch = require('node-fetch')

import { getChwsDataSyncRepository, ChwsData, getFamilySyncRepository, Families, Sites, getSiteSyncRepository, getPatientSyncRepository, Patients, getChwsSyncRepository, Chws, getZoneSyncRepository, Zones, Districts, getDistrictSyncRepository } from "../entity/Sync";
import { ChwUserParams, Dhis2DataFormat } from "../utils/appInterface";
import { Dhis2SyncConfig, Functions, isNotNull, CouchDbSyncConfig } from "../utils/functions";

require('dotenv').config({ path: `${Functions.sslFolder('.env')}` });

// 01445bec-67d5-471f-bb49-ade68d62fc5a, 
// 1d5c2ffc-b579-4956-ab8a-b8b12f19f197

const sites = [
    { id: '904158c2-5920-4003-9c15-9bf1e18b093d', external_id: 'HROrwGFFFR6', name: 'Adabawéré', districtId: 'x8f4IKAC7TO', districtName: 'Kozah' },
    { id: 'da388770-c361-40e0-ba60-e106781184d1', external_id: 'PJUDnUoUOXC', name: 'Djamdè', districtId: 'x8f4IKAC7TO', districtName: 'Kozah' },
    { id: 'e6b3fc59-2580-4552-93c9-a4a40cef13da', external_id: 'S99zHZFkiKU', name: 'Kpindi', districtId: 'x8f4IKAC7TO', districtName: 'Kozah' },
    { id: '5827654a-1c65-4aa3-a917-c83f294d965e', external_id: 'PLqoLdWlKg9', name: 'Sarakawa', districtId: 'x8f4IKAC7TO', districtName: 'Kozah' },

    { id: '', external_id: 'PgoyKuRs20z', name: 'Bangeli', districtId: 'J6T6ZkEGTo7', districtName: 'Bassar' },
    { id: '', external_id: 'ObvNuNoKi46', name: 'Kabou-Sara', districtId: 'J6T6ZkEGTo7', districtName: 'Bassar' },
    { id: '', external_id: 'KoA5gCxrxkr', name: 'Koundoum', districtId: 'J6T6ZkEGTo7', districtName: 'Bassar' },
    { id: '', external_id: 'ris2jRhudfy', name: 'Manga', districtId: 'J6T6ZkEGTo7', districtName: 'Bassar' },
    { id: '', external_id: 'qN7l0oPDA7m', name: 'Sanda-Afohou', districtId: 'J6T6ZkEGTo7', districtName: 'Bassar' },

    { id: '', external_id: 'w6YTNjy898U', name: 'Koutiere', districtId: 'ozy7P6dwv5X', districtName: 'Dankpen' },
    { id: '', external_id: 'Ubc4fWZAAz9', name: 'Kpetab', districtId: 'ozy7P6dwv5X', districtName: 'Dankpen' },
    { id: '', external_id: 'QRtRvWW1VBL', name: 'Naware', districtId: 'ozy7P6dwv5X', districtName: 'Dankpen' },
    { id: '', external_id: 'kCD9l4Qx2WP', name: 'Solidarite', districtId: 'ozy7P6dwv5X', districtName: 'Dankpen' },

    { id: '', external_id: 'WI3DehMC7KX', name: 'Kokou-Temberma', districtId: 'MK4n2uGqxs3', districtName: 'Keran' },
    { id: '', external_id: 'k52TtOanhCc', name: 'Nadoba', districtId: 'MK4n2uGqxs3', districtName: 'Keran' },
    { id: '', external_id: 'n8KsML0ncGk', name: 'Natiponi', districtId: 'MK4n2uGqxs3', districtName: 'Keran' },
    { id: '', external_id: 'SdrxZwN9YeK', name: 'Pangouda', districtId: 'MK4n2uGqxs3', districtName: 'Keran' },
    { id: '', external_id: 'coB3NqYIMOW', name: 'Warengo', districtId: 'MK4n2uGqxs3', districtName: 'Keran' },

    { id: '', external_id: 'eEQIxvIsWib', name: 'Assere', districtId: 'KOEmjPzRmPd', districtName: 'Binah' },
    { id: '', external_id: 'oQandBcJt22', name: 'Boufalé', districtId: 'KOEmjPzRmPd', districtName: 'Binah' },
    { id: '', external_id: 'RDuBzY0i1As', name: 'Kouyoria', districtId: 'KOEmjPzRmPd', districtName: 'Binah' },
    { id: '', external_id: 'tltz80zDS85', name: 'N\'djei', districtId: 'KOEmjPzRmPd', districtName: 'Binah' },
    { id: '', external_id: 'BY9niUgBS0k', name: 'Pessare', districtId: 'KOEmjPzRmPd', districtName: 'Binah' },
    { id: '', external_id: 'PYeCQPNnSAn', name: 'Sirka', districtId: 'KOEmjPzRmPd', districtName: 'Binah' },
    { id: '', external_id: 'eJtIZ3ZMkfH', name: 'Solla', districtId: 'KOEmjPzRmPd', districtName: 'Binah' },
];

const kozahHost = "hth-togo.app.medicmobile.org";
const chtHost = "portal-integratehealth.org";
const dhisHost = "dhis2.integratehealth.org/dhis";

function generateHost(host: string): string {
    if (host == `${kozahHost}.443`) return 'Medic';
    if (host == `${chtHost}.444`) return 'Tonoudayo';
    if (host == `${dhisHost}.443`) return 'dhis2';
    return '';
}

function genarateChwsExternalId(host: string, externalId: string): string {
    if (host === kozahHost) {
        const d: string[] = externalId.split('');
        return `KKO${d[0]}${d[1]}${d[2]}-${d[3]}${d[4]}${d[5]}`;
    } else {
        return externalId;
    }
}

function getSitesExternalId(id: string, externalId: string): string {
    if (isNotNull(externalId)) {
        return externalId;
    } else {
        if (isNotNull(id)) {
            for (let i = 0; i < sites.length; i++) {
                const el = sites[i];
                if (el.id == id) {
                    return el.external_id;
                }
            }
        }
        return '';
    }
}

function CanProcideInsertion(host: string, siteId: string): boolean {
    const kozahSiteIds = [
        '904158c2-5920-4003-9c15-9bf1e18b093d',
        'da388770-c361-40e0-ba60-e106781184d1',
        'e6b3fc59-2580-4552-93c9-a4a40cef13da',
        '5827654a-1c65-4aa3-a917-c83f294d965e'
    ];
    if (host != kozahHost || host === kozahHost && kozahSiteIds.includes(siteId)) {
        return true;
    }
    return false;
}

function formatDataId(host: any, id: any, port: any): string {
    const val = `${host}`.replace('.org', '').replace('.', '').replace('-', '').replace('/', '').trim();
    return `${id}_${val}.${port}`;
}

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

    static fetchChwsDataFromDhis2 = async (req: Request, res: Response, next: NextFunction) => {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';
        var outPutInfo: any = {};
        if (!validationResult(req).isEmpty()) {
            outPutInfo["Message"] = {}
            outPutInfo["Message"]["error"] = "Your request provides was rejected !";
            return res.status(500).json(outPutInfo);
        }

        const repository = await getChwsDataSyncRepository();

        req.body['host'] = process.env.DHIS_HOST;
        req.body['username'] = process.env.DHIS_USER;
        req.body['password'] = process.env.DHIS_PASS;
        req.body['cibleName'] = 'events';
        req.body['program'] = 'siupB4uk4O2';

        const dhis2Sync = new Dhis2SyncConfig(req.body);

        await fetch(dhis2Sync.url, dhis2Sync.fecthOptions())
            .then((response: any) => response.json())
            .then(async (jsonDatas: any) => {
                try {
                    outPutInfo.status = res.statusCode;
                    var jsonBody: Dhis2DataFormat[] = jsonDatas["events"] as Dhis2DataFormat[];
                    const _repoSite = await getSiteSyncRepository();

                    if (isNotNull(jsonBody)) {
                        var len = jsonBody.length;
                        var done: number = 0;
                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: Dhis2DataFormat = jsonBody[i];
                            if (isNotNull(row)) {
                                if (row.dataValues.length > 0) {
                                    const siteId = await getSiteByDhis2Uid(row.orgUnit);
                                    var districtId = undefined;
                                    try {
                                        districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                    } catch (error) {
                                        console.log('No district found !')
                                    }

                                    const chwsId = await getChwsByDhis2Uid(getValue(row.dataValues, 'JkMyqI3e6or'));
                                    const dateVal = getValue(row.dataValues, 'RlquY86kI66');
                                    if (isNotNull(siteId) && isNotNull(chwsId) && isNotNull(dateVal)) {
                                        if (!outPutInfo.hasOwnProperty("Données Total")) outPutInfo["Données Total"] = { error: 0, success: 0 }
                                        try {
                                            const _dhis2Sync = new ChwsData();
                                            _dhis2Sync.source = generateHost(`${dhis2Sync.host}.${dhis2Sync.port}`);
                                            _dhis2Sync.id = formatDataId(dhis2Sync.host, row.event, dhis2Sync.port);
                                            _dhis2Sync.form = getValue(row.dataValues, 'plW6bCSnXKU');
                                            _dhis2Sync.reported_date = Functions.milisecond_to_date(dateVal, 'dateOnly');
                                            _dhis2Sync.chw = chwsId;
                                            _dhis2Sync.site = siteId;
                                            _dhis2Sync.district = isNotNull(districtId) ? districtId : undefined;
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
                        if (done === len) return res.status(res.statusCode).json(outPutInfo);
                    }


                    process.on('UnhandledPromiseRejectionWarning', (err: any) => {
                        if (!err.statusCode) err.statusCode = 500;
                        outPutInfo["Message"] = {}
                        outPutInfo["Message"]["error"] = err.message;
                        return res.status(err.statusCode).json(outPutInfo);
                    });
                    process.on('uncaughtException', (err: any) => {
                        if (!err.statusCode) err.statusCode = 500;
                        outPutInfo["Message"] = {}
                        outPutInfo["Message"]["error"] = err.message;
                        return res.status(err.statusCode).json(outPutInfo);
                    });
                    return res.status(res.statusCode).json(outPutInfo);

                } catch (err: any) {
                    if (!err.statusCode) err.statusCode = 200;
                    outPutInfo["Message"] = {}
                    outPutInfo["Message"]["error"] = err.message;
                    return res.status(err.statusCode).json(outPutInfo);
                }
            }).catch((err: any) => {
                if (!err.statusCode) err.statusCode = 200;
                outPutInfo["Message"] = {}
                outPutInfo["Message"]["error"] = err.message;
                return res.status(err.statusCode).json(outPutInfo);
            });

        // request(dhis2Sync.headerOptions(), async (err: any, res: any, body: any) => {});

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
            const sync = new CouchDbSyncConfig(req.body, 'reports_by_date');
            if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';

            https.get(sync.headerOptions(), async function (res) {
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
                                        if (CanProcideInsertion(sync.host, siteId)) {
                                            if (!outPutInfo.hasOwnProperty("Données Total")) outPutInfo["Données Total"] = { error: 0, success: 0 }
                                            try {
                                                const _sync = new ChwsData();
                                                _sync.source = generateHost(`${sync.host}.${sync.port}`);
                                                _sync.id = formatDataId(sync.host, row.doc._id, sync.port);
                                                _sync.form = row.doc.form;
                                                _sync.phone = row.doc.from;
                                                _sync.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                                _sync.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                                _sync.chw = row.doc.contact._id;
                                                _sync.zone = row.doc.contact.parent._id;
                                                _sync.site = siteId;
                                                _sync.district = isNotNull(districtId) ? districtId : undefined;
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
                        if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = undefined;
                    } catch (err: any) {
                        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = undefined;
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
            const sync = new CouchDbSyncConfig(req.body, 'contacts_by_type');
            if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';

            const dataSource = generateHost(`${sync.host}.${sync.port}`);

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

                        // var dad = await _repoDistrict.find();
                        // for (let z = 0; z < dad.length; z++) {
                        //     const d = dad[z];
                        //     await _repoDistrict.delete({id:d.id});
                        // }


                        var districtList: string[] = [];

                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc.type === 'district_hospital') {
                                const siteId = row.doc._id;
                                if (CanProcideInsertion(sync.host, siteId)) {
                                    if (!outPutInfo.hasOwnProperty("Sites")) outPutInfo["Sites"] = { error: 0, success: 0 };
                                    try {
                                        const _syncSite = new Sites();

                                        if (row.doc.hasOwnProperty("district_external_id") || sync.host == kozahHost) {
                                            const districtId = sync.host == kozahHost ? '' : row.doc.district_external_id;
                                            const districtName = sync.host == kozahHost ? 'Kozah' : row.doc.district_external_name;
                                            try {
                                                if (isNotNull(districtId)) {
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
                                        _syncSite.name = row.doc.name;
                                        _syncSite.external_id = getSitesExternalId(siteId, row.doc.external_id);
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
                                var districtId = undefined;
                                try {
                                    districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                } catch (error) {
                                    console.log('No district found !')
                                }
                                if (CanProcideInsertion(sync.host, siteId)) {
                                    if (!outPutInfo.hasOwnProperty("Zones")) outPutInfo["Zones"] = { error: 0, success: 0 };
                                    try {
                                        const _syncZone = new Zones();
                                        _syncZone.source = dataSource;
                                        _syncZone.id = row.doc._id;
                                        _syncZone.name = row.doc.name;
                                        _syncZone.external_id = row.doc.external_id;
                                        _syncZone.site = siteId;
                                        _syncZone.district = isNotNull(districtId) ? districtId : undefined;
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
                                    var districtId = undefined;
                                    try {
                                        districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                    } catch (error) {
                                        console.log('No district found !')
                                    }
                                    if (CanProcideInsertion(sync.host, siteId)) {
                                        if (!outPutInfo.hasOwnProperty("Famille")) outPutInfo["Famille"] = { error: 0, success: 0 }
                                        try {
                                            const _syncFamily = new Families();
                                            _syncFamily.source = dataSource;
                                            _syncFamily.id = row.doc._id;
                                            _syncFamily.name = row.doc.name;
                                            _syncFamily.external_id = row.doc.external_id;
                                            _syncFamily.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _syncFamily.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _syncFamily.zone = row.doc.parent._id;
                                            _syncFamily.site = siteId;
                                            _syncFamily.district = isNotNull(districtId) ? districtId : undefined;
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
                                        var districtId = undefined;
                                        try {
                                            districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                        } catch (error) {
                                            console.log('No district found !')
                                        }
                                        if (CanProcideInsertion(sync.host, siteId)) {
                                            if (!outPutInfo.hasOwnProperty("Patients")) outPutInfo["Patients"] = { error: 0, success: 0, }
                                            try {
                                                const _syncPatient = new Patients();
                                                _syncPatient.source = dataSource;
                                                _syncPatient.id = row.doc._id;
                                                _syncPatient.name = row.doc.name;
                                                _syncPatient.external_id = row.doc.external_id;
                                                _syncPatient.role = row.doc.role;
                                                _syncPatient.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                                _syncPatient.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                                _syncPatient.family = row.doc.parent._id;
                                                _syncPatient.zone = row.doc.parent.parent._id;
                                                _syncPatient.site = siteId;
                                                _syncPatient.district = isNotNull(districtId) ? districtId : undefined;
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
                                    var districtId = undefined;
                                    try {
                                        districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                    } catch (error) {
                                        console.log('No district found !')
                                    }
                                    if (CanProcideInsertion(sync.host, siteId)) {
                                        if (!outPutInfo.hasOwnProperty("Asc")) outPutInfo["Asc"] = { error: 0, success: 0 };
                                        try {
                                            const _syncChws = new Chws();
                                            _syncChws.source = dataSource;
                                            _syncChws.id = row.doc._id;
                                            _syncChws.name = row.doc.name;
                                            _syncChws.external_id = genarateChwsExternalId(sync.host, row.doc.external_id);
                                            _syncChws.role = row.doc.role;
                                            _syncChws.reported_date = Functions.milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _syncChws.reported_full_date = Functions.milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _syncChws.zone = row.doc.parent._id;
                                            _syncChws.site = siteId;
                                            _syncChws.district = isNotNull(districtId) ? districtId : undefined;
                                            await _repoChws.save(_syncChws);
                                            outPutInfo["Asc"]["success"] += 1;
                                        } catch (error: any) {
                                            outPutInfo["Asc"]["error"] += 1;
                                        }
                                    }
                                }
                            }
                        }

                        if (sync.use_SSL_verification !== true) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = undefined;
                        // if (done === len * 5) resp.status(200).json(outPutInfo);
                        resp.status(200).json(outPutInfo);
                    } catch (err: any) {
                        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = undefined;
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

    static updateChws = async (chwId:string, data:any) => {
        try {
            const _repoChws = await getChwsSyncRepository();
            const chwUpdated = await _repoChws.update({ id: chwId, }, data);
            return true;
        } catch (err: any) {
            return false;
        }
    }



    static updateUserFacilityIdAndContactPlace = async (req: Request, res: Response, next: NextFunction) => {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';
        const headers = {
            'Authorization': 'Basic ' + Buffer.from('medic:IntHea2004').toString('base64'),
            "Accept": "application/json",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "DELETE, POST, GET, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "X-API-KEY, Origin, X-Requested-With, Content-Type, Accept,Access-Control-Request-Method, Authorization,Access-Control-Allow-Headers",
            "Content-Type": "application/json",
            // 'Accept-Encoding': '*',
        }

        const req_params: ChwUserParams = req.body;

        request({
            url: `https://${req_params.host}/api/v1/users`,
            method: 'GET',
            headers: headers
        }, function (error: any, response: any, body: any) {
            if (error) return res.status(500).json({ status: 500, message: 'Error Found!' });

            const users = JSON.parse(body);

            for (let i = 0; i < users.length; i++) {
                const user = users[i];

                if (user.type == "chw") {
                    if (user.place._id === req_params.parent && user.contact._id === req_params.contact && user.contact.role === "chw") {

                        // start updating facility_id
                        return request({
                            url: `https://${req_params.host}/api/v1/users/${user.username}`,
                            method: 'POST',
                            body: JSON.stringify({ "place": req_params.new_parent }),
                            headers: headers
                        }, function (error: any, response: any, body: any) {
                            if (error) return res.status(500).json({ status: 500, message: 'Error Found!' });

                            request({
                                url: `https://${req_params.host}/medic/${req_params.contact}`,
                                method: 'GET',
                                headers: headers
                            }, function (error: any, response: any, body: any) {
                                if (error) return res.status(500).json({ status: 500, message: 'Error Found!' });
                                const data = JSON.parse(body);
                                data.parent._id = req_params.new_parent;

                                // start updating Contact Place Informations
                                request({
                                    url: `https://${req_params.host}/api/v1/people`,
                                    method: 'POST',
                                    body: JSON.stringify(data),
                                    headers: headers
                                }, async function (error: any, response: any, body: any) {
                                    if (error) return res.status(500).json({ status: 500, message: 'Error Found!' });

                                    const update = await SyncFromCouchDbController.updateChws(req_params.contact, {zone:req_params.new_parent});

                                    if (update) {
                                        return res.status(200).json({ status: 200, message: 'Fait avec succes!' });
                                    } else {
                                        return res.status(500).json({ status: 500, message: "Contacter immédiatement l'administrateur!" });
                                    }
                                });
                            });
                        });
                    }
                }
            }

        });
    }

}





