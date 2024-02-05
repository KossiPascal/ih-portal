import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import { Between, In } from "typeorm";
import { ChtOutPutData, DataIndicators } from "../entity/DataAggragate";
import { getChwsDataSyncRepository, ChwsData, Chws, getFamilySyncRepository, Families, getChwsSyncRepository, ChwsDrug, getChwsDrugSyncRepository, getChwsDrugUpdateSyncRepository, ChwsDrugUpdate, GetPersonsRepository, Persons, Teams, GetTeamsRepository, MeetingReportData, GetMeetingReportDataRepository } from "../entity/Sync";
import { Consts } from "../utils/constantes";
import { notEmpty, previousMonth } from "../utils/functions";
import { getChws } from "./orgUnitsFromDB ";
import { ChwsDrugData, ChwsDrugQantityInfo } from "../utils/appInterface";
import { getDateInFormat, isBetween } from "../utils/date-utils";

const request = require('request');
// const fetch = require('node-fetch');

const MEG_FORMS: string[] = ["drug_movements", "drug_quantities", "pcime_c_asc", "pregnancy_family_planning", "fp_follow_up_renewal"];

export async function GetPersonsDataWithParams(req: Request, res: Response, next: NextFunction, onlyData: boolean = false): Promise<any> {
  var respData: { status: number, data: any };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    respData = { status: 201, data: 'Informations you provided are not valid' }
    return onlyData ? respData : res.status(201).json(respData);
  }
  const errorMsg: string = "Your request provides was rejected !";
  try {
    const repository = await GetPersonsRepository();
    var allSync: Persons[] = await repository.findBy({
      id: notEmpty(req.body.id) ? req.body.id : undefined,
    });
    respData = !allSync ? { status: 201, data: 'Not data found with parametter!' } : { status: 200, data: allSync }
  }
  catch (err) {
    // return next(err);
    respData = { status: 201, data: errorMsg };
  }
  return onlyData ? respData : res.status(respData.status).json(respData);
}

export async function GetTeamsDataWithParams(req: Request, res: Response, next: NextFunction, onlyData: boolean = false): Promise<any> {
  var respData: { status: number, data: any };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    respData = { status: 201, data: 'Informations you provided are not valid' }
    return onlyData ? respData : res.status(201).json(respData);
  }
  const errorMsg: string = "Your request provides was rejected !";
  try {
    const repository = await GetTeamsRepository();
    var allSync: Teams[] = await repository.find({
      where: {
        id: notEmpty(req.body.id) ? req.body.id : undefined,
      }
    });
    respData = !allSync ? { status: 201, data: 'Not data found with parametter!' } : { status: 200, data: allSync }
  }
  catch (err) {
    // return next(err);
    respData = { status: 201, data: errorMsg };
  }
  return onlyData ? respData : res.status(respData.status).json(respData);
}

export async function getChwsDataWithParams(req: Request, res: Response, next: NextFunction, onlyData: boolean = false): Promise<any> {
  var respData: { status: number, data: any };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    respData = { status: 201, data: 'Informations you provided are not valid' }
    return onlyData ? respData : res.status(201).json(respData);
  }
  const errorMsg: string = "Your request provides was rejected !";
  try {
    const repository = await getChwsDataSyncRepository();

    var allSync: ChwsData[] = await repository.find({
      where: {
        id: notEmpty(req.body.id) ? req.body.id : notEmpty(req.params.id) ? req.params.id : undefined,
        reported_date: notEmpty(req.body.start_date) && notEmpty(req.body.end_date) ? Between(req.body.start_date, req.body.end_date) : undefined,
        form: notEmpty(req.body.forms) ? In(req.body.forms) : undefined,
        source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
        district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
        site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
        zone: notEmpty(req.body.zones) ? { id: In(req.body.zones) } : undefined,
        chw: notEmpty(req.body.chws) ? { id: In(req.body.chws) } : undefined
      }
    });
    respData = !allSync ? { status: 201, data: 'Not data found with parametter!' } : { status: 200, data: allSync }
  }
  catch (err) {
    // return next(err);
    respData = { status: 201, data: errorMsg };
  }
  return onlyData ? respData : res.status(respData.status).json(respData);
}

export async function getChwsDrugWithParams(req: any, res: Response, next: NextFunction, onlyData: boolean = false): Promise<any> {
  var respData: { status: number, data: any };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    respData = { status: 201, data: 'Informations you provided are not valid' }
    return onlyData ? respData : res.status(201).json(respData);
  }
  const errorMsg: string = "Your request provides was rejected !";
  try {
    const repository = await getChwsDrugSyncRepository();
    var allSync: ChwsDrug[] = await repository.find({
      where: {
        id: notEmpty(req.body.id) ? req.body.id : notEmpty(req.params.id) ? req.params.id : undefined,
        activity_date: notEmpty(req.body.start_date) && notEmpty(req.body.end_date) ? Between(req.body.start_date, req.body.end_date) : undefined,
        form: notEmpty(req.body.forms) ? In(req.body.forms) : undefined,
        source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
        district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
        site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
        chw: notEmpty(req.body.chws) ? { id: In(req.body.chws) } : undefined
      }
    });
    respData = !allSync ? { status: 201, data: 'Not data found with parametter!' } : { status: 200, data: allSync }
  }
  catch (err) {
    // return next(err);
    respData = { status: 201, data: errorMsg };
  }
  return onlyData ? respData : res.status(respData.status).json(respData);
}

export async function getChwsDrugUpdatedWithParams(req: Request, res: Response, next: NextFunction, onlyData: boolean = false): Promise<any> {
  var respData: { status: number, data: any };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    respData = { status: 201, data: 'Informations you provided are not valid' }
    return onlyData ? respData : res.status(201).json(respData);
  }
  const errorMsg: string = "Your request provides was rejected !";
  try {
    const repository = await getChwsDrugUpdateSyncRepository();

    var allSync: ChwsDrugUpdate[] = await repository.find({
      where: {
        id: notEmpty(req.body.id) ? req.body.id : notEmpty(req.params.id) ? req.params.id : undefined,
        district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
        site: notEmpty(req.body.site) ? { id: In(req.body.sites) } : undefined,
        chw: notEmpty(req.body.chw) ? { id: In(req.body.chws) } : undefined,
        year: notEmpty(req.body.year) ? In(req.body.years) : undefined,
        month: notEmpty(req.body.month) ? In(req.body.month) : undefined,
        drug_index: notEmpty(req.body.chw) ? In(req.body.drugs_index) : undefined
      }
    });
    respData = !allSync ? { status: 201, data: 'Not data found with parametter!' } : { status: 200, data: allSync }
  }
  catch (err) {
    // return next(err);
    respData = { status: 201, data: errorMsg };
  }
  return onlyData ? respData : res.status(respData.status).json(respData);
}

export async function getChwsDrugUpdatedWithCoustomParams(req: { district: string, site: string, chw: string, year: number, month: string, drug_index: number }): Promise<ChwsDrugUpdate[] | undefined> {
  var allSync: ChwsDrugUpdate[] | undefined;
  const errorMsg: string = "Your request provides was rejected !";
  try {
    const repository = await getChwsDrugUpdateSyncRepository();
    allSync = await repository.find({
      where: {
        district: notEmpty(req.district) ? { id: req.district } : undefined,
        site: notEmpty(req.site) ? { id: req.site } : undefined,
        chw: notEmpty(req.chw) ? { id: req.chw } : undefined,
        year: notEmpty(req.year) ? req.year : undefined,
        month: notEmpty(req.month) ? req.month : undefined,
        drug_index: notEmpty(req.chw) ? req.drug_index : undefined
      }
    });
  } catch (err) {
  }
  return !allSync ? undefined : allSync;
}

function getChwInfos(chw: Chws[], chwId: string): Chws | null {
  if (notEmpty(chwId)) {
    for (let i = 0; i < chw.length; i++) {
      const asc: Chws = chw[i];
      if (asc && asc.id === chwId) return asc;
    }
  }
  return null;
}

export async function getDataInformations(req: Request, res: Response, next: NextFunction): Promise<any> {
  var respData: { status: number, data: any };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    respData = { status: 201, data: 'Informations you provided are not valid' }
    return res.status(201).json(respData);
  }

  const errorMsg: string = "Your request provides was rejected !";
  try {
    const dataWithParams: { status: number, data: any } = await getChwsDataWithParams(req, res, next, true);
    if (dataWithParams.status == 200) {
      const _familyRepo = await getFamilySyncRepository();
      var families: Families[] = await _familyRepo.find({
        where: {
          district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
          site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
          zone: {
            id: notEmpty(req.body.zones) ? In(req.body.zones) : undefined,
          },
        }
      });

      const _chwsRepo = await getChwsSyncRepository();
      var chws: Chws[] = await _chwsRepo.find({
        where: {
          district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
          site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
          zone: {
            id: notEmpty(req.body.zones) ? In(req.body.zones) : undefined,
          },
        }
      });

      if (!families) return res.status(201).json({ status: 201, data: 'Not data found with parametter!' });

      var finalData: any = { total_visited: 0, total_not_visited: 0, family_count: 0, detail: [] };
      var familiesInfos: any = {};

      for (let f = 0; f < families.length; f++) {
        const family = families[f];
        familiesInfos[`${family.id}`] = { family: family, chw: getChwInfos(chws, family.zone?.chw_id!), data: { all_visit: 0, visit_in_day: 0, death: 0, child_visit: 0, women_visit: 0, home_visit: 0, isVisited: false } };

      }

      const chwsData: ChwsData[] = dataWithParams.data;
      var hasVisit: string[] = [];

      for (let d = 0; d < chwsData.length; d++) {
        const data = chwsData[d];
        if (data.family_id && data.family_id != "" && data.form && data.form != "") {
          var found = `${getDateInFormat(data.reported_date)}-${data.family_id}`;

          try {
            if (!hasVisit.includes(found)) {
              hasVisit.push(found);
              familiesInfos[data.family_id].data.visit_in_day += 1;
            }
            familiesInfos[data.family_id].data.all_visit += 1;
            if (familiesInfos[data.family_id].data.all_visit > 0) familiesInfos[data.family_id].data.isVisited = true;
            if (data.form == "death_report") familiesInfos[data.family_id].data.death += 1;
            if (data.form == "home_visit") familiesInfos[data.family_id].data.home_visit += 1;
            if (Consts.child_forms.includes(data.form)) familiesInfos[data.family_id].data.child_visit += 1;
            if (Consts.women_forms.includes(data.form)) familiesInfos[data.family_id].data.women_visit += 1;

          } catch (error) {

          }
        }
      }

      const details = Object.values(familiesInfos);

      for (let d = 0; d < details.length; d++) {
        const dtl: any = details[d];
        finalData.family_count += 1;
        if (dtl.data.isVisited == true) {
          finalData.total_visited += 1;
        } else {
          finalData.total_not_visited += 1;
        }
      }

      finalData.detail = details;
      respData = { status: 200, data: finalData }
      return res.status(respData.status).json(respData);
    } else {
      return res.status(dataWithParams.status).json(dataWithParams);
    }
  } catch (err) {
    // return next(err);
    respData = { status: 201, data: errorMsg };
  }
  return res.status(respData.status).json(respData);
}

export async function fetchIhChtDataPerChw(req: Request, res: Response, next: NextFunction) {
  const chwsData: { status: number, data: ChwsData[] } = await getChwsDataWithParams(req, res, next, true);
  const chws: { status: number, data: Chws[] } = await getChws(req, res, next, true);
  if (chwsData.status == 200 && chws.status == 200) {
    const chwRepo = await getChwsSyncRepository();
    const allChws = await chwRepo.find();
    const dbChwsData: { chw: Chws, data: DataIndicators }[] = getAllAboutData(chwsData.data, chws.data, allChws, req, res);
    if (!dbChwsData) return res.status(201).json({ status: 201, data: 'No data found !' });
    return res.status(200).json({ status: 200, data: dbChwsData });
  } else {
    return res.status(chwsData.status).json({ status: 201, data: 'No data found !' });
  }
}

export async function fetchIhDrugDataPerChw(req: Request, res: Response, next: NextFunction, Chw: Chws | undefined = undefined) {
  req.body.forms = MEG_FORMS;
  req.body.sources = ['Tonoudayo'];

  const outPut = await getIhDrugArrayData(req, res, next, Chw)
  return res.status(outPut.status).json(outPut);
}

export async function getIhDrugArrayData(req: Request, res: Response, next: NextFunction, Chw: Chws | undefined = undefined): Promise<{ status: number; data: { chwId: any, chw: Chws, data: ChwsDrugData }[] | string | undefined; }> {
  
  const chwsDrug: { status: number, data: ChwsDrug[] } = await getChwsDrugWithParams(req, res, next, true);

  var chwsDrugFinalOut: { chwId: any, chw: Chws, data: ChwsDrugData }[] = [];

  if (Chw) {
    if (Chw.id && Chw.id != '') {
      const chwsDrugOutPut = await genarateIhDrugArray(chwsDrug.data, Chw, req, res, next);
      chwsDrugFinalOut.push({ chwId: Chw.id, chw: Chw, data: chwsDrugOutPut });
    }
  } else {
    const chws: { status: number, data: Chws[] } = await getChws(req, res, next, true);
    if (chwsDrug.status == 200 && chws.status == 200) {
      var confirm: string[] = []
      for (let i = 0; i < chws.data.length; i++) {
        const asc = chws.data[i];
        if (asc.id && asc.id != '' && !confirm.includes(asc.id!)) {
          const chwsDrugOutPut = await genarateIhDrugArray(chwsDrug.data, asc, req, res, next);
          chwsDrugFinalOut.push({ chwId: asc.id, chw: asc, data: chwsDrugOutPut });
          confirm.push(asc.id!);
        }
      }
    } else {
      return { status: 201, data: 'No data found !' };
    }
  }

  if (!chwsDrugFinalOut) return { status: 201, data: 'No data found !' };
  return { status: 200, data: chwsDrugFinalOut };
}

// async function getDrugPrevYearInventoryData(req: Request, res: Response, next: NextFunction, Chw: Chws | undefined = undefined): Promise<{ status: number; data: { chwId: any, chw: Chws, data: ChwsDrugData }[] | string | undefined; }> {
//   const chwsDrug: { status: number, data: ChwsDrug[] } = await getChwsDrugWithParams(req, res, next, true);
//   var chwsDrugFinalOut: { chwId: any, chw: Chws, data: ChwsDrugData }[] = [];
//   if (Chw && Chw.id && Chw.id != '') {
//     const chwsDrugOutPut = await genarateIhDrugArray(chwsDrug.data, Chw, req, res, next, true);
//     chwsDrugFinalOut.push({ chwId: Chw.id, chw: Chw, data: chwsDrugOutPut });
//   }
//   if (!chwsDrugFinalOut) return { status: 201, data: 'No data found !' };
//   return { status: 200, data: chwsDrugFinalOut };
// }

async function genarateIhDrugArray(data: ChwsDrug[], asc: Chws, req: Request, res: Response, next: NextFunction, onlyInventory: boolean = false): Promise<ChwsDrugData> {
  return {
    Albendazole_400_mg_cp_1: await getChwsDrugQantity(data, asc, 1, 'alben_400', req, res, next),
    Amoxiciline_250_mg_2: await getChwsDrugQantity(data, asc, 2, 'amox_250', req, res, next),
    Amoxiciline_500_mg_3: await getChwsDrugQantity(data, asc, 3, 'amox_500', req, res, next),
    Artemether_Lumefantrine_20_120mg_cp_4: await getChwsDrugQantity(data, asc, 4, 'lumartem', req, res, next),
    Oral_Combination_Pills_5: await getChwsDrugQantity(data, asc, 5, 'pills', req, res, next),
    Paracetamol_250_mg_6: await getChwsDrugQantity(data, asc, 6, 'para_250', req, res, next),
    Paracetamol_500_mg_7: await getChwsDrugQantity(data, asc, 7, 'para_500', req, res, next),
    Pregnancy_Test_8: await getChwsDrugQantity(data, asc, 8, 'pregnancy_test', req, res, next),
    Sayana_Press_9: await getChwsDrugQantity(data, asc, 9, 'sayana', req, res, next),
    SRO_10: await getChwsDrugQantity(data, asc, 10, 'sro', req, res, next),
    TDR_11: await getChwsDrugQantity(data, asc, 11, 'tdr', req, res, next),
    Vitamine_A_100000UI_12: await getChwsDrugQantity(data, asc, 12, 'vit_A1', req, res, next),
    Vitamine_A_200000UI_13: await getChwsDrugQantity(data, asc, 13, 'vit_A2', req, res, next),
    Zinc_14: await getChwsDrugQantity(data, asc, 14, 'zinc', req, res, next)
  };
}

async function getChwDrugInventoryQty(Chw: Chws, start_date: string, end_date: string, index: number, fieldId: string, reqt: Request, res: Response, next: NextFunction): Promise<ChwsDrugQantityInfo> {
  var req = {
    body: {
      id: undefined,
      forms: undefined,
      start_date: start_date,
      end_date: end_date,
      sources: [Chw.source],
      districts: [Chw.site?.district?.id],
      sites: [Chw.site?.id],
      chws: [Chw.id]
    },
    params: {
      id: undefined,
    }
  }

  var out: ChwsDrugQantityInfo = { inventory_quantity: 0 };
  const chwsDrug: { status: number, data: ChwsDrug[] } = await getChwsDrugWithParams(req, res, next, true);
  if (chwsDrug.status == 200 && chwsDrug.data) {
    for (let i = 0; i < chwsDrug.data.length; i++) {
      const data: ChwsDrug = chwsDrug.data[i];
      if (notEmpty(data?.source) && notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {
        const idSourceValid: boolean = data?.source == 'Tonoudayo';
        const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
        const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
        const idChwValid: boolean = data?.chw?.id == Chw.id;
        const isDateValid: boolean = isBetween(`${start_date}`, data.activity_date, `${end_date}`);
        if (isDateValid && idSourceValid && idDistrictValid && idSiteValid && idChwValid) {
          if (data.form == "drug_quantities" && data.activity_type == "c_qty_counted") out.inventory_quantity! += generateDrugQty(data, fieldId);
        }
      }
    }
  }
  return out;
}

async function getChwsDrugQantity(ChwsDataFromDb: ChwsDrug[], Chw: Chws, index: number, fieldId: string, req: Request, res: Response, next: NextFunction): Promise<ChwsDrugQantityInfo> {
  const { start_date, end_date, sources, districts, sites, chws } = req.body;

  var out: ChwsDrugQantityInfo = {
    month_quantity_beginning: 0, // A
    month_quantity_received: 0, // B
    month_total_quantity: 0, // C = A + B
    month_consumption: 0, // D
    theoretical_quantity: 0, // E = C - D
    inventory_quantity: 0, // F
    inventory_variance: 0, // J = F - E
    year_cmm: 0, // N-1, G
    theoretical_quantity_to_order: 0, // H
    quantity_to_order: 0, // I
    quantity_validated: 0,
    delivered_quantity: 0,
    satisfaction_rate: '',
    loan_borrowing: '',
    loan_borrowing_quantity: 0,
    loan_borrowing_chws_code: '',
    quantity_loss: 0,
    quantity_damaged: 0,
    quantity_broken: 0,
    quantity_expired: 0,
    other_quantity: 0,
    comments: "",
    observations: ""
  };

  for (let i = 0; i < ChwsDataFromDb.length; i++) {
    var data: ChwsDrug = ChwsDataFromDb[i];
    if (data && notEmpty(sources) && notEmpty(districts) && notEmpty(sites) && notEmpty(chws) && notEmpty(start_date) && notEmpty(end_date)) {
      if (notEmpty(data?.source) && notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {

        const idSourceValid: boolean = sources?.includes(data?.source) && data?.source == 'Tonoudayo';
        const idDistrictValid: boolean = districts?.includes(data?.district?.id) && data?.district?.id == Chw.district?.id;
        const idSiteValid: boolean = sites?.includes(data?.site?.id) && data?.site?.id == Chw.site?.id;
        const idChwValid: boolean = chws?.includes(data?.chw?.id) && data?.chw?.id == Chw.id;
        const isDateValid: boolean = isBetween(`${start_date}`, data.activity_date, `${end_date}`);

        if (isDateValid && idSourceValid && idDistrictValid && idSiteValid && idChwValid) {

          if (data.form == "drug_quantities") {
            if (data.activity_type == "c_qty_received") out.month_quantity_received! += generateDrugQty(data, fieldId);
            if (data.activity_type == "c_qty_counted") out.inventory_quantity! += generateDrugQty(data, fieldId);
            if (data.activity_type == "c_qty_order") out.quantity_to_order! += generateDrugQty(data, fieldId);
          }

          if (data.form == "drug_movements") {
            if (data.activity_type == "c_med_loss") out.quantity_loss! += generateDrugQty(data, fieldId);
            if (data.activity_type == "c_med_expired") out.quantity_expired! += generateDrugQty(data, fieldId);

            if (data.activity_type == "c_med_borrowing") {
              out.loan_borrowing_quantity! += generateDrugQty(data, fieldId);
              if (out.loan_borrowing_quantity && out.loan_borrowing_quantity != 0) {
                out.loan_borrowing_chws_code! += `${data.loan_borrowing_chws_info!}, `;
                out.loan_borrowing = 'Emprunt';
              }
            }

            if (data.activity_type == "c_med_loan") {
              out.loan_borrowing_quantity! += generateDrugQty(data, fieldId);
              if (out.loan_borrowing_quantity && out.loan_borrowing_quantity != 0) {
                out.loan_borrowing_chws_code! += `${data.loan_borrowing_chws_info!}, `;
                out.loan_borrowing = 'Prêt';
              }
            }

            if (data.activity_type == "c_med_damaged") out.quantity_damaged! += generateDrugQty(data, fieldId);
            if (data.activity_type == "c_med_broken") out.quantity_broken! += generateDrugQty(data, fieldId);
            if (data.activity_type == "c_others") out.other_quantity! += generateDrugQty(data, fieldId);
            out.comments! = data.comments ?? '';
          }

          if (["pcime_c_asc", "pregnancy_family_planning", "fp_follow_up_renewal"].includes(data.form!)) out.month_consumption! += generateDrugQty(data, fieldId);
        }
      }
    }
  }

  const dateArray = end_date.split('-');
  const prevM = previousMonth(dateArray[1]);
  const prevY = prevM == '12' ? parseInt(dateArray[0]) - 1 : dateArray[0];

  const prevPrevM = previousMonth(prevM);
  const prevPrevY = prevPrevM == '12' ? prevY - 1 : prevY;

  const curInventory = await getChwDrugInventoryQty(Chw, start_date, end_date, index, fieldId, req, res, next);
  const prevInventory = await getChwDrugInventoryQty(Chw, `${prevPrevY}-${prevPrevM}-21`, `${prevY}-${prevM}-20`, index, fieldId, req, res, next);

  if (curInventory) out.inventory_quantity! += curInventory.inventory_quantity ?? 0.
  if (prevInventory) out.month_quantity_beginning! += prevInventory.inventory_quantity ?? 0.

  const dt = Chw.site?.district?.id;
  const st = Chw.site?.id;
  const cw = Chw.id;

  if (dt && st && cw && notEmpty(dateArray)) {
    const drugUpdateReq = {
      district: dt,
      site: st,
      chw: cw,
      year: parseInt(dateArray[0]),
      month: dateArray[1],
      drug_index: index
    };
    const drugUpdated = await getChwsDrugUpdatedWithCoustomParams(drugUpdateReq);

    if (drugUpdated) {
      for (let zi = 0; zi < drugUpdated.length; zi++) {
        const found = drugUpdated[zi];
        out.year_cmm! += found.year_cmm ?? 0;
        out.quantity_validated! += found.quantity_validated ?? 0;
        out.delivered_quantity! += found.delivered_quantity ?? 0;
        out.theoretical_quantity_to_order! += found.theoretical_quantity_to_order ?? 0;
        out.observations += found.observations ?? '';
      }
    }
  }

  out.month_total_quantity = out.month_quantity_beginning! + out.month_quantity_received!;
  out.theoretical_quantity = out.month_total_quantity! - out.month_consumption!;
  out.inventory_variance = out.inventory_quantity! - out.theoretical_quantity;

  if (out.delivered_quantity != 0 && out.quantity_validated != 0) {
    const rate = out.delivered_quantity! / out.quantity_validated!;
    out.satisfaction_rate = !Number.isNaN(rate) ? `${(rate * 100).toFixed(2)} %` : 'NA';
  } else {
    out.satisfaction_rate = undefined;
  }


  return out;
}

function generateDrugQty(data: ChwsDrug, fieldId: string): number {
  if (fieldId == "lumartem" && data.lumartem) return data.lumartem;
  if (fieldId == "alben_400" && data.alben_400) return data.alben_400!;
  if (fieldId == "amox_250" && data.amox_250) return data.amox_250!;
  if (fieldId == "amox_500" && data.amox_500) return data.amox_500!;
  if (fieldId == "pills" && data.pills) return data.pills!;
  if (fieldId == "para_250" && data.para_250) return data.para_250!;
  if (fieldId == "para_500" && data.para_500) return data.para_500!;
  if (fieldId == "pregnancy_test" && data.pregnancy_test) return data.pregnancy_test!;
  if (fieldId == "sayana" && data.sayana) return data.sayana!;
  if (fieldId == "sro" && data.sro) return data.sro!;
  if (fieldId == "tdr" && data.tdr) return data.tdr!;
  if (fieldId == "vit_A1" && data.vit_A1) return data.vit_A1!;
  if (fieldId == "vit_A2" && data.vit_A2) return data.vit_A2!;
  if (fieldId == "zinc" && data.zinc) return data.zinc!;
  if (fieldId == "other_drug" && data.other_drug) return data.other_drug!;
  return 0;
}

export async function updateDrugPerChw(req: Request, res: Response, next: NextFunction) {
  req.body.forms = MEG_FORMS;
  req.body.sources = ['Tonoudayo'];
  const { district, site, chw, year, month, drug_index, drug_name, year_cmm, quantity_validated, delivered_quantity, observations, theoretical_quantity_to_order, forms, sources, userId } = req.body;

  const _repoChwsDrugUpdate = await getChwsDrugUpdateSyncRepository();
  const _chwRepo = await getChwsSyncRepository();
  try {
    const _sync = new ChwsDrugUpdate();

    _sync.id = `${site}-${chw}-${year}-${month}-${drug_index}`;
    _sync.district = district;
    _sync.site = site;
    _sync.chw = chw;
    _sync.year = year;
    _sync.month = month;
    _sync.drug_index = drug_index;
    _sync.drug_name = drug_name;
    _sync.year_cmm = year_cmm;
    _sync.quantity_validated = quantity_validated;
    _sync.delivered_quantity = delivered_quantity;
    _sync.theoretical_quantity_to_order = theoretical_quantity_to_order;
    _sync.observations = observations;
    _sync.updatedBy = userId;
    _sync.updatedAt = new Date();

    await _repoChwsDrugUpdate.save(_sync);

    const prevM = previousMonth(month);
    const prevY = prevM == '12' ? parseInt(year) - 1 : year;

    req.body.start_date = `${prevY}-${prevM}-21`;
    req.body.end_date = `${year}-${month}-20`;
    req.body.forms = forms;
    req.body.sources = sources;
    req.body.districts = [district];
    req.body.sites = [site];
    req.body.chws = [chw];

    var Chw = await _chwRepo.findOneBy({ id: chw });
    if (Chw) {
      const updateOutPut = await getIhDrugArrayData(req, res, next, Chw);
      if (updateOutPut) {
        return res.status(updateOutPut.status).json(updateOutPut);
      }
    }
    return res.status(201).json({ status: 201, data: 'No data found !' });

  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    return res.status(err.statusCode).json({ status: 201, data: 'No data found !' });
  }
}

function getAllAboutData(ChwsDataFromDb$: ChwsData[], SelectedChws$: Chws[], AllDbChws$: Chws[], req: Request, res: Response): { chw: Chws, data: DataIndicators }[] {
  // 'Démarrage du calcule des indicateurs ...'
  const { start_date, end_date, sources, districts, sites, chws, withDhis2Data } = req.body;

  var Chws$: Chws[] = SelectedChws$;

  var outPutData: ChtOutPutData = {
    home_visit: {},
    soins_pcime: {},
    suivi_pcime: {},
    reference_pcime: {},
    diarrhee_pcime: {},
    paludisme_pcime: {},
    pneumonie_pcime: {},
    malnutrition_pcime: {},
    prompt_pcime_diarrhee_24h: {},
    prompt_pcime_diarrhee_48h: {},
    prompt_pcime_diarrhee_72h: {},
    prompt_pcime_paludisme_24h: {},
    prompt_pcime_paludisme_48h: {},
    prompt_pcime_paludisme_72h: {},
    prompt_pcime_pneumonie_24h: {},
    prompt_pcime_pneumonie_48h: {},
    prompt_pcime_pneumonie_72h: {},
    reference_Pf: {},
    reference_enceinte_postpartum: {},
    femme_enceinte: {},
    femme_enceinte_NC: {},
    test_de_grossesse: {},
    femme_postpartum: {},
    femme_postpartum_NC: {},
    total_PF_NC: {},
    total_PF: {},
  }

  for (let i = 0; i < Chws$.length; i++) {
    const ascId = Chws$[i].id;
    if (ascId && ascId != '') {
      Object.entries(outPutData).map(([key, val]) => {
        if (!val.hasOwnProperty(ascId)) val[ascId] = { chwId: ascId, tonoudayo: 0, dhis2: 0 }
      });
    }
  }

  for (let i = 0; i < ChwsDataFromDb$.length; i++) {
    const data: ChwsData = ChwsDataFromDb$[i];
    if (data) {
      const form = data.form;
      const field = data.fields;
      const chw: string = data.chw?.id ?? '';

      const idSourceValid: boolean = notEmpty(data.source) && notEmpty(sources) && sources?.includes(data.source) || !notEmpty(sources);
      const idDistrictValid: boolean = notEmpty(data.district?.id) && notEmpty(districts) && districts?.includes(data.district?.id) || !notEmpty(districts);
      const idSiteValid: boolean = notEmpty(data.site?.id) && notEmpty(sites) && sites?.includes(data.site?.id) || !notEmpty(sites);
      const idChwValid: boolean = notEmpty(chw) && notEmpty(chws) && chws?.includes(chw) || !notEmpty(chws);
      const isDateValid: boolean = notEmpty(start_date) && notEmpty(end_date) ? isBetween(`${start_date}`, data.reported_date, `${end_date}`) : false;

      if (isDateValid && idSourceValid && idDistrictValid && idSiteValid && idChwValid) {

        Object.entries(outPutData).map(([key, val]) => {
          if (!val.hasOwnProperty(chw)) {
            const chwFound = getChwInfos(AllDbChws$, chw);
            if (chwFound) {
              const isDInData: boolean = Chws$.some(ch => ch.id === chwFound.id);
              if (!isDInData) Chws$.push(chwFound);
            }
            val[chw] = { chwId: chw, tonoudayo: 0, dhis2: 0 }
          }
        });

        if (data.source == 'Tonoudayo') {

          if (Consts.home_visit_form.includes(form!)) outPutData.home_visit[chw].tonoudayo += 1;

          if (["pcime_c_asc"].includes(form!)) {
            outPutData.soins_pcime[chw].tonoudayo += 1;
            if (field["group_review.s_have_you_refer_child"] == "yes") outPutData.reference_pcime[chw].tonoudayo += 1;
            if (field["has_diarrhea"] == "true") {
              outPutData.diarrhee_pcime[chw].tonoudayo += 1;
              if (field["within_24h"] == "true") outPutData.prompt_pcime_diarrhee_24h[chw].tonoudayo += 1;
              if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_pcime_diarrhee_48h[chw].tonoudayo += 1;
              if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_pcime_diarrhee_72h[chw].tonoudayo += 1;
            }

            if (field["fever_with_malaria"] == "true") {
              outPutData.paludisme_pcime[chw].tonoudayo += 1;
              if (field["within_24h"] == "true") outPutData.prompt_pcime_paludisme_24h[chw].tonoudayo += 1;
              if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_pcime_paludisme_48h[chw].tonoudayo += 1;
              if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_pcime_paludisme_72h[chw].tonoudayo += 1;
            }

            if (field["has_pneumonia"] == "true") {
              outPutData.pneumonie_pcime[chw].tonoudayo += 1;
              if (field["within_24h"] == "true") outPutData.prompt_pcime_pneumonie_24h[chw].tonoudayo += 1;
              if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_pcime_pneumonie_48h[chw].tonoudayo += 1;
              if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_pcime_pneumonie_72h[chw].tonoudayo += 1;
            }

            if (field["has_malnutrition"] == "true") outPutData.malnutrition_pcime[chw].tonoudayo += 1;
          }

          if (Consts.child_followup_forms.includes(form!)) {
            outPutData.suivi_pcime[chw].tonoudayo += 1;
            if (field["group_review.s_have_you_refer_child"] == "yes") outPutData.reference_pcime[chw].tonoudayo += 1;
          }

          if (["prenatal_followup"].includes(form!)) {
            outPutData.femme_enceinte[chw].tonoudayo += 1;
            if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.reference_enceinte_postpartum[chw].tonoudayo += 1;
            if (field["follow_up_count"] == "1") outPutData.femme_enceinte_NC[chw].tonoudayo += 1;
          }

          if (["postnatal_followup"].includes(form!)) {
            outPutData.femme_postpartum[chw].tonoudayo += 1;
            if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.reference_enceinte_postpartum[chw].tonoudayo += 1;
            if (field["follow_up_count"] == "1") outPutData.femme_postpartum_NC[chw].tonoudayo += 1;
          }

          if (Consts.pregnancy_pf_forms.includes(form!)) {
            if (form == "pregnancy_family_planning") {
              var pregnant_1 = field["s_reg_pregnancy_screen.s_reg_urine_result"] == "positive"
              var pregnant_2 = field["s_reg_pregnancy_screen.s_reg_why_urine_test_not_done"] == "already_pregnant"
              if (field["s_reg_pregnancy_screen.s_reg_urine_test"] == "yes") outPutData.test_de_grossesse[chw].tonoudayo += 1;
              if (pregnant_1 == true || pregnant_2 == true) {
                outPutData.femme_enceinte[chw].tonoudayo += 1;
                if (field["s_summary.s_have_you_refer_child"] == "yes") outPutData.reference_enceinte_postpartum[chw].tonoudayo += 1;
              } else {
                outPutData.total_PF[chw].tonoudayo += 1;
                if (field["s_fam_plan_screen.agreed_to_fp"] == "yes") outPutData.total_PF_NC[chw].tonoudayo += 1;
                if (field["s_summary.s_have_you_refer_child"] == "yes") outPutData.reference_Pf[chw].tonoudayo += 1;
              }
            } else if (form == "women_emergency_followup") {
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.reference_enceinte_postpartum[chw].tonoudayo += 1;
              if (field["initial.woman_status"] == "pregnant") {
                outPutData.femme_enceinte[chw].tonoudayo += 1;
              } else if (field["initial.woman_status"] == "postpartum") {
                outPutData.femme_postpartum[chw].tonoudayo += 1;
              } else {
                outPutData.home_visit[chw].dhis2 += 1;
              }
            } else if (form == "delivery") {
              outPutData.femme_postpartum[chw].tonoudayo += 1;
              if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.reference_enceinte_postpartum[chw].tonoudayo += 1
            } else if (form == "fp_followup_danger_sign_check") {
              outPutData.total_PF[chw].tonoudayo += 1;
              if (field["s_summary.r_have_you_refer_child"]) outPutData.reference_Pf[chw].tonoudayo += 1;
            } else if (form == "fp_follow_up_renewal") {
              outPutData.total_PF[chw].tonoudayo += 1;
              if (field["checklist2.s_refer_for_health_state"] == "true") outPutData.reference_Pf[chw].tonoudayo += 1;
            }
          }

        }

        if (data.source == 'dhis2' && (withDhis2Data == true || withDhis2Data == 'true')) {

          if (form === "PCIME") {
            // (data.fields['BLWjEQQdBFi'] * 365) >= 60 || (data.fields['BLWjEQQdBFi'] * 365) < 60
            if (data.fields['zNldrz5EUPR'] == 'Soins') {
              outPutData.soins_pcime[chw].dhis2 += 1;
              if (data.fields['NPHYf8WAR9l'] == 'true') {// diarrhee
                outPutData.diarrhee_pcime[chw].dhis2 += 1;
                if (data.fields['U3c13SP8AQz'] == '≤24') outPutData.prompt_pcime_diarrhee_24h[chw].dhis2 += 1;
                if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48') outPutData.prompt_pcime_diarrhee_48h[chw].dhis2 += 1;
                if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48' || data.fields['U3c13SP8AQz'] == '≤72') outPutData.prompt_pcime_diarrhee_72h[chw].dhis2 += 1;
              }
              if (data.fields['Gl7HGePuIi3'] == 'true') {// paludisme
                outPutData.paludisme_pcime[chw].dhis2 += 1;
                if (data.fields['U3c13SP8AQz'] == '≤24') outPutData.prompt_pcime_paludisme_24h[chw].dhis2 += 1;
                if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48') outPutData.prompt_pcime_paludisme_48h[chw].dhis2 += 1;
                if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48' || data.fields['U3c13SP8AQz'] == '≤72') outPutData.prompt_pcime_paludisme_72h[chw].dhis2 += 1;
              }
              if (data.fields['LP33fMJRWrT'] == 'true') {// pneumonie
                outPutData.pneumonie_pcime[chw].dhis2 += 1;
                if (data.fields['U3c13SP8AQz'] == '≤24') outPutData.prompt_pcime_pneumonie_24h[chw].dhis2 += 1;
                if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48') outPutData.prompt_pcime_pneumonie_48h[chw].dhis2 += 1;
                if (data.fields['U3c13SP8AQz'] == '≤24' || data.fields['U3c13SP8AQz'] == '≤48' || data.fields['U3c13SP8AQz'] == '≤72') outPutData.prompt_pcime_pneumonie_72h[chw].dhis2 += 1;
              }
              if (data.fields['y84NNODZ705'] == 'true') {// malnutrition
                outPutData.malnutrition_pcime[chw].dhis2 += 1;
              }
              if (data.fields['pMjjh6JLEz2'] == 'Oui') outPutData.reference_pcime[chw].dhis2 += 1; // référence
            } else if (data.fields['zNldrz5EUPR'] == 'Suivi') {
              outPutData.suivi_pcime[chw].dhis2 += 1;
              if (data.fields['pMjjh6JLEz2'] == 'Oui') outPutData.reference_pcime[chw].dhis2 += 1; // référence
            } else {
              outPutData.suivi_pcime[chw].dhis2 += 1;
            }
          }
          if (form === "Maternelle") {
            // data.fields['WRwCp1UsW3b'] == "CPON1" || data.fields['rFlbd27poqd'] == 'CPN1'
            if (data.fields['DNzefvCYfZz'] == "true") outPutData.test_de_grossesse[chw].dhis2 += 1; //test_de_grossesse
            if (data.fields['reULiF7LW3w'] == 'Enceinte') {
              outPutData.femme_enceinte[chw].dhis2 += 1;
              if (data.fields['pMjjh6JLEz2'] == 'Oui') outPutData.reference_enceinte_postpartum[chw].dhis2 += 1; // référence
              if (data.fields['WaN8nOieIhs'] == 'NC') outPutData.femme_enceinte_NC[chw].dhis2 += 1;
            } else if (data.fields['reULiF7LW3w'] == 'Post_Partum') {
              outPutData.femme_postpartum[chw].dhis2 += 1;
              if (data.fields['pMjjh6JLEz2'] == 'Oui') outPutData.reference_enceinte_postpartum[chw].dhis2 += 1; // référence
              if (data.fields['WaN8nOieIhs'] == 'NC') outPutData.femme_postpartum_NC[chw].dhis2 += 1;
            } else {
              outPutData.home_visit[chw].dhis2 += 1;
            }
          }

          if (form === "PF") {
            if (data.fields['DNzefvCYfZz'] == "true") outPutData.test_de_grossesse[chw].dhis2 += 1; //test_de_grossesse
            if (data.fields['pMjjh6JLEz2'] == 'Oui') outPutData.reference_Pf[chw].dhis2 += 1; // référence
            if (data.fields['kY42apNsghu'] == 'Oui') {// pf_administree
              outPutData.total_PF[chw].dhis2 += 1;
              if (data.fields['WaN8nOieIhs'] == 'NC') outPutData.total_PF_NC[chw].dhis2 += 1;
            } else {
              outPutData.home_visit[chw].dhis2 += 1;
            }
          }
          if (form === "Recherche") {
            outPutData.home_visit[chw].dhis2 += 1;
          }
        }

      }
    }
  }

  return transformChwsData(outPutData, Chws$, req, res);

}

function transformChwsData(allDatasFound: ChtOutPutData, Chws$: Chws[], req: Request, res: Response): { chw: Chws, data: DataIndicators }[] {
  const { end_date, params, withDhis2Data } = req.body;

  var allAggragateData: { chw: Chws, data: DataIndicators }[] = [];

  for (let i = 0; i < Chws$.length; i++) {
    const chw: Chws = Chws$[i];
    const ascId = chw.id!;

    var chwsData: DataIndicators = {
      total_vad: { tonoudayo: 0, dhis2: 0 },
      sum_soins_suivi: { tonoudayo: 0, dhis2: 0 },
      soins_pcime: { tonoudayo: 0, dhis2: 0 },
      suivi_pcime: { tonoudayo: 0, dhis2: 0 },
      femmes_enceinte: { tonoudayo: 0, dhis2: 0 },
      femmes_postpartum: { tonoudayo: 0, dhis2: 0 },
      home_visit: { tonoudayo: 0, dhis2: 0 },
      pf: { tonoudayo: 0, dhis2: 0 },
      reference_pf: { tonoudayo: 0, dhis2: 0 },
      reference_pcime: { tonoudayo: 0, dhis2: 0 },
      reference_femmes_enceinte_postpartum: { tonoudayo: 0, dhis2: 0 },
      diarrhee_pcime: { tonoudayo: 0, dhis2: 0 },
      paludisme_pcime: { tonoudayo: 0, dhis2: 0 },
      pneumonie_pcime: { tonoudayo: 0, dhis2: 0 },
      malnutrition_pcime: { tonoudayo: 0, dhis2: 0 },
      prompt_pcime_diarrhee_24h: { tonoudayo: 0, dhis2: 0 },
      prompt_pcime_diarrhee_48h: { tonoudayo: 0, dhis2: 0 },
      prompt_pcime_diarrhee_72h: { tonoudayo: 0, dhis2: 0 },
      prompt_pcime_paludisme_24h: { tonoudayo: 0, dhis2: 0 },
      prompt_pcime_paludisme_48h: { tonoudayo: 0, dhis2: 0 },
      prompt_pcime_paludisme_72h: { tonoudayo: 0, dhis2: 0 },
      prompt_pcime_pneumonie_24h: { tonoudayo: 0, dhis2: 0 },
      prompt_pcime_pneumonie_48h: { tonoudayo: 0, dhis2: 0 },
      prompt_pcime_pneumonie_72h: { tonoudayo: 0, dhis2: 0 },
      femmes_enceintes_NC: { tonoudayo: 0, dhis2: 0 },
      femme_postpartum_NC: { tonoudayo: 0, dhis2: 0 },
      test_de_grossesse: { tonoudayo: 0, dhis2: 0 },

      sum_total_vad: 0,
      sum_soins_pcime: 0,
      sum_suivi_pcime: 0,
      sum_pcime: 0,
      sum_femmes_enceinte: 0,
      sum_femmes_postpartum: 0,
      sum_enceinte_postpartum: {
        tonoudayo: 0,
        dhis2: 0
      },
      sum_maternel: 0,
      sum_home_visit: 0,
      sum_pf: 0,
      sum_reference_pf: 0,
      sum_reference_pcime: 0,
      sum_reference_femmes_enceinte_postpartum: 0,
      sum_diarrhee_pcime: 0,
      sum_paludisme_pcime: 0,
      sum_pneumonie_pcime: 0,
      sum_malnutrition_pcime: 0,
      sum_prompt_pcime_diarrhee_24h: 0,
      sum_prompt_pcime_diarrhee_48h: 0,
      sum_prompt_pcime_diarrhee_72h: 0,
      sum_prompt_pcime_paludisme_24h: 0,
      sum_prompt_pcime_paludisme_48h: 0,
      sum_prompt_pcime_paludisme_72h: 0,
      sum_prompt_pcime_pneumonie_24h: 0,
      sum_prompt_pcime_pneumonie_48h: 0,
      sum_prompt_pcime_pneumonie_72h: 0,
      sum_femmes_enceintes_NC: 0,
      sum_femme_postpartum_NC: 0,
      sum_test_de_grossesse: 0
    };

    if (params != 'onlydata') {
      chwsData.orgUnit = '';
      chwsData.reported_date = '';
      chwsData.code_asc = '';
      chwsData.district = '';
      chwsData.data_source = '';
    }

    // Tonoudayo
    const tonoudayo_pcime = allDatasFound.soins_pcime[ascId]["tonoudayo"] + allDatasFound.suivi_pcime[ascId]["tonoudayo"];
    const tonoudayo_total_vad = tonoudayo_pcime +
      allDatasFound.femme_enceinte[ascId]["tonoudayo"] +
      allDatasFound.femme_postpartum[ascId]["tonoudayo"] +
      allDatasFound.home_visit[ascId]["tonoudayo"] +
      allDatasFound.total_PF[ascId]["tonoudayo"];

    if (params != 'onlydata' && withDhis2Data != true && withDhis2Data != 'true') {
      chwsData.orgUnit += chw.site?.external_id!;
      chwsData.reported_date += end_date;
      chwsData.code_asc += chw.external_id!;
      chwsData.district += chw.district?.name!;
      chwsData.data_source += 'medic';
    }
    chwsData.total_vad.tonoudayo += tonoudayo_total_vad;
    chwsData.sum_soins_suivi.tonoudayo += tonoudayo_pcime;
    chwsData.soins_pcime.tonoudayo += allDatasFound.soins_pcime[ascId]["tonoudayo"];
    chwsData.suivi_pcime.tonoudayo += allDatasFound.suivi_pcime[ascId]["tonoudayo"];

    chwsData.femmes_enceinte.tonoudayo += allDatasFound.femme_enceinte[ascId]["tonoudayo"];
    chwsData.femmes_postpartum.tonoudayo += allDatasFound.femme_postpartum[ascId]["tonoudayo"];;
    chwsData.home_visit.tonoudayo += allDatasFound.home_visit[ascId]["tonoudayo"];

    chwsData.pf.tonoudayo += allDatasFound.total_PF[ascId]["tonoudayo"];
    chwsData.reference_pf.tonoudayo += allDatasFound.reference_Pf[ascId]["tonoudayo"];
    chwsData.reference_pcime.tonoudayo += allDatasFound.reference_pcime[ascId]["tonoudayo"]
    chwsData.reference_femmes_enceinte_postpartum.tonoudayo += allDatasFound.reference_enceinte_postpartum[ascId]["tonoudayo"];

    chwsData.diarrhee_pcime.tonoudayo += allDatasFound.diarrhee_pcime[ascId]["tonoudayo"];
    chwsData.paludisme_pcime.tonoudayo += allDatasFound.paludisme_pcime[ascId]["tonoudayo"];
    chwsData.pneumonie_pcime.tonoudayo += allDatasFound.pneumonie_pcime[ascId]["tonoudayo"];
    chwsData.malnutrition_pcime.tonoudayo += allDatasFound.malnutrition_pcime[ascId]["tonoudayo"];

    chwsData.prompt_pcime_diarrhee_24h.tonoudayo += allDatasFound.prompt_pcime_diarrhee_24h[ascId]["tonoudayo"];
    chwsData.prompt_pcime_diarrhee_48h.tonoudayo += allDatasFound.prompt_pcime_diarrhee_48h[ascId]["tonoudayo"];
    chwsData.prompt_pcime_diarrhee_72h.tonoudayo += allDatasFound.prompt_pcime_diarrhee_72h[ascId]["tonoudayo"];

    chwsData.prompt_pcime_paludisme_24h.tonoudayo += allDatasFound.prompt_pcime_paludisme_24h[ascId]["tonoudayo"];
    chwsData.prompt_pcime_paludisme_48h.tonoudayo += allDatasFound.prompt_pcime_paludisme_48h[ascId]["tonoudayo"];
    chwsData.prompt_pcime_paludisme_72h.tonoudayo += allDatasFound.prompt_pcime_paludisme_72h[ascId]["tonoudayo"];

    chwsData.prompt_pcime_pneumonie_24h.tonoudayo += allDatasFound.prompt_pcime_pneumonie_24h[ascId]["tonoudayo"];
    chwsData.prompt_pcime_pneumonie_48h.tonoudayo += allDatasFound.prompt_pcime_pneumonie_48h[ascId]["tonoudayo"];
    chwsData.prompt_pcime_pneumonie_72h.tonoudayo += allDatasFound.prompt_pcime_pneumonie_72h[ascId]["tonoudayo"];

    chwsData.femmes_enceintes_NC.tonoudayo += allDatasFound.femme_enceinte_NC[ascId]["tonoudayo"];
    chwsData.femme_postpartum_NC.tonoudayo += allDatasFound.femme_postpartum_NC[ascId]["tonoudayo"];
    chwsData.test_de_grossesse.tonoudayo += allDatasFound.test_de_grossesse[ascId]["tonoudayo"];

    if (withDhis2Data == true || withDhis2Data == 'true') {
      // Dhis2
      const dhis2_pcime = allDatasFound.soins_pcime[ascId]["dhis2"] + allDatasFound.suivi_pcime[ascId]["dhis2"];
      const dhis2_total_vad = dhis2_pcime +
        allDatasFound.femme_enceinte[ascId]["dhis2"] +
        allDatasFound.femme_postpartum[ascId]["dhis2"] +
        allDatasFound.home_visit[ascId]["dhis2"] +
        allDatasFound.total_PF[ascId]["dhis2"];

      chwsData.total_vad.dhis2 += dhis2_total_vad;
      chwsData.sum_soins_suivi.dhis2 += dhis2_pcime;
      chwsData.soins_pcime.dhis2 += allDatasFound.soins_pcime[ascId]["dhis2"];
      chwsData.suivi_pcime.dhis2 += allDatasFound.suivi_pcime[ascId]["dhis2"];
      chwsData.femmes_enceinte.dhis2 += allDatasFound.femme_enceinte[ascId]["dhis2"];
      chwsData.femmes_postpartum.dhis2 += allDatasFound.femme_postpartum[ascId]["dhis2"]
      chwsData.home_visit.dhis2 += allDatasFound.home_visit[ascId]["dhis2"];
      chwsData.pf.dhis2 += allDatasFound.total_PF[ascId]["dhis2"];
      chwsData.reference_pf.dhis2 += allDatasFound.reference_Pf[ascId]["dhis2"];
      chwsData.reference_pcime.dhis2 += allDatasFound.reference_pcime[ascId]["dhis2"];
      chwsData.reference_femmes_enceinte_postpartum.dhis2 += allDatasFound.reference_enceinte_postpartum[ascId]["dhis2"];
      chwsData.diarrhee_pcime.dhis2 += allDatasFound.diarrhee_pcime[ascId]["dhis2"];
      chwsData.paludisme_pcime.dhis2 += allDatasFound.paludisme_pcime[ascId]["dhis2"];
      chwsData.pneumonie_pcime.dhis2 += allDatasFound.pneumonie_pcime[ascId]["dhis2"];
      chwsData.malnutrition_pcime.dhis2 += allDatasFound.malnutrition_pcime[ascId]["dhis2"];

      chwsData.prompt_pcime_diarrhee_24h.dhis2 += allDatasFound.prompt_pcime_diarrhee_24h[ascId]["dhis2"];
      chwsData.prompt_pcime_diarrhee_48h.dhis2 += allDatasFound.prompt_pcime_diarrhee_48h[ascId]["dhis2"];
      chwsData.prompt_pcime_diarrhee_72h.dhis2 += allDatasFound.prompt_pcime_diarrhee_72h[ascId]["dhis2"];

      chwsData.prompt_pcime_paludisme_24h.dhis2 += allDatasFound.prompt_pcime_paludisme_24h[ascId]["dhis2"];
      chwsData.prompt_pcime_paludisme_48h.dhis2 += allDatasFound.prompt_pcime_paludisme_48h[ascId]["dhis2"];
      chwsData.prompt_pcime_paludisme_72h.dhis2 += allDatasFound.prompt_pcime_paludisme_72h[ascId]["dhis2"];

      chwsData.prompt_pcime_pneumonie_24h.dhis2 += allDatasFound.prompt_pcime_pneumonie_24h[ascId]["dhis2"];
      chwsData.prompt_pcime_pneumonie_48h.dhis2 += allDatasFound.prompt_pcime_pneumonie_48h[ascId]["dhis2"];
      chwsData.prompt_pcime_pneumonie_72h.dhis2 += allDatasFound.prompt_pcime_pneumonie_72h[ascId]["dhis2"];

      chwsData.femmes_enceintes_NC.dhis2 += allDatasFound.femme_enceinte_NC[ascId]["dhis2"];
      chwsData.femme_postpartum_NC.dhis2 += allDatasFound.femme_postpartum_NC[ascId]["dhis2"];
      chwsData.test_de_grossesse.dhis2 += allDatasFound.test_de_grossesse[ascId]["dhis2"];
    }

    chwsData.sum_total_vad = chwsData.total_vad.tonoudayo + chwsData.total_vad.dhis2;
    chwsData.sum_soins_pcime = chwsData.soins_pcime.tonoudayo + chwsData.soins_pcime.dhis2;
    chwsData.sum_suivi_pcime = chwsData.suivi_pcime.tonoudayo + chwsData.suivi_pcime.dhis2;
    chwsData.sum_pcime = chwsData.sum_soins_suivi.tonoudayo + chwsData.sum_soins_suivi.dhis2;
    chwsData.sum_femmes_enceinte = chwsData.femmes_enceinte.tonoudayo + chwsData.femmes_enceinte.dhis2;
    chwsData.sum_femmes_postpartum = chwsData.femmes_postpartum.tonoudayo + chwsData.femmes_postpartum.dhis2;
    chwsData.sum_enceinte_postpartum = { tonoudayo: chwsData.femmes_enceinte.tonoudayo + chwsData.femmes_postpartum.tonoudayo, dhis2: chwsData.femmes_enceinte.dhis2 + chwsData.femmes_postpartum.dhis2 };
    chwsData.sum_maternel = chwsData.sum_enceinte_postpartum.tonoudayo + chwsData.sum_enceinte_postpartum.dhis2;
    chwsData.sum_home_visit = chwsData.home_visit.tonoudayo + chwsData.home_visit.dhis2;
    chwsData.sum_pf = chwsData.pf.tonoudayo + chwsData.pf.dhis2;
    chwsData.sum_reference_pf = chwsData.reference_pf.tonoudayo + chwsData.reference_pf.dhis2;
    chwsData.sum_reference_pcime = chwsData.reference_pcime.tonoudayo + chwsData.reference_pcime.dhis2;
    chwsData.sum_reference_femmes_enceinte_postpartum = chwsData.reference_femmes_enceinte_postpartum.tonoudayo + chwsData.reference_femmes_enceinte_postpartum.dhis2;
    chwsData.sum_diarrhee_pcime = chwsData.diarrhee_pcime.tonoudayo + chwsData.diarrhee_pcime.dhis2;
    chwsData.sum_paludisme_pcime = chwsData.paludisme_pcime.tonoudayo + chwsData.paludisme_pcime.dhis2;
    chwsData.sum_pneumonie_pcime = chwsData.pneumonie_pcime.tonoudayo + chwsData.pneumonie_pcime.dhis2;
    chwsData.sum_malnutrition_pcime = chwsData.malnutrition_pcime.tonoudayo + chwsData.malnutrition_pcime.dhis2;
    chwsData.sum_prompt_pcime_diarrhee_24h = chwsData.prompt_pcime_diarrhee_24h.tonoudayo + chwsData.prompt_pcime_diarrhee_24h.dhis2;
    chwsData.sum_prompt_pcime_diarrhee_48h = chwsData.prompt_pcime_diarrhee_48h.tonoudayo + chwsData.prompt_pcime_diarrhee_48h.dhis2;
    chwsData.sum_prompt_pcime_diarrhee_72h = chwsData.prompt_pcime_diarrhee_72h.tonoudayo + chwsData.prompt_pcime_diarrhee_72h.dhis2;
    chwsData.sum_prompt_pcime_paludisme_24h = chwsData.prompt_pcime_paludisme_24h.tonoudayo + chwsData.prompt_pcime_paludisme_24h.dhis2;
    chwsData.sum_prompt_pcime_paludisme_48h = chwsData.prompt_pcime_paludisme_48h.tonoudayo + chwsData.prompt_pcime_paludisme_48h.dhis2;
    chwsData.sum_prompt_pcime_paludisme_72h = chwsData.prompt_pcime_paludisme_72h.tonoudayo + chwsData.prompt_pcime_paludisme_72h.dhis2;
    chwsData.sum_prompt_pcime_pneumonie_24h = chwsData.prompt_pcime_pneumonie_24h.tonoudayo + chwsData.prompt_pcime_pneumonie_24h.dhis2;
    chwsData.sum_prompt_pcime_pneumonie_48h = chwsData.prompt_pcime_pneumonie_48h.tonoudayo + chwsData.prompt_pcime_pneumonie_48h.dhis2;
    chwsData.sum_prompt_pcime_pneumonie_72h = chwsData.prompt_pcime_pneumonie_72h.tonoudayo + chwsData.prompt_pcime_pneumonie_72h.dhis2;
    chwsData.sum_femmes_enceintes_NC = chwsData.femmes_enceintes_NC.tonoudayo + chwsData.femmes_enceintes_NC.dhis2;
    chwsData.sum_femme_postpartum_NC = chwsData.femme_postpartum_NC.tonoudayo + chwsData.femme_postpartum_NC.dhis2;
    chwsData.sum_test_de_grossesse = chwsData.test_de_grossesse.tonoudayo + chwsData.test_de_grossesse.dhis2;


    allAggragateData.push({ chw: chw, data: chwsData });
  }

  return allAggragateData;
}

export async function FetchMeetingPersons(req: Request, res: Response, next: NextFunction) {
  try {
    const _repo = await GetPersonsRepository();
    const data: Persons[] = await _repo.find();
    if (!data) return res.status(201).json({ status: 201, data: 'No data found !' });
    return res.status(200).json({ status: 200, data: data });
  } catch (e) {
    return res.status(201).json({ status: 201, data: 'No data found !' });
  }
}

export async function FetchMeetingTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const _repo = await GetTeamsRepository();
    const data: Teams[] = await _repo.find();
    if (!data) return res.status(201).json({ status: 201, data: 'No data found !' });
    return res.status(200).json({ status: 200, data: data });
  } catch (e) {
    return res.status(201).json({ status: 201, data: 'No data found !' });
  }
}

export async function FetchMeetingReports(req: Request, res: Response, next: NextFunction) {
  try {
    const _repo = await GetMeetingReportDataRepository();
    const data = await _repo.find({ where: { team: { id: req.body.team } } });
    if (!data) return res.status(201).json({ status: 201, data: 'No data found !' });
    return res.status(200).json({ status: 200, data: data });
  } catch (e) {
    return res.status(201).json({ status: 201, data: 'No data found !' });
  }
}

export async function SaveOrUpdateMeetingTeam(req: Request, res: Response, next: NextFunction) {
  const _repo = await GetTeamsRepository();
  const _sync = new Teams();
  try {

    const id: any = req.body.id;

    _sync.id = id;
    _sync.name = req.body.name;
    _sync.show = req.body.show == true;

    if (id && notEmpty(id)) {
      _sync.updatedBy = req.body.userId;
      _sync.updatedAt = new Date();
    } else {
      _sync.createdBy = req.body.userId;
      // _sync.createdAt = new Date();
    }
    const data = await _repo.save(_sync);
    if (!data) return res.status(201).json({ status: 201, data: 'No data found !' });
    return res.status(200).json({ status: 200, data: data });
  } catch (error) {
    return res.status(201).json({ status: 201, data: 'No data found !' });
  }
}

export async function SaveOrUpdateMeetingPerson(req: Request, res: Response, next: NextFunction) {
  const _repo = await GetPersonsRepository();
  const _sync = new Persons();
  try {

    const id: any = req.body.id;

    _sync.id = id;
    // _sync.team = req.body.team;
    _sync.name = req.body.name;
    _sync.email = req.body.email;
    if (id && notEmpty(id)) {
      _sync.updatedBy = req.body.userId;
      _sync.updatedAt = new Date();
    } else {
      _sync.createdBy = req.body.userId;
      // _sync.createdAt = new Date();
    }
    const data = await _repo.save(_sync);
    if (!data) return res.status(201).json({ status: 201, data: 'No data found !' });
    return res.status(200).json({ status: 200, data: data });
  } catch (error) {
    return res.status(201).json({ status: 201, data: 'No data found !' });
  }
}

export async function SaveOrUpdateMeetingReports(req: Request, res: Response, next: NextFunction) {
  const _repo = await GetMeetingReportDataRepository();
  const _sync = new MeetingReportData();
  try {
    const id: any = req.body.id;

    _sync.id = id;
    _sync.title = req.body.title;
    _sync.date = req.body.date;
    _sync.start_hour = req.body.start_hour;
    _sync.end_hour = req.body.end_hour;
    _sync.agenda = req.body.agenda;
    _sync.discussion_topics = req.body.discussion_topics;
    _sync.next_steps = req.body.next_steps;
    _sync.recommandations = req.body.recommandations;
    _sync.team = req.body.team;
    _sync.present_persons_ids = req.body.present_persons_ids;
    _sync.absent_persons_ids = req.body.absent_persons_ids;
    _sync.other_persons = req.body.other_persons;
    _sync.doNotUpdate = req.body.doNotUpdate;
    if (id && notEmpty(id)) {
      _sync.updatedBy = req.body.userId;
      _sync.updatedAt = new Date();
    } else {
      _sync.createdBy = req.body.userId;
      _sync.createdAt = new Date();
    }

    await _repo.save(_sync);
    const data = await _repo.find({ where: { team: { id: req.body.team } } });

    if (!data) return res.status(201).json({ status: 201, data: 'No data found !' });
    return res.status(200).json({ status: 200, data: data });
  } catch (error) {
    return res.status(201).json({ status: 201, data: 'No data found !' });
  }
}

export async function DeleteMeetingReport(req: Request, res: Response, next: NextFunction) {
  try {
    const _repo = await GetMeetingReportDataRepository();
    const data = await _repo.delete({ id: req.body.dataId });
    return res.status(200).json({ status: 200, data: data });
  } catch (error) {
    return res.status(201).json({ status: 201, data: 'No data found !' });
  }
}

export async function DeleteMeetingPerson(req: Request, res: Response, next: NextFunction) {
  try {
    const _repo = await GetPersonsRepository();
    const data = await _repo.delete({ id: req.body.dataId });
    return res.status(200).json({ status: 200, data: data });
  } catch (error) {
    return res.status(201).json({ status: 201, data: 'No data found !' });
  }
}

export async function DeleteMeetingTeams(req: Request, res: Response, next: NextFunction) {
  const _repo = await GetTeamsRepository();
  const _sync = new Teams();
  try {
    _sync.id = req.body.dataId;
    _sync.show = false;
    const data = await _repo.save(_sync);
    if (!data) return res.status(201).json({ status: 201, data: 'No data found !' });
    return res.status(200).json({ status: 200, data: data });
  } catch (error) {
    return res.status(201).json({ status: 201, data: 'No data found !' });
  }
}

export async function deleteChwsData(req: Request, res: Response, next: NextFunction) { }

