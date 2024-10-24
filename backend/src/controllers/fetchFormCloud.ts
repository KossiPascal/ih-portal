import { getChwsDataSyncRepository, ChwsData, getFamilySyncRepository, Families, Sites, getSiteSyncRepository, getPatientSyncRepository, Patients, getChwsSyncRepository, Chws, getZoneSyncRepository, Zones, Districts, getDistrictSyncRepository, getChwsDrugSyncRepository, ChwsDrug, getCouchDbUsersSyncRepository, CouchDbUsers } from "../entity/Sync";
import { CouchDbFetchData, Dhis2DataFormat } from "../utils/appInterface";
import { Dhis2SyncConfig, CouchDbFetchDataOptions, getChwsByDhis2Uid, getDataValuesAsMap, getSiteByDhis2Uid, getValue, sslFolder, httpHeaders, notEmpty, logNginx, getJsonFieldsAsKeyValue, getDhis2DrugValue } from "../utils/functions";
import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import https from 'https';
import { DataIndicators } from "../entity/DataAggragate";
import { milisecond_to_date, date_to_milisecond, YearMonthBetween21And20, changeMonthOfDate } from "../utils/date-utils";
import { Consts } from "../utils/constantes";

const fetch = require('node-fetch');
const request = require('request');
require('dotenv').config({ path: sslFolder('.ih-env') });

const { DHIS_HOST, CHT_PROD_HOST, CHT_DEV_HOST } = process.env;


const _sepation = `\n\n\n\n__________\n\n\n\n`;

export async function getDhis2Chws(req: Request, res: Response, next: NextFunction) {
    if (!validationResult(req).isEmpty()) {
        return res.status(201).json({ status: 201, data: 'Error when getting chws from dhis2' });
    }
    try {
        const enable_strict_SSL_checking = false;
        const { dhisusername, dhispassword } = req.body;
        const link = `https://${DHIS_HOST}/api/options`;
        const params = `.json?paging=false&filter=optionSet.id:eq:uOKgQa2W8tn&fields=id,code,name,optionSet&order=created:desc`;
        request({
            url: link + params,
            method: 'GET',
            headers: httpHeaders(dhisusername, dhispassword),
            strictSSL: enable_strict_SSL_checking,
        }, async function (err: any, response: any, body: any) {
            if (err) return res.status(201).json({ status: 201, data: 'Error when getting chws from dhis2' });
            const jsonBody = JSON.parse(body);
            if (jsonBody && jsonBody.hasOwnProperty('options')) return res.status(200).json({ status: 200, data: jsonBody["options"] });
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
    const _repoChwsDrug = await getChwsDrugSyncRepository();
    const _repoSite = await getSiteSyncRepository();
    req.body['host'] = DHIS_HOST;
    req.body['cibleName'] = 'events';
    req.body['program'] = 'siupB4uk4O2';

    const dhis2Sync = new Dhis2SyncConfig(req.body);

    var siteName = (await _repoSite.findOneBy({ external_id: req.body.orgUnit }))?.name;

    await fetch(dhis2Sync.url, dhis2Sync.fecthOptions())
        .then((response: any) => response.json())
        .then(async (jsonDatas: any) => {
            try {
                var jsonBody: Dhis2DataFormat[] = jsonDatas["events"] as Dhis2DataFormat[];

                if (notEmpty(jsonBody)) {
                    var len = jsonBody.length;
                    var done: number = 0;
                    for (let i = 0; i < len; i++) {
                        done++;
                        const row: Dhis2DataFormat = jsonBody[i];
                        if (notEmpty(row)) {
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
                                if (districtId && notEmpty(siteId) && notEmpty(chwsId) && notEmpty(dateVal)) {
                                    if (outPutInfo && !outPutInfo.hasOwnProperty(`Données Total ${siteName}`)) outPutInfo[`Données Total ${siteName}`] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' }
                                    try {
                                        const _dhis2Sync = new ChwsData();
                                        const reported_date = milisecond_to_date(dateVal, 'dateOnly');

                                        // #####################################

                                        // const _syncDrug = new ChwsDrug();
                                        // const _report_year = (new Date(reported_date)).getFullYear();
                                        // const _moth = (new Date(reported_date)).getMonth() + 1;

                                        // // annee et mois selon 21 au 20 à implementer

                                        // const _report_moth = `${_moth < 10 ? '0'+_moth : _moth}`;

                                        // _syncDrug.source = 'dhis2';
                                        // _syncDrug.id = row.event;
                                        // _syncDrug.rev = row.event;

                                        // _syncDrug.form = row.event
                                        // _syncDrug.year = _report_year;
                                        // _syncDrug.month = _report_moth;
                                        // _syncDrug.activity_type = row.event

                                        // _syncDrug.lumartem = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.alben_400 = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.amox_250 = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.amox_500 = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.pills = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.para_250 = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.para_500 = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.pregnancy_test = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.sayana = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.sro = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.tdr = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.vit_A1 = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.vit_A2 = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.zinc = getDhis2DrugValue(row.dataValues, '');
                                        // _syncDrug.other_drug = getDhis2DrugValue(row.dataValues, '');
                                        // await _repoChwsDrug.save(_syncDrug);

                                        // #################################################
                                        

                                        _dhis2Sync.source = 'dhis2';
                                        _dhis2Sync.id = row.event;
                                        _dhis2Sync.rev = row.event;
                                        _dhis2Sync.form = getValue(row.dataValues, 'plW6bCSnXKU');
                                        _dhis2Sync.reported_date = reported_date;
                                        _dhis2Sync.district = districtId;
                                        _dhis2Sync.site = siteId;
                                        _dhis2Sync.chw = chwsId;
                                        _dhis2Sync.fields = getDataValuesAsMap(row.dataValues, ['JkMyqI3e6or', 'plW6bCSnXKU', 'RlquY86kI66', 'JC752xYegbJ', 'qZKDFwp706E']);
                                        await repository.save(_dhis2Sync);
                                        outPutInfo[`Données Total ${siteName}`]["successCount"] += 1;
                                    } catch (error: any) {
                                        outPutInfo[`Données Total ${siteName}`]["errorCount"] += 1;
                                        outPutInfo[`Données Total ${siteName}`]["errorElements"] += `${_sepation}${error.toString()}`;
                                        outPutInfo[`Données Total ${siteName}`]["errorIds"] += `${_sepation}${row.event}`;
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

}

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
        startKey: [date_to_milisecond(req.body.start_date, true)],
        endKey: [date_to_milisecond(req.body.end_date, false)],
    };

    try {
        https.get(CouchDbFetchDataOptions(params), async function (res) {
            var body = "";
            res.on('data', (data) => {
                body += data.toString();
            });
            res.on('end', async () => {
                try {
                    const _repoChwsData = await getChwsDataSyncRepository();
                    const _repoChwsDrug = await getChwsDrugSyncRepository();
                    const _repoSite = await getSiteSyncRepository();

                    var jsonBody: any = JSON.parse(body).rows;
                    if (jsonBody !== undefined && jsonBody !== '' && jsonBody !== null) {
                        var len = jsonBody.length;
                        var done: number = 0;

                        for (let i = 0; i < len; i++) {
                            done++;
                            const row: any = jsonBody[i];
                            if (row.doc && row.doc.hasOwnProperty('form') && row.doc.hasOwnProperty('fields')) {
                                const _syncDrug = new ChwsDrug();
                                var districtId = undefined;
                                var siteId = undefined;

                                try {
                                    siteId = row.doc.contact.parent.parent._id;
                                    districtId = (await _repoSite.findOneBy({ id: siteId }))?.district;
                                } catch (error) {
                                    // console.log('No district found !')
                                }

                                if (["drug_quantities", "drug_movements", "pregnancy_family_planning", "fp_follow_up_renewal", "pcime_c_asc"].includes(row.doc.form)) {
                                    const reported_date = milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                    const _report_year = (new Date(reported_date)).getFullYear();

                                    _syncDrug.source = 'Tonoudayo';
                                    _syncDrug.id = row.doc._id;
                                    _syncDrug.rev = row.doc._rev;
                                    _syncDrug.form = row.doc.form;
                                    _syncDrug.reported_date = reported_date;
                                    _syncDrug.reported_full_date = milisecond_to_date(row.doc.reported_date, 'fulldate');

                                    if (["drug_quantities", "drug_movements"].includes(row.doc.form)) {
                                        var qtyMvt;
                                        if (row.doc.form == "drug_quantities" && row.doc.fields.hasOwnProperty("h_drug_quantities") && row.doc.fields.hasOwnProperty("b_drug_quantities")) {
                                            const _isPreviousYear = row.doc.fields.h_drug_quantities.med_year_type == 'previous';

                                            _syncDrug.year = _isPreviousYear == true ? _report_year - 1 : _report_year;
                                            _syncDrug.month = row.doc.fields.h_drug_quantities.med_month;
                                            _syncDrug.activity_type = row.doc.fields.h_drug_quantities.med_operation;
                                            qtyMvt = row.doc.fields.b_drug_quantities;
                                        }

                                        if (row.doc.form == "drug_movements" && row.doc.fields.hasOwnProperty("h_drug_movements") && row.doc.fields.hasOwnProperty("b_drug_movements")) {
                                            const _isPreviousYear = row.doc.fields.h_drug_movements.med_year_type == 'previous';

                                            _syncDrug.year = _isPreviousYear == true ? _report_year - 1 : _report_year;;
                                            _syncDrug.month = row.doc.fields.h_drug_movements.med_month;

                                            const mvType = row.doc.fields.h_drug_movements.med_type;
                                            _syncDrug.activity_type = mvType;
                                            qtyMvt = row.doc.fields.b_drug_movements;

                                            if (mvType == 'c_med_loan') {
                                                _syncDrug.lending_chws_info = row.doc.fields.h_drug_movements.med_chw_destination;
                                            }

                                            if (mvType == 'c_med_borrowing') {
                                                _syncDrug.borrowing_chws_info = row.doc.fields.h_drug_movements.med_chw_destination;
                                            }

                                            _syncDrug.comments = qtyMvt.med_comment;
                                        }

                                        if (notEmpty(qtyMvt)) {
                                            _syncDrug.lumartem = notEmpty(qtyMvt.lumartem) ? parseInt(qtyMvt.lumartem) : undefined;
                                            _syncDrug.alben_400 = notEmpty(qtyMvt.alben_400) ? parseInt(qtyMvt.alben_400) : undefined;
                                            _syncDrug.amox_250 = notEmpty(qtyMvt.amox_250) ? parseInt(qtyMvt.amox_250) : undefined;
                                            _syncDrug.amox_500 = notEmpty(qtyMvt.amox_500) ? parseInt(qtyMvt.amox_500) : undefined;
                                            _syncDrug.pills = notEmpty(qtyMvt.pills) ? parseInt(qtyMvt.pills) : undefined;
                                            _syncDrug.para_250 = notEmpty(qtyMvt.para_250) ? parseInt(qtyMvt.para_250) : undefined;
                                            _syncDrug.para_500 = notEmpty(qtyMvt.para_500) ? parseInt(qtyMvt.para_500) : undefined;
                                            _syncDrug.pregnancy_test = notEmpty(qtyMvt.pregnancy_test) ? parseInt(qtyMvt.pregnancy_test) : undefined;
                                            _syncDrug.sayana = notEmpty(qtyMvt.sayana) ? parseInt(qtyMvt.sayana) : undefined;
                                            _syncDrug.sro = notEmpty(qtyMvt.sro) ? parseInt(qtyMvt.sro) : undefined;
                                            _syncDrug.tdr = notEmpty(qtyMvt.tdr) ? parseInt(qtyMvt.tdr) : undefined;
                                            _syncDrug.vit_A1 = notEmpty(qtyMvt.vit_A1) ? parseInt(qtyMvt.vit_A1) : undefined;
                                            _syncDrug.vit_A2 = notEmpty(qtyMvt.vit_A2) ? parseInt(qtyMvt.vit_A2) : undefined;
                                            _syncDrug.zinc = notEmpty(qtyMvt.zinc) ? parseInt(qtyMvt.zinc) : undefined;
                                            _syncDrug.other_drug = notEmpty(qtyMvt.other_drug) ? parseInt(qtyMvt.other_drug) : undefined;
                                        }

                                    }
                                }

                                if (row.doc.fields.hasOwnProperty('patient_id')) {

                                    if (districtId && siteId) {
                                        if (!outPutInfo.hasOwnProperty("Données Total")) outPutInfo["Données Total"] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' }
                                        try {
                                            const contactParent = row.doc.fields.inputs.contact.parent;
                                            const contactId = row.doc.fields.inputs.contact._id;
                                            const _sync = new ChwsData();

                                            _sync.source = 'Tonoudayo';
                                            _sync.id = row.doc._id;
                                            _sync.rev = row.doc._rev;
                                            _sync.form = row.doc.form;
                                            _sync.phone = row.doc.from;
                                            _sync.reported_date = milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _sync.reported_full_date = milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _sync.district = districtId;
                                            _sync.site = siteId;
                                            _sync.zone = row.doc.contact.parent._id;
                                            _sync.chw = row.doc.contact._id;
                                            _sync.family_id = ['home_visit'].includes(row.doc.form) ? contactId : contactParent;
                                            _sync.patient_id = ['home_visit'].includes(row.doc.form) ? null : contactId;
                                            _sync.fields = getJsonFieldsAsKeyValue('', row.doc.fields);
                                            // _sync.patient_id = row.doc.fields.patient_id;
                                            if (!row.doc.geolocation.hasOwnProperty('code')) _sync.geolocation = getJsonFieldsAsKeyValue('', row.doc.geolocation);
                                            await _repoChwsData.save(_sync);


                                            // #############################################################


                                            if (["pregnancy_family_planning", "fp_follow_up_renewal", "pcime_c_asc"].includes(row.doc.form)) {
                                                _syncDrug.activity_type = "distributed";
                                                const _date = milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                                const yM = YearMonthBetween21And20(_date);
                                                _syncDrug.year = yM.year;
                                                _syncDrug.month = yM.month;

                                                if (row.doc.form == "pcime_c_asc") {
                                                    if (row.doc.fields.hasOwnProperty("s_fever_child_TDR")) {
                                                        if (notEmpty(row.doc.fields.s_fever_child_TDR.s_fever_child_TDR_result)) _syncDrug.tdr = 1;
                                                    }

                                                    if (row.doc.fields.hasOwnProperty("s_drug_administered")) {
                                                        const dAdm = row.doc.fields.s_drug_administered;
                                                        if (notEmpty(dAdm["c_albendazole_400_given"])) _syncDrug.alben_400 = dAdm["c_albendazole_400_given"];
                                                        if (notEmpty(dAdm["c_amoxicilline_250_given"])) _syncDrug.amox_250 = dAdm["c_amoxicilline_250_given"];
                                                        if (notEmpty(dAdm["c_amoxicilline_500_given"])) _syncDrug.amox_500 = dAdm["c_amoxicilline_500_given"];
                                                        if (notEmpty(dAdm["c_paracetamol_250_given"])) _syncDrug.para_250 = dAdm["c_paracetamol_250_given"];
                                                        if (notEmpty(dAdm["c_paracetamol_500_given"])) _syncDrug.para_500 = dAdm["c_paracetamol_500_given"];
                                                        if (notEmpty(dAdm["s_zinc_given"])) _syncDrug.zinc = dAdm["s_zinc_given"];
                                                        if (notEmpty(dAdm["s_ors_given"])) _syncDrug.sro = dAdm["s_ors_given"];
                                                        if (notEmpty(dAdm["s_lumartem_given"])) _syncDrug.lumartem = dAdm["s_lumartem_given"];
                                                        if (notEmpty(dAdm["s_vitamine_A1_given"])) _syncDrug.vit_A1 = dAdm["s_vitamine_A1_given"];
                                                        if (notEmpty(dAdm["s_vitamine_A2_given"])) _syncDrug.vit_A2 = dAdm["s_vitamine_A2_given"];
                                                        if (notEmpty(dAdm["s_other_drug_given"])) _syncDrug.other_drug = dAdm["s_other_drug_given"];
                                                    }
                                                }

                                                if (row.doc.form == "pregnancy_family_planning") {
                                                    if (row.doc.fields.hasOwnProperty("s_reg_pregnancy_screen")) {
                                                        if (row.doc.fields.s_reg_pregnancy_screen.s_reg_urine_test == "yes") _syncDrug.pregnancy_test = 1;
                                                    }
                                                    if (row.doc.fields.chosen_fp_method == 'oral_combination_pill') _syncDrug.pills = 1;
                                                    if (row.doc.fields.chosen_fp_method == 'injectible') _syncDrug.sayana = 1;
                                                }

                                                if (row.doc.form == "fp_follow_up_renewal") {
                                                    if (row.doc.fields.fp_method == 'oral_combination_pill') _syncDrug.pills = 1;
                                                    if (row.doc.fields.fp_method == 'injectible') _syncDrug.sayana = 1;
                                                }

                                            }

                                            outPutInfo["Données Total"]["successCount"] += 1;
                                        } catch (err: any) {
                                            outPutInfo["Données Total"]["errorCount"] += 1;
                                            outPutInfo["Données Total"]["errorElements"] += `${_sepation}${err.toString()}`;
                                            outPutInfo["Données Total"]["errorIds"] += `${_sepation}${row.doc._id}`;

                                            // outPutInfo["ErrorMsg"] = {}
                                            // outPutInfo["ErrorMsg"]["error"] = err.toString()
                                        }
                                    }
                                }


                                if (["drug_quantities", "drug_movements", "pregnancy_family_planning", "fp_follow_up_renewal", "pcime_c_asc"].includes(row.doc.form)) {
                                    if (districtId && siteId) {
                                        _syncDrug.district = districtId;
                                        _syncDrug.site = siteId;
                                        _syncDrug.chw = row.doc.contact._id;
                                        _syncDrug.zone = row.doc.contact.parent._id;
                                        await _repoChwsDrug.save(_syncDrug);
                                    }
                                }
                            }
                        }

                        if (done === len) return resp.status(200).json(outPutInfo);
                    } else {
                        return resp.status(200).json(outPutInfo);
                    }
                } catch (err: any) {
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

export async function fetchCouchDbUsersFromCouchDb(req: Request, res: Response, next: NextFunction) {
    // const req_params: ChwUserParams = req.body;  
    const enable_strict_SSL_checking = false;

    request({
        url: `https://${Consts.isProdEnv ? CHT_PROD_HOST : CHT_DEV_HOST}/api/v1/users`,
        method: 'GET',
        headers: httpHeaders(),
        strictSSL: enable_strict_SSL_checking,
    }, async function (error: any, response: any, body: any) {
        if (error) return res.status(201).json({ status: 201, message: 'Error Found!' });
        try {
            const users = JSON.parse(body);
            const _repo = await getCouchDbUsersSyncRepository();
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                if (user.contact?._id && user.place?._id) {
                    const _sync = new CouchDbUsers();
                    _sync.id = user.id;
                    _sync.rev = user.rev;
                    _sync.username = user.username;
                    _sync.fullname = user.contact.name;
                    _sync.code = user.contact.external_id;
                    _sync.type = user.type;
                    _sync.contact = user.contact._id;
                    _sync.role = user.contact.role;
                    _sync.place = user.place._id;
                    await _repo.save(_sync);
                }
            }
            const couchUsers = await _repo.find();
            if (couchUsers.length <= 0) return res.status(201).json({ status: 201, data: "Pas d'utilisateur couchDb trouvé" });
            return res.status(200).json({ status: 200, data: couchUsers });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: err.toString() });
        }

    });
}

export async function getChtUsersFromDb(req: Request, res: Response, next: NextFunction) {
    try {
        const _repo = await getCouchDbUsersSyncRepository();
        const users = await _repo.find();
        if (users.length <= 0) return res.status(201).json({ status: 201, data: "Pas d'utilisateur couchDb trouvé" });
        return res.status(200).json({ status: 200, data: users });
    } catch (err: any) {
        return res.status(500).json({ status: 500, data: err.toString() });
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
        viewName: 'contacts_by_date', //'contacts_by_type',
        startKey: [date_to_milisecond(req.body.start_date, true)],
        endKey: [date_to_milisecond(req.body.end_date, false)],
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
                                                if (notEmpty(districtId) && notEmpty(districtName)) {
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
                                                    outPutInfo["Districts"]["errorElements"] += `${_sepation}${err.toString()}`;
                                                    outPutInfo["Districts"]["errorIds"] += `${_sepation}${districtId}`;
                                                }
                                            }
                                        }
                                        _syncSite.source = dataSource;
                                        _syncSite.id = siteId;
                                        _syncSite.rev = row.doc._rev;
                                        _syncSite.name = row.doc.name;
                                        _syncSite.external_id = row.doc.external_id;
                                        _syncSite.reported_date = milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                        _syncSite.reported_full_date = milisecond_to_date(row.doc.reported_date, 'fulldate');
                                        await _repoSite.save(_syncSite);
                                        outPutInfo["Sites"]["successCount"] += 1;
                                    } catch (err: any) {
                                        outPutInfo["Sites"]["errorCount"] += 1;
                                        outPutInfo["Sites"]["errorElements"] += `${_sepation}${err.toString()}`;
                                        outPutInfo["Sites"]["errorIds"] += `${_sepation}${siteId}`;
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
                                        _syncZone.reported_date = milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                        _syncZone.reported_full_date = milisecond_to_date(row.doc.reported_date, 'fulldate');
                                        await _repoZone.save(_syncZone);
                                        outPutInfo["Zones"]["successCount"] += 1;
                                    } catch (err: any) {
                                        outPutInfo["Zones"]["errorCount"] += 1;
                                        outPutInfo["Zones"]["errorElements"] += `${_sepation}${err.toString()}`;
                                        outPutInfo["Zones"]["errorIds"] += `${_sepation}${row.doc._id}`;
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
                                            _syncFamily.reported_date = milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _syncFamily.reported_full_date = milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _syncFamily.district = districtId;
                                            _syncFamily.site = siteId;
                                            _syncFamily.zone = row.doc.parent._id;
                                            await _repoFamily.save(_syncFamily);
                                            outPutInfo["Familles"]["successCount"] += 1;
                                        } catch (err: any) {
                                            outPutInfo["Familles"]["errorCount"] += 1;
                                            outPutInfo["Familles"]["errorElements"] += `${_sepation}${err.toString()}`;
                                            outPutInfo["Familles"]["errorIds"] += `${_sepation}${row.doc._id}`;
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
                                                const sx = row.doc.sex;
                                                _syncPatient.source = dataSource;
                                                _syncPatient.id = row.doc._id;
                                                _syncPatient.rev = row.doc._rev;
                                                _syncPatient.name = row.doc.name;
                                                _syncPatient.external_id = row.doc.external_id;
                                                _syncPatient.role = row.doc.role;
                                                _syncPatient.date_of_birth = row.doc.date_of_birth;
                                                _syncPatient.sex = sx == 'male' ? 'M' : sx == 'female' ? 'F' : undefined;
                                                _syncPatient.reported_date = milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                                _syncPatient.reported_full_date = milisecond_to_date(row.doc.reported_date, 'fulldate');
                                                _syncPatient.district = districtId;
                                                _syncPatient.site = siteId;
                                                _syncPatient.zone = row.doc.parent.parent._id;
                                                _syncPatient.family = row.doc.parent._id;
                                                await _repoPatient.save(_syncPatient);
                                                outPutInfo["Patients"]["successCount"] += 1;
                                            } catch (err: any) {
                                                outPutInfo["Patients"]["errorCount"] += 1;;
                                                outPutInfo["Patients"]["errorElements"] += `${_sepation}${err.toString()}`;
                                                outPutInfo["Patients"]["errorIds"] += `${_sepation}${row.doc._id}`;
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
                                        if (outPutInfo && !outPutInfo.hasOwnProperty("Asc")) outPutInfo["Asc"] = { successCount: 0, errorCount: 0, errorElements: '', errorIds: '' };
                                        try {
                                            const _syncChws = new Chws();
                                            _syncChws.source = dataSource;
                                            _syncChws.id = row.doc._id;
                                            _syncChws.rev = row.doc._rev;
                                            _syncChws.name = row.doc.name;
                                            _syncChws.external_id = row.doc.external_id;
                                            _syncChws.role = row.doc.role;
                                            _syncChws.reported_date = milisecond_to_date(row.doc.reported_date, 'dateOnly');
                                            _syncChws.reported_full_date = milisecond_to_date(row.doc.reported_date, 'fulldate');
                                            _syncChws.district = districtId;
                                            _syncChws.site = siteId;
                                            _syncChws.zone = row.doc.parent._id;
                                            await _repoChws.save(_syncChws);
                                            outPutInfo["Asc"]["successCount"] += 1;
                                        } catch (err: any) {
                                            outPutInfo["Asc"]["errorCount"] += 1;
                                            outPutInfo["Asc"]["errorElements"] += `${_sepation}${err.toString()}`;
                                            outPutInfo["Asc"]["errorIds"] += `${_sepation}${row.doc._id}`;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (done === len * outDoneLenght) resp.status(200).json(outPutInfo);
                    // resp.status(200).json(outPutInfo);
                } catch (err: any) {
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
    const { dhisusername, dhispassword, chwsDataToDhis2 } = req.body;
    const chwsData = chwsDataToDhis2 as DataIndicators;

    try {
        if (notEmpty(chwsData)) {
            var jsonData = matchDhis2Data(chwsData);
            const date = getValue(jsonData["dataValues"], "lbHrQBTbY1d");  // reported_date
            const srce = getValue(jsonData["dataValues"], "FW6z2Ha2GNr");  // data_source
            const dist = getValue(jsonData["dataValues"], "JC752xYegbJ");  // district
            const chw = getValue(jsonData["dataValues"], "JkMyqI3e6or");  // code_asc
            const sit = jsonData['orgUnit'];
            const program = jsonData['program'];
            const data_filter = "JC752xYegbJ:EQ:" + dist + ",JkMyqI3e6or:like:" + chw + ",lbHrQBTbY1d:EQ:" + date + ",FW6z2Ha2GNr:like:" + srce;
            const fields = "event,eventDate,dataValues[dataElement, value]";
            const headers = httpHeaders(dhisusername, dhispassword);
            const link = `https://${DHIS_HOST}/api/events`;
            const params = `.json?paging=false&program=${program}&orgUnit=${sit}&filter=${data_filter}&fields=${fields}&order=created:desc`;
            const enable_strict_SSL_checking = false;

            await request({
                url: link + params,
                method: 'GET',
                headers: headers,
                strictSSL: enable_strict_SSL_checking,
            }, async function (err: any, response1: any, body: any) {
                if (err) return res.status(201).json({ status: 201, data: err.toString(), chw: chw });
                try {
                    const jsonBody = JSON.parse(body);
                    if (jsonBody && jsonBody.hasOwnProperty('events')) {
                        var reqData: Dhis2DataFormat[] = jsonBody["events"] as Dhis2DataFormat[];
                        const dataId = reqData.length == 1 ? reqData[0].event : ''

                        await request({
                            url: reqData.length == 1 ? `${link}/${dataId}` : link,
                            cache: 'no-cache',
                            mode: "cors",
                            credentials: "include",
                            referrerPolicy: 'no-referrer',
                            method: reqData.length == 1 ? 'PUT' : 'POST',
                            body: JSON.stringify(jsonData),
                            headers: headers,
                            strictSSL: enable_strict_SSL_checking,
                        }, async function (err: any, response2: any, body: any) {
                            if (err) return res.status(201).json({ status: 201, data: err.toString(), chw: chw });
                            if (response2.statusCode != 200) return res.status(201).json({ status: 201, data: `Error Found, retry!`, chw: chw })
                            return res.status(200).json({ status: 200, data: reqData.length == 1 ? `Updated` : `Created` })
                        });

                    } else {
                        return res.status(201).json({ status: 201, data: 'Connection Error! Retry', chw: chw });
                    }
                } catch (error) {
                    logNginx(error)
                }
            });
        } else {
            return res.status(201).json({ status: 201, data: 'No Data Available!', chw: '' });
        }
    } catch (err: any) {
        console.log(err);
        return res.status(201).json({ status: 201, data: err.toString(), chw: '' });
    }
}

export function matchDhis2Data(datas: DataIndicators) {

    var dataValues = [
        {
            "dataElement": "FW6z2Ha2GNr",  // source de données
            "value": datas.data_source,
        },
        {
            "dataElement": "lbHrQBTbY1d",  // report_date
            "value": datas.reported_date,
        },
        {
            "dataElement": "JkMyqI3e6or",  // list des ASC
            "value": datas.code_asc,
        },
        {
            "dataElement": "JC752xYegbJ",  // admin_org_unit_district
            "value": datas.district,
        },
        {
            "dataElement": "lvW5Kj1cisa", // "Nombre d'enfant 0 à 5 ans pris en charge à domicile
            "value": datas.data_source == 'thinkmd' ? datas.sum_soins_suivi : datas.sum_soins_suivi.tonoudayo,
        },
        {
            "dataElement": "M6WRPsREqsZ",  // "Total Vad PCIME Suivi
            "value": datas.data_source == 'thinkmd' ? datas.suivi_pcime : datas.suivi_pcime.tonoudayo,
        },
        {
            "dataElement": "oeDKJi4BICh",  // total_vad
            "value": datas.data_source == 'thinkmd' ? datas.total_vad : datas.total_vad.tonoudayo,
        },
        {
            "dataElement": "PrN89trdUGm", // "Nombre de femme enceinte nouveau cas
            "value": datas.data_source == 'thinkmd' ? datas.femmes_enceintes_NC : datas.femmes_enceintes_NC.tonoudayo,
        },
        {
            "dataElement": "wdg7jjP9ZRg", // "Nombre de femmes référée pour plannification familiale
            "value": datas.data_source == 'thinkmd' ? datas.reference_pf : datas.reference_pf.tonoudayo,
        },
        {
            "dataElement": "qNxNXSwDAaI", // "promptitude diarrhée 24h
            "value": datas.data_source == 'thinkmd' ? datas.prompt_pcime_diarrhee_24h : datas.prompt_pcime_diarrhee_24h.tonoudayo,
        },
        {
            "dataElement": "S1zPDVOIVLZ",  // "promptitude diarrhee 48h
            "value": datas.data_source == 'thinkmd' ? datas.prompt_pcime_diarrhee_48h : datas.prompt_pcime_diarrhee_48h.tonoudayo,
        },
        {
            "dataElement": "nW3O5ULr75J", // "promptitude diarrhée 72h
            "value": datas.data_source == 'thinkmd' ? datas.prompt_pcime_diarrhee_72h : datas.prompt_pcime_diarrhee_72h.tonoudayo,
        },
        {
            "dataElement": "NUpARMZ383s", // "promptitude paludisme 24h
            "value": datas.data_source == 'thinkmd' ? datas.prompt_pcime_paludisme_24h : datas.prompt_pcime_paludisme_24h.tonoudayo,
        },
        {
            "dataElement": "yQa48SF9bua", // "promptitude paludisme 48h
            "value": datas.data_source == 'thinkmd' ? datas.prompt_pcime_paludisme_48h : datas.prompt_pcime_paludisme_48h.tonoudayo,
        },
        {
            "dataElement": "NzKjJuAniNx", // "promptitude paludisme 72h
            "value": datas.data_source == 'thinkmd' ? datas.prompt_pcime_paludisme_72h : datas.prompt_pcime_paludisme_72h.tonoudayo,
        },
        {
            "dataElement": "AA2We0Ao5sv", // "promptitude pneumonie 24h
            "value": datas.data_source == 'thinkmd' ? datas.prompt_pcime_pneumonie_24h : datas.prompt_pcime_pneumonie_24h.tonoudayo,
        },
        {
            "dataElement": "PYwikai4k2J", // "promptitude pneumonie 48h
            "value": datas.data_source == 'thinkmd' ? datas.prompt_pcime_pneumonie_48h : datas.prompt_pcime_pneumonie_48h.tonoudayo,
        },
        {
            "dataElement": "rgjFO0bDVUL", // "promptitude pneumonie 72h
            "value": datas.data_source == 'thinkmd' ? datas.prompt_pcime_pneumonie_72h : datas.prompt_pcime_pneumonie_72h.tonoudayo,
        },
        {
            "dataElement": "WR9u3cGJn9W", // "total consultation femme enceinte
            "value": datas.data_source == 'thinkmd' ? datas.femmes_enceinte : datas.femmes_enceinte.tonoudayo,
        },
        {
            "dataElement": "Pl6qRNgjd3a", // "total de femmes référées par les asc
            "value": datas.data_source == 'thinkmd' ? datas.reference_femmes_enceinte_postpartum : datas.reference_femmes_enceinte_postpartum.tonoudayo,
        },
        {
            "dataElement": "DicYcTqr9xT", // "Total de référence pcime
            "value": datas.data_source == 'thinkmd' ? datas.reference_pcime : datas.reference_pcime.tonoudayo,
        },
        {
            "dataElement": "caef2rf638P", // "total diarrhee pcime
            "value": datas.data_source == 'thinkmd' ? datas.diarrhee_pcime : datas.diarrhee_pcime.tonoudayo,
        },
        {
            "dataElement": "Q0BQtUdJOCy", // "Total femmes en postpartum
            "value": datas.data_source == 'thinkmd' ? datas.femmes_postpartum : datas.femmes_postpartum.tonoudayo,
        },
        {
            "dataElement": "dLYksBMOqST", // "total malnutrition pcime
            "value": datas.data_source == 'thinkmd' ? datas.malnutrition_pcime : datas.malnutrition_pcime.tonoudayo,
        },
        {
            "dataElement": "jp2i3vN3VJk", // "total paludisme pcime
            "value": datas.data_source == 'thinkmd' ? datas.paludisme_pcime : datas.paludisme_pcime.tonoudayo,
        },
        {
            "dataElement": "LZ3R8fj9CGG", // "total pneumonie pcime
            "value": datas.data_source == 'thinkmd' ? datas.pneumonie_pcime : datas.pneumonie_pcime.tonoudayo,
        },
        {
            "dataElement": "O9EZVn3C3pF", // "Total postpartum nouveau cas
            "value": datas.data_source == 'thinkmd' ? datas.femme_postpartum_NC : datas.femme_postpartum_NC.tonoudayo,
        },
        {
            "dataElement": "lsBS60uQPtc", // "Total recherche active
            "value": datas.data_source == 'thinkmd' ? datas.home_visit : datas.home_visit.tonoudayo,
        },
        {
            "dataElement": "lopdYxQrgyj", // "Total test de grossesse administrée
            "value": datas.data_source == 'thinkmd' ? datas.test_de_grossesse : datas.test_de_grossesse.tonoudayo,
        },
        {
            "dataElement": "AzwUzgh0nd7",  // "Total Vad Pf
            "value": datas.data_source == 'thinkmd' ? datas.pf : datas.pf.tonoudayo,
        }
    ]

    return {
        "program": "aaw8nwnmmcC",
        "orgUnit": datas.orgUnit,  // "PgoyKuRs20z",
        "eventDate": datas.reported_date + "T00:00:00.000",  // "2021-05-07T00:00:00.000",
        "status": "COMPLETED",
        "completedDate": datas.reported_date + "T00:00:00.000",  // "2021-05-07T00:00:00.000",
        "dataValues": dataValues
    };
}

