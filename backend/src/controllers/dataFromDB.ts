import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import { Between, In } from "typeorm";
import { ChtOutPutData, DataIndicators } from "../entity/DataAggragate";
import { getChwsDataSyncRepository, ChwsData, Chws, getFamilySyncRepository, Families, getChwsSyncRepository, ChwsDrug, getChwsDrugSyncRepository, getChwsDrugUpdateSyncRepository, ChwsDrugUpdate, GetPersonsRepository, Persons, Teams, GetTeamsRepository, MeetingReportData, GetMeetingReportDataRepository, Districts, Sites, getSiteSyncRepository, getDistrictSyncRepository, getDrugChwYearCmmSyncRepository, DrugChwYearCmm } from "../entity/Sync";
import { Consts } from "../utils/constantes";
import { notEmpty } from "../utils/functions";
import { getChws } from "./orgUnitsFromDB ";
import { ChwsDrugData, ChwsDrugQuantityInfo, PatologieData } from "../utils/appInterface";
import { GetPreviousDate, GetPreviousYearMonth, YearMonthBetween21And20, getDateInFormat, isBetween } from "../utils/date-utils";

const request = require('request');
// const fetch = require('node-fetch');

const MEG_FORMS: string[] = ["drug_movements", "drug_quantities", "pcime_c_asc", "pregnancy_family_planning", "fp_follow_up_renewal"];
const quantities: ChwsDrugQuantityInfo = {
  month_quantity_beginning: 0,
  month_quantity_received: 0,
  month_total_quantity: 0,
  month_consumption: 0,
  theoretical_quantity: 0,
  inventory_quantity: 0,
  inventory_variance: 0,
  year_chw_cmm: 0,
  theoretical_quantity_to_order: 0,
  quantity_to_order: 0,
  quantity_validated: 0,
  delivered_quantity: 0,
  satisfaction_rate: '',
  lending: '',
  lending_quantity: 0,
  lending_chws_code: '',
  borrowing: '',
  borrowing_quantity: 0,
  borrowing_chws_code: '',
  quantity_loss: 0,
  quantity_damaged: 0,
  quantity_broken: 0,
  quantity_expired: 0,
  other_quantity: 0,
  comments: "",
  observations: ""
};

const dataFields: { id: string, name: string, index: number }[] = [
  { id: "alben_400", name: "Albendazole_400_mg_cp_1", index: 1 },
  { id: "amox_250", name: "Amoxiciline_250_mg_2", index: 2 },
  { id: "amox_500", name: "Amoxiciline_500_mg_3", index: 3 },
  { id: "lumartem", name: "Artemether_Lumefantrine_20_120mg_cp_4", index: 4 },
  { id: "pills", name: "Oral_Combination_Pills_5", index: 5 },
  { id: "para_250", name: "Paracetamol_250_mg_6", index: 6 },
  { id: "para_500", name: "Paracetamol_500_mg_7", index: 7 },
  { id: "pregnancy_test", name: "Pregnancy_Test_8", index: 8 },
  { id: "sayana", name: "Sayana_Press_9", index: 9 },
  { id: "sro", name: "SRO_10", index: 10 },
  { id: "tdr", name: "TDR_11", index: 11 },
  { id: "vit_A1", name: "Vitamine_A_100000UI_12", index: 12 },
  { id: "vit_A2", name: "Vitamine_A_200000UI_13", index: 13 },
  { id: "zinc", name: "Zinc_14", index: 14 }
];

function YearCmmMonthStart(year: number, startMonth: string): { name: string, interval: string[] } {
  const y = parseInt(`${year}`);
  const lY = parseInt(`${year}`) - 1;
  const nY = parseInt(`${year}`) + 1;
  const months: any = {};

  months[`janvier_decembre_${y}`] = {
    name: `Janvier - Décembre ${y}`,
    interval: [`01-${y}`, `02-${y}`, `03-${y}`, `04-${y}`, `05-${y}`, `06-${y}`, `07-${y}`, `08-${y}`, `09-${y}`, `10-${y}`, `11-${y}`, `12-${y}`]
  };

  months[`juillet_${y}_juin_${nY}`] = {
    name: `Juillet ${y} - Juin ${nY}`,
    interval: [`07-${y}`, `08-${y}`, `09-${y}`, `10-${y}`, `11-${y}`, `12-${y}`, `01-${nY}`, `02-${nY}`, `03-${nY}`, `04-${nY}`, `05-${nY}`, `06-${nY}`]
  };

  months[`juillet_${lY}_juin_${y}`] = {
    name: `Juillet ${lY} - Juin ${y}`,
    interval: [`07-${lY}`, `08-${lY}`, `09-${lY}`, `10-${lY}`, `11-${lY}`, `12-${lY}`, `01-${y}`, `02-${y}`, `03-${y}`, `04-${y}`, `05-${y}`, `06-${y}`]
  };

  return months[startMonth];
}

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

export async function getChwsDataWithParams(req: Request, res: Response, next: NextFunction, onlyData: boolean = false, filter?: { start_date?: string, end_date?: string, forms?: string[], sources?: string[] }): Promise<any> {
  var respData: { status: number, data: any };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    respData = { status: 201, data: 'Informations you provided are not valid' }
    return onlyData ? respData : res.status(201).json(respData);
  }
  const errorMsg: string = "Your request provides was rejected !";
  try {
    const repository = await getChwsDataSyncRepository();

    const start_date = (filter?.start_date ?? '') != '' ? filter?.start_date : req.body.start_date;
    const end_date = (filter?.end_date ?? '') != '' ? filter?.end_date : req.body.end_date;
    const sources = (filter?.sources ?? '') != '' ? filter?.sources : req.body.sources;
    const forms = (filter?.forms ?? '') != '' ? filter?.forms : req.body.forms;

    var allSync: ChwsData[] = await repository.find({
      where: {
        id: notEmpty(req.body.id) ? req.body.id : notEmpty(req.params.id) ? req.params.id : undefined,
        reported_date: notEmpty(start_date) && notEmpty(end_date) ? Between(start_date, end_date) : undefined,
        form: notEmpty(forms) ? In(forms) : undefined,
        source: notEmpty(sources) ? In(sources) : undefined,
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

export async function getChwsDrugWithParams(req: Request, res: Response, next: NextFunction, onlyData: boolean = false): Promise<any> {
  var msg = 'Not data found with parametter!';
  var respData: { previous: { status: number, data: any }, current: { status: number, data: any } } = { previous: { status: 201, data: msg }, current: { status: 201, data: msg } };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    msg = 'Informations you provided are not valid';
    respData = { previous: { status: 201, data: msg }, current: { status: 201, data: msg } };
    return onlyData ? respData : res.status(201).json(respData);
  }
  const errorMsg: string = "Your request provides was rejected !";
  try {
    const repository = await getChwsDrugSyncRepository();
    const CurrentSyncs: ChwsDrug[] = await repository.find({
      where: {
        id: notEmpty(req.body.id) ? req.body.id : notEmpty(req.params.id) ? req.params.id : undefined,
        year: notEmpty(req.body.year) ? req.body.year : undefined,
        month: notEmpty(req.body.month) ? req.body.month : undefined,
        form: notEmpty(req.body.forms) ? In(req.body.forms) : undefined,
        source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
        district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
        site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
        zone: notEmpty(req.body.zones) ? { id: In(req.body.zones) } : undefined,
        chw: notEmpty(req.body.chws) ? { id: In(req.body.chws) } : undefined
      }
    });


    // const prev_start_date = GetPreviousDate(req.body.start_date);
    // const prev_end_date = GetPreviousDate(req.body.end_date);

    const ym = GetPreviousYearMonth(req.body.year, req.body.month);

    const PreviousSyncs: ChwsDrug[] = await repository.find({
      where: {
        id: notEmpty(req.body.id) ? req.body.id : notEmpty(req.params.id) ? req.params.id : undefined,
        year: notEmpty(ym.year) ? ym.year : undefined,
        month: notEmpty(ym.month) ? ym.month : undefined,
        form: notEmpty(req.body.forms) ? In(req.body.forms) : undefined,
        source: notEmpty(req.body.sources) ? In(req.body.sources) : undefined,
        district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
        site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
        zone: notEmpty(req.body.zones) ? { id: In(req.body.zones) } : undefined,
        chw: notEmpty(req.body.chws) ? { id: In(req.body.chws) } : undefined
      }
    });

    if (CurrentSyncs) respData.current = { status: 200, data: CurrentSyncs };
    if (PreviousSyncs) respData.previous = { status: 200, data: PreviousSyncs };

  }
  catch (err) {
    // return next(err);
    respData.current = { status: 201, data: errorMsg };
    respData.previous = { status: 201, data: errorMsg };
  }
  return onlyData ? respData : res.status(respData.current.status).json(respData);
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
        site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
        zone: notEmpty(req.body.zones) ? { id: In(req.body.zones) } : undefined,
        chw: notEmpty(req.body.chws) ? { id: In(req.body.chws) } : undefined,
        year: notEmpty(req.body.year) ? req.body.year : undefined,
        month: notEmpty(req.body.month) ? req.body.month : undefined,
        drug_index: notEmpty(req.body.drugs_index) ? In(req.body.drugs_index) : undefined
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

export async function getChwsDrugYearCmmWithParams(req: Request, res: Response, next: NextFunction, onlyData: boolean = false): Promise<any> {
  var respData: { status: number, data: any };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    respData = { status: 201, data: 'Informations you provided are not valid' }
    return onlyData ? respData : res.status(201).json(respData);
  }
  const errorMsg: string = "Your request provides was rejected !";
  try {
    const repository = await getDrugChwYearCmmSyncRepository();
    var allSync: DrugChwYearCmm[] = await repository.find({
      where: {
        id: notEmpty(req.body.id) ? req.body.id : notEmpty(req.params.id) ? req.params.id : undefined,
        district: notEmpty(req.body.districts) ? { id: In(req.body.districts) } : undefined,
        site: notEmpty(req.body.sites) ? { id: In(req.body.sites) } : undefined,
        zone: notEmpty(req.body.zones) ? { id: In(req.body.zones) } : undefined,
        chw: notEmpty(req.body.chws) ? { id: In(req.body.chws) } : undefined,
        // year: notEmpty(req.body.year) ? req.body.year : undefined,
        cmm_start_year_month: notEmpty(req.body.cmm_start_year_month) ? req.body.cmm_start_year_month : undefined,
        drug_index: notEmpty(req.body.drugs_index) ? In(req.body.drugs_index) : undefined
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

// export async function getChwsDrugUpdatedWithCoustomParams(req: { districts?: string[], sites?: string[], zones?: string[], chws?: string[], years?: number[], months?: string[], drug_index?: number[] }): Promise<ChwsDrugUpdate[] | undefined> {
//   try {
//     const repository = await getChwsDrugUpdateSyncRepository();
//     const allSync = await repository.find({
//       where: {
//         district: notEmpty(req.districts) ? { id: In(req.districts!) } : undefined,
//         site: notEmpty(req.sites) ? { id: In(req.sites!) } : undefined,
//         zone: notEmpty(req.zones) ? { id: In(req.zones!) } : undefined,
//         chw: notEmpty(req.chws) ? { id: In(req.chws!) } : undefined,
//         year: notEmpty(req.years) ? In(req.years!) : undefined,
//         month: notEmpty(req.months) ? In(req.months!) : undefined,
//         drug_index: notEmpty(req.drug_index) ? In(req.drug_index!) : undefined
//       }
//     });
//     return allSync;
//   } catch (err) {
//     return undefined;
//   }

// }

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
// ###################################### PER CHW ######################################
export async function fetchIhDrugDataPerChw(req: Request, res: Response, next: NextFunction) {
  const outPut = await getIhDrugArrayDataPerChw(req, res, next)
  return res.status(outPut.status).json(outPut);
}
export async function getIhDrugArrayDataPerChw(req: Request, res: Response, next: NextFunction, Chw: Chws | undefined = undefined): Promise<{ status: number, data: { chwId: any, chw: Chws, drugData: ChwsDrugData, patologieData: PatologieData }[] | string | undefined; }> {
  // const dateArray = req.body.end_date.split('-');
  req.body.forms = MEG_FORMS;
  req.body.sources = ['Tonoudayo'];
  // req.body.year = parseInt(dateArray[0]);
  // req.body.month = dateArray[1];
  const year = req.body.year;
  const month = req.body.month;

  const chwsChtDataFilter = {
    start_date: GetPreviousDate(`${year}-${month}-21`),
    end_date: `${year}-${month}-20`,
    sources: ["Tonoudayo", "dhis2"],
    forms: ["pcime_c_asc", "PCIME"],
  };

  const chwsDrug = await getChwsDrugWithParams(req, res, next, true);
  const drugUpdated = await getChwsDrugUpdatedWithParams(req, res, next, true);
  const drugYearCmm = await getChwsDrugYearCmmWithParams(req, res, next, true);
  const chwsChtData = await getChwsDataWithParams(req, res, next, true, chwsChtDataFilter);

  var chwsDrugFinalOut: { chwId: any, chw: Chws, drugData: ChwsDrugData, patologieData: PatologieData }[] = [];

  if (Chw) {
    if (chwsDrug.current.status == 200 && chwsDrug.previous.status == 200 && drugUpdated.status == 200 && drugYearCmm.status == 200 && chwsChtData.status == 200) {
      const outPut = await getChwsDrugQantityPerChw(chwsDrug.current.data, chwsDrug.previous.data, drugUpdated.data, drugYearCmm.data, chwsChtData.data, Chw, req);
      chwsDrugFinalOut.push({ chwId: Chw.id, chw: Chw, drugData: outPut.drugData, patologieData: outPut.patologieData });
    }
  } else {
    const chws = await getChws(req, res, next, true);
    if (chwsDrug.current.status == 200 && chwsDrug.previous.status == 200 && chws.status == 200 && drugUpdated.status == 200 && drugYearCmm.status == 200 && chwsChtData.status == 200 && chws.status == 200) {
      var confirm: string[] = []
      for (let i = 0; i < chws.data.length; i++) {
        const asc = chws.data[i];
        if (asc.id && asc.id != '' && !confirm.includes(asc.id!)) {
          const outPut = await getChwsDrugQantityPerChw(chwsDrug.current.data, chwsDrug.previous.data, drugUpdated.data, drugYearCmm.data, chwsChtData.data, asc, req);
          chwsDrugFinalOut.push({ chwId: asc.id, chw: asc, drugData: outPut.drugData, patologieData: outPut.patologieData });
          confirm.push(asc.id!);
        }
      }
    }
  }

  if (!chwsDrugFinalOut) return { status: 201, data: 'No data found !' };
  return { status: 200, data: chwsDrugFinalOut };
}
export async function updateDrugPerChw(req: Request, res: Response, next: NextFunction) {

  const { district, site, chw, year, month, drug_index, drug_name, quantity_validated, delivered_quantity, observations, userId } = req.body;

  const _repoChwsDrugUpdate = await getChwsDrugUpdateSyncRepository();
  const _chwRepo = await getChwsSyncRepository();
  try {
    if (district && site && chw && year && month && drug_index) {

      const _sync = new ChwsDrugUpdate();
      const id = `${chw}-${year}-${month}-${drug_index}`;
      const dataFound = await _repoChwsDrugUpdate.findOneBy({ id: id });
      if (dataFound) {
        _sync.updatedBy = userId;
        _sync.updatedAt = new Date();
      } else {
        _sync.createdBy = userId;
        _sync.createdAt = new Date();
      }
      _sync.id = id;
      _sync.district = district;
      _sync.site = site;
      _sync.chw = chw;
      _sync.year = year;
      _sync.month = month;
      _sync.drug_index = drug_index;
      _sync.drug_name = drug_name;
      _sync.quantity_validated = quantity_validated;
      _sync.delivered_quantity = delivered_quantity;
      _sync.observations = observations;
      await _repoChwsDrugUpdate.save(_sync);

      // req.body.start_date = GetPreviousDate(`${year}-${month}-21`);
      // req.body.end_date = `${year}-${month}-20`;
      req.body.year = year;
      req.body.month = month;
      req.body.districts = [district];
      req.body.sites = [site];
      req.body.chws = [chw];

      var Chw = await _chwRepo.findOneBy({ id: chw });
      if (Chw) {
        const updateOutPut = await getIhDrugArrayDataPerChw(req, res, next, Chw);
        if (updateOutPut) return res.status(updateOutPut.status).json(updateOutPut);
      }
    }
    return res.status(201).json({ status: 201, data: 'No data found !' });

  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    return res.status(err.statusCode).json({ status: 201, data: 'No data found !' });
  }
}
export async function updateDrugYearCmmPerChw(req: Request, res: Response, next: NextFunction) {

  const { district, site, chw, year, drug_index, drug_name, year_chw_cmm, cmm_start_year_month, userId } = req.body;
  try {
    if (district && site && chw && drug_index && cmm_start_year_month) {
      const _repoDrugChwYearCmm = await getDrugChwYearCmmSyncRepository();
      const _sync = new DrugChwYearCmm();
      const id = `${chw}-${drug_index}-${cmm_start_year_month}`;
      const dataFound = await _repoDrugChwYearCmm.findOneBy({ id: id });
      if (dataFound) {
        _sync.updatedBy = userId;
        _sync.updatedAt = new Date();
      } else {
        _sync.createdBy = userId;
        _sync.createdAt = new Date();
      }
      _sync.id = id;
      _sync.district = district;
      _sync.site = site;
      _sync.chw = chw;
      _sync.cmm_start_year_month = cmm_start_year_month;

      _sync.cmm_year_month_list = YearCmmMonthStart(year, cmm_start_year_month)?.interval;
      _sync.drug_index = drug_index;
      _sync.drug_name = drug_name;
      _sync.year_chw_cmm = year_chw_cmm;
      await _repoDrugChwYearCmm.save(_sync);

    }
    // return res.status(201).json({ status: 201, data: 'No data found !' });
    return res.status(200).json({ status: 200, data: 'success' });
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    return res.status(err.statusCode).json({ status: 201, data: 'No data found !' });
  }
}
async function getChwsDrugQantityPerChw(currentData: ChwsDrug[], previousData: ChwsDrug[], drugUpdated: ChwsDrugUpdate[], drugCmm: DrugChwYearCmm[], chwsChtData: ChwsData[], Chw: Chws, req: Request): Promise<{ drugData: ChwsDrugData, patologieData: PatologieData }> {
  // const { start_date, end_date, sources, districts, sites, chws } = req.body;

  const outData: any = {
    Albendazole_400_mg_cp_1: { ...quantities },
    Amoxiciline_250_mg_2: { ...quantities },
    Amoxiciline_500_mg_3: { ...quantities },
    Artemether_Lumefantrine_20_120mg_cp_4: { ...quantities },
    Oral_Combination_Pills_5: { ...quantities },
    Paracetamol_250_mg_6: { ...quantities },
    Paracetamol_500_mg_7: { ...quantities },
    Pregnancy_Test_8: { ...quantities },
    Sayana_Press_9: { ...quantities },
    SRO_10: { ...quantities },
    TDR_11: { ...quantities },
    Vitamine_A_100000UI_12: { ...quantities },
    Vitamine_A_200000UI_13: { ...quantities },
    Zinc_14: { ...quantities },
  };

  var patologieData: PatologieData = {
    diarrhee_pcime: {},
    paludisme_pcime: {},
    pneumonie_pcime: {},
    malnutrition_pcime: {}
  }

  for (let i = 0; i < currentData.length; i++) {
    const data: any = currentData[i];
    if (notEmpty(data?.source) && notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {

      const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
      const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
      const idChwValid: boolean = data?.chw?.id == Chw.id;

      if (idDistrictValid && idSiteValid && idChwValid) {

        if (data.form == "drug_quantities") {
          for (const field of dataFields) {
            if (data.activity_type == "c_qty_received" && data[field.id]) {
              outData[field.name].month_quantity_received += data[field.id];
            }
            if (data.activity_type == "c_qty_counted" && data[field.id]) {
              outData[field.name].inventory_quantity += data[field.id];
            }
            if (data.activity_type == "c_qty_order" && data[field.id]) {
              outData[field.name].quantity_to_order += data[field.id];
            }
          }
        }

        if (data.form == "drug_movements") {
          for (const field of dataFields) {
            if (data.activity_type == "c_med_loss" && data[field.id]) {
              outData[field.name].quantity_loss += data[field.id];
            }
            if (data.activity_type == "c_med_expired" && data[field.id]) {
              outData[field.name].quantity_expired += data[field.id];
            }

            if (data.activity_type == "c_med_borrowing" && data[field.id]) {
              outData[field.name].borrowing_quantity += data[field.id];
              if (outData[field.name].borrowing_quantity && outData[field.name].borrowing_quantity != 0) {
                if ((data.borrowing_chws_info ?? '') != '') {
                  const bcc = outData[field.name].borrowing_chws_code != '' ? '|||' : '';
                  outData[field.name].borrowing_chws_code! += `${bcc}${data.borrowing_chws_info}@@@${data[field.id]}@@@${data.reported_date}`;
                  outData[field.name].borrowing = 'Emprunt';
                }
              }
            }
            if (data.activity_type == "c_med_loan" && data[field.id]) {
              outData[field.name].lending_quantity += data[field.id];
              if (outData[field.name].lending_quantity && outData[field.name].lending_quantity != 0) {
                if ((data.lending_chws_info ?? '') != '') {
                  const lcc = outData[field.name].lending_chws_code != '' ? '|||' : '';
                  outData[field.name].lending_chws_code! += `${lcc}${data.lending_chws_info}@@@${data[field.id]}@@@${data.reported_date}`;
                  outData[field.name].lending = 'Prêt';
                }
              }
            }
            if (data.activity_type == "c_med_damaged" && data[field.id]) {
              outData[field.name].quantity_damaged += data[field.id];
            }
            if (data.activity_type == "c_med_broken" && data[field.id]) {
              outData[field.name].quantity_broken += data[field.id];
            }
            if (data.activity_type == "c_others" && data[field.id]) {
              outData[field.name].other_quantity += data[field.id];
            }
            outData[field.name].comments = data.comments ?? '';
          }
        }

        if (["pcime_c_asc", "pregnancy_family_planning", "fp_follow_up_renewal"].includes(data.form!)) {
          for (const field of dataFields) {
            if (data[field.id]) {
              outData[field.name].month_consumption += data[field.id];
            }
          }
        }

      }
    }
  }

  // ################################################
  for (let i = 0; i < previousData.length; i++) {
    const data: any = previousData[i];
    if (notEmpty(data?.source) && notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {
      const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
      const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
      const idChwValid: boolean = data?.chw?.id == Chw.id;

      if (idDistrictValid && idSiteValid && idChwValid && data.form == "drug_quantities" && data.activity_type == "c_qty_counted") {
        for (const field of dataFields) {
          if (data[field.id]) {
            outData[field.name].month_quantity_beginning += data[field.id];
          }
        }
      }
    }
  }

  // ################################################
  for (let i = 0; i < drugUpdated.length; i++) {
    const data = drugUpdated[i];
    if (notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {
      const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
      const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
      const idChwValid: boolean = data?.chw?.id == Chw.id;

      if (idDistrictValid && idSiteValid && idChwValid) {
        for (const field of dataFields) {
          if (data.drug_index == field.index) {
            outData[field.name].quantity_validated! += data.quantity_validated ?? 0;
            outData[field.name].delivered_quantity! += data.delivered_quantity ?? 0;
            outData[field.name].observations += data.observations ?? '';
          }
        }
      }
    }
  }

  // ################################################
  for (let i = 0; i < drugCmm.length; i++) {
    const data = drugCmm[i];
    if (notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {
      const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
      const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
      const idChwValid: boolean = data?.chw?.id == Chw.id;

      if (idDistrictValid && idSiteValid && idChwValid) {
        for (const field of dataFields) {
          if (data.drug_index == field.index) {
            outData[field.name].year_chw_cmm! += data.year_chw_cmm ?? 0;
          }
        }
      }
    }
  }

  // ################################################
  for (let i = 0; i < chwsChtData.length; i++) {
    const data: ChwsData = chwsChtData[i];
    if (data) {
      const form = data.form;
      const field = data.fields;
      const chw: string = data.chw?.id ?? '';

      if (notEmpty(data?.source) && notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {

        const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
        const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
        const idChwValid: boolean = data?.chw?.id == Chw.id;

        if (idDistrictValid && idSiteValid && idChwValid) {

          if (data.source == 'Tonoudayo' && form === "pcime_c_asc") {
            if (field["has_diarrhea"] == "true") {
              if (!(data.reported_date in patologieData.diarrhee_pcime)) {
                patologieData.diarrhee_pcime[data.reported_date] = 0;
              }
              patologieData.diarrhee_pcime[data.reported_date] += 1;
            }
            if (field["fever_with_malaria"] == "true") {
              if (!(data.reported_date in patologieData.paludisme_pcime)) {
                patologieData.paludisme_pcime[data.reported_date] = 0;
              }
              patologieData.paludisme_pcime[data.reported_date] += 1;
            }
            if (field["has_pneumonia"] == "true") {
              if (!(data.reported_date in patologieData.pneumonie_pcime)) {
                patologieData.pneumonie_pcime[data.reported_date] = 0;
              }
              patologieData.pneumonie_pcime[data.reported_date] += 1;
            }
            if (field["has_malnutrition"] == "true") {
              if (!(data.reported_date in patologieData.malnutrition_pcime)) {
                patologieData.malnutrition_pcime[data.reported_date] = 0;
              }
              patologieData.malnutrition_pcime[data.reported_date] += 1;
            }
          }

          if (data.source == 'dhis2' && form === "PCIME" && data.fields['zNldrz5EUPR'] == 'Soins') {
            if (data.fields['NPHYf8WAR9l'] == 'true') {
              if (!(data.reported_date in patologieData.diarrhee_pcime)) {
                patologieData.diarrhee_pcime[data.reported_date] = 0;
              }
              patologieData.diarrhee_pcime[data.reported_date] += 1;
            }
            if (data.fields['Gl7HGePuIi3'] == 'true') {
              if (!(data.reported_date in patologieData.paludisme_pcime)) {
                patologieData.paludisme_pcime[data.reported_date] = 0;
              }
              patologieData.paludisme_pcime[data.reported_date] += 1;
            }
            if (data.fields['LP33fMJRWrT'] == 'true') {
              if (!(data.reported_date in patologieData.pneumonie_pcime)) {
                patologieData.pneumonie_pcime[data.reported_date] = 0;
              }
              patologieData.pneumonie_pcime[data.reported_date] += 1;
            }
            if (data.fields['y84NNODZ705'] == 'true') {
              if (!(data.reported_date in patologieData.malnutrition_pcime)) {
                patologieData.malnutrition_pcime[data.reported_date] = 0;
              }
              patologieData.malnutrition_pcime[data.reported_date] += 1;
            }
          }
        }
      }
    }
  }

  for (const field of dataFields) {
    outData[field.name].month_total_quantity = outData[field.name].month_quantity_beginning + outData[field.name].month_quantity_received;
    outData[field.name].theoretical_quantity = outData[field.name].month_total_quantity - outData[field.name].month_consumption;
    outData[field.name].inventory_variance = outData[field.name].inventory_quantity - outData[field.name].theoretical_quantity;

    if (outData[field.name].delivered_quantity != 0 && outData[field.name].quantity_validated != 0) {
      const rate = outData[field.name].delivered_quantity! / outData[field.name].quantity_validated!;
      outData[field.name].satisfaction_rate = !Number.isNaN(rate) ? `${(rate * 100).toFixed(2)} %` : 'NA';
    } else {
      outData[field.name].satisfaction_rate = undefined;
    }

    outData[field.name].theoretical_quantity_to_order = outData[field.name].year_chw_cmm - outData[field.name].inventory_quantity
  }

  return { drugData: outData as ChwsDrugData, patologieData: patologieData };
}


// ###################################### PER SELECTED ######################################
export async function fetchIhDrugDataPerSelected(req: Request, res: Response, next: NextFunction) {
  const outPut = await getIhDrugArrayDataPerSelected(req, res, next)
  return res.status(outPut.status).json(outPut);
}

export async function getIhDrugArrayDataPerSelected(req: Request, res: Response, next: NextFunction): Promise<{ status: number, data: { cibleId: any, cible: Districts | Sites | Chws, drugData: ChwsDrugData, patologieData: PatologieData } | string | undefined; }> {
  // const dateArray = req.body.end_date.split('-');
  req.body.forms = MEG_FORMS;
  req.body.sources = ['Tonoudayo'];
  const year = req.body.year;
  const month = req.body.month;
  // req.body.year = parseInt(dateArray[0]);
  // req.body.month = dateArray[1];

  const chwsChtDataFilter = {
    start_date: GetPreviousDate(`${year}-${month}-21`),
    end_date: `${year}-${month}-20`,
    sources: ["Tonoudayo", "dhis2"],
    forms: ["pcime_c_asc", "PCIME"],
  };

  const chwsDrug = await getChwsDrugWithParams(req, res, next, true);
  const drugUpdated = await getChwsDrugUpdatedWithParams(req, res, next, true);
  const drugYearCmm = await getChwsDrugYearCmmWithParams(req, res, next, true);
  const chwsChtData = await getChwsDataWithParams(req, res, next, true, chwsChtDataFilter);
  const chws = await getChws(req, res, next, true);

  var cible: Districts | Sites | Chws | undefined | undefined = undefined;

  if (notEmpty(req.body.districts) && notEmpty(req.body.sites) && notEmpty(req.body.chws)) {
    const _repo = await getChwsSyncRepository();
    cible = (await _repo.findOneBy({ id: req.body.chws[0] })) as Chws;
  } else if (notEmpty(req.body.districts) && notEmpty(req.body.sites) && !notEmpty(req.body.chws)) {
    const _repo = await getSiteSyncRepository();
    cible = await _repo.findOneBy({ id: req.body.sites[0] }) as Sites;
  } else if (notEmpty(req.body.districts) && !notEmpty(req.body.sites) && !notEmpty(req.body.chws)) {
    const _repo = await getDistrictSyncRepository();
    cible = await _repo.findOneBy({ id: req.body.districts[0] }) as Districts;
  }

  if (chwsDrug.current.status == 200 && chwsDrug.previous.status == 200 && chws.status == 200 && drugUpdated.status == 200 && drugYearCmm.status == 200 && chws.status == 200 && chwsChtData.status == 200 && cible) {
    const outPut = await getChwsDrugQantityPerSelected(chwsDrug.current.data, chwsDrug.previous.data, drugUpdated.data, drugYearCmm.data, chwsChtData.data, chws.data, req);
    return { status: 200, data: { cibleId: cible.id, cible: cible, drugData: outPut.drugData, patologieData: outPut.patologieData } };
  } else {
    return { status: 201, data: 'No data found !' };
  }
}

async function getChwsDrugQantityPerSelected(currentData: ChwsDrug[], previousData: ChwsDrug[], drugUpdated: ChwsDrugUpdate[], drugCmm: DrugChwYearCmm[], chwsChtData: ChwsData[], Chws: Chws[], req: Request): Promise<{ drugData: ChwsDrugData, patologieData: PatologieData }> {
  const { year, month } = req.body;
  const outData: any = {
    Albendazole_400_mg_cp_1: { ...quantities },
    Amoxiciline_250_mg_2: { ...quantities },
    Amoxiciline_500_mg_3: { ...quantities },
    Artemether_Lumefantrine_20_120mg_cp_4: { ...quantities },
    Oral_Combination_Pills_5: { ...quantities },
    Paracetamol_250_mg_6: { ...quantities },
    Paracetamol_500_mg_7: { ...quantities },
    Pregnancy_Test_8: { ...quantities },
    Sayana_Press_9: { ...quantities },
    SRO_10: { ...quantities },
    TDR_11: { ...quantities },
    Vitamine_A_100000UI_12: { ...quantities },
    Vitamine_A_200000UI_13: { ...quantities },
    Zinc_14: { ...quantities },
  };

  var patologieData: PatologieData = {
    diarrhee_pcime: {},
    paludisme_pcime: {},
    pneumonie_pcime: {},
    malnutrition_pcime: {}
  }

  for (let i = 0; i < Chws.length; i++) {
    const Chw = Chws[i];
    for (let i = 0; i < currentData.length; i++) {
      const data: any = currentData[i];
      if (notEmpty(data?.source) && notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {

        const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
        const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
        const idChwValid: boolean = data?.chw?.id == Chw.id;

        if (idDistrictValid && idSiteValid && idChwValid) {
          if (data.form == "drug_quantities") {
            for (const field of dataFields) {
              if (data.activity_type == "c_qty_received" && data[field.id]) {
                outData[field.name].month_quantity_received += data[field.id];
              }
              if (data.activity_type == "c_qty_counted" && data[field.id]) {
                outData[field.name].inventory_quantity += data[field.id];
              }
              if (data.activity_type == "c_qty_order" && data[field.id]) {
                outData[field.name].quantity_to_order += data[field.id];
              }
            }
          }

          if (data.form == "drug_movements") {
            for (const field of dataFields) {
              if (data.activity_type == "c_med_loss" && data[field.id]) {
                outData[field.name].quantity_loss += data[field.id];
              }
              if (data.activity_type == "c_med_expired" && data[field.id]) {
                outData[field.name].quantity_expired += data[field.id];
              }

              if (data.activity_type == "c_med_borrowing" && data[field.id]) {
                outData[field.name].borrowing_quantity += data[field.id];
                if (outData[field.name].borrowing_quantity && outData[field.name].borrowing_quantity != 0) {
                  if ((data.borrowing_chws_info ?? '') != '') {
                    const bcc = outData[field.name].borrowing_chws_code != '' ? '|||' : '';
                    outData[field.name].borrowing_chws_code! += `${bcc}${data.borrowing_chws_info}@@@${data[field.id]}@@@${data.reported_date}`;
                    outData[field.name].borrowing = 'Emprunt';
                  }
                }
              }

              if (data.activity_type == "c_med_loan" && data[field.id]) {
                outData[field.name].lending_quantity += data[field.id];
                if (outData[field.name].lending_quantity && outData[field.name].lending_quantity != 0) {
                  if ((data.lending_chws_info ?? '') != '') {
                    const lcc = outData[field.name].lending_chws_code != '' ? '|||' : '';
                    outData[field.name].lending_chws_code! += `${lcc}${data.lending_chws_info}@@@${data[field.id]}@@@${data.reported_date}`;
                    outData[field.name].lending = 'Prêt';
                  }
                }
              }

              if (data.activity_type == "c_med_damaged" && data[field.id]) {
                outData[field.name].quantity_damaged += data[field.id];
              }

              if (data.activity_type == "c_med_broken" && data[field.id]) {
                outData[field.name].quantity_broken += data[field.id];
              }

              if (data.activity_type == "c_others" && data[field.id]) {
                outData[field.name].other_quantity += data[field.id];
              }

              outData[field.name].comments = data.comments ?? '';
            }
          }

          if (["pcime_c_asc", "pregnancy_family_planning", "fp_follow_up_renewal"].includes(data.form!)) {
            for (const field of dataFields) {
              if (data[field.id]) {
                outData[field.name].month_consumption += data[field.id];
              }
            }
          }

        }
      }
    }

    // ################################################

    for (let i = 0; i < previousData.length; i++) {
      const data: any = previousData[i];
      if (notEmpty(data?.source) && notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {
        const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
        const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
        const idChwValid: boolean = data?.chw?.id == Chw.id;

        if (idDistrictValid && idSiteValid && idChwValid && data.form == "drug_quantities" && data.activity_type == "c_qty_counted") {
          for (const field of dataFields) {
            if (data[field.id]) {
              outData[field.name].month_quantity_beginning += data[field.id];
            }
          }
        }
      }
    }

    // ################################################
    for (let i = 0; i < drugUpdated.length; i++) {
      const data = drugUpdated[i];
      if (notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {
        const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
        const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
        const idChwValid: boolean = data?.chw?.id == Chw.id;
        if (idDistrictValid && idSiteValid && idChwValid) {
          for (const field of dataFields) {
            if (data.drug_index == field.index) {
              outData[field.name].quantity_validated! += (data.quantity_validated ?? 0);
              outData[field.name].delivered_quantity! += (data.delivered_quantity ?? 0);
              outData[field.name].observations += (data.observations ?? '');
            }
          }
        }
      }
    }

    // ################################################
    for (let i = 0; i < drugCmm.length; i++) {
      const data = drugCmm[i];

      if ((data.cmm_year_month_list ?? []).includes(`${month}-${year}`)) {
        if (notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {
          const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
          const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
          const idChwValid: boolean = data?.chw?.id == Chw.id;
          if (idDistrictValid && idSiteValid && idChwValid) {
            for (const field of dataFields) {
              if (data.drug_index == field.index) {
                outData[field.name].year_chw_cmm! += (data.year_chw_cmm ?? 0);
              }
            }
          }
        }
      }
    }

    // ################################################
    for (let i = 0; i < chwsChtData.length; i++) {
      const data: ChwsData = chwsChtData[i];
      if (data) {
        const form = data.form;
        const field = data.fields;
        const chw: string = data.chw?.id ?? '';

        if (notEmpty(data?.source) && notEmpty(data?.district?.id) && notEmpty(data?.site?.id) && notEmpty(data?.chw?.id)) {

          const idDistrictValid: boolean = data?.district?.id == Chw.district?.id;
          const idSiteValid: boolean = data?.site?.id == Chw.site?.id;
          const idChwValid: boolean = data?.chw?.id == Chw.id;

          if (idDistrictValid && idSiteValid && idChwValid) {
            if (data.source == 'Tonoudayo' && form === "pcime_c_asc") {
              if (field["has_diarrhea"] == "true") {
                if (!(data.reported_date in patologieData.diarrhee_pcime)) {
                  patologieData.diarrhee_pcime[data.reported_date] = 0;
                }
                patologieData.diarrhee_pcime[data.reported_date] += 1;
              }
              if (field["fever_with_malaria"] == "true") {
                if (!(data.reported_date in patologieData.paludisme_pcime)) {
                  patologieData.paludisme_pcime[data.reported_date] = 0;
                }
                patologieData.paludisme_pcime[data.reported_date] += 1;
              }
              if (field["has_pneumonia"] == "true") {
                if (!(data.reported_date in patologieData.pneumonie_pcime)) {
                  patologieData.pneumonie_pcime[data.reported_date] = 0;
                }
                patologieData.pneumonie_pcime[data.reported_date] += 1;
              }
              if (field["has_malnutrition"] == "true") {
                if (!(data.reported_date in patologieData.malnutrition_pcime)) {
                  patologieData.malnutrition_pcime[data.reported_date] = 0;
                }
                patologieData.malnutrition_pcime[data.reported_date] += 1;
              }
            }

            if (data.source == 'dhis2' && form === "PCIME" && data.fields['zNldrz5EUPR'] == 'Soins') {
              if (data.fields['NPHYf8WAR9l'] == 'true') {
                if (!(data.reported_date in patologieData.diarrhee_pcime)) {
                  patologieData.diarrhee_pcime[data.reported_date] = 0;
                }
                patologieData.diarrhee_pcime[data.reported_date] += 1;
              }
              if (data.fields['Gl7HGePuIi3'] == 'true') {
                if (!(data.reported_date in patologieData.paludisme_pcime)) {
                  patologieData.paludisme_pcime[data.reported_date] = 0;
                }
                patologieData.paludisme_pcime[data.reported_date] += 1;
              }
              if (data.fields['LP33fMJRWrT'] == 'true') {
                if (!(data.reported_date in patologieData.pneumonie_pcime)) {
                  patologieData.pneumonie_pcime[data.reported_date] = 0;
                }
                patologieData.pneumonie_pcime[data.reported_date] += 1;
              }
              if (data.fields['y84NNODZ705'] == 'true') {
                if (!(data.reported_date in patologieData.malnutrition_pcime)) {
                  patologieData.malnutrition_pcime[data.reported_date] = 0;
                }
                patologieData.malnutrition_pcime[data.reported_date] += 1;
              }
            }
          }
        }
      }
    }
  }

  for (const field of dataFields) {

    outData[field.name].month_quantity_received += outData[field.name].borrowing_quantity;

    const AllOutQty: number = outData[field.name].quantity_damaged + outData[field.name].quantity_broken + outData[field.name].quantity_expired + outData[field.name].other_quantity + outData[field.name].lending_quantity;

    outData[field.name].month_total_quantity = outData[field.name].month_quantity_beginning + outData[field.name].month_quantity_received - AllOutQty;
    outData[field.name].theoretical_quantity = outData[field.name].month_total_quantity - outData[field.name].month_consumption;
    outData[field.name].inventory_variance = outData[field.name].inventory_quantity - outData[field.name].theoretical_quantity;

    if (outData[field.name].delivered_quantity != 0 && outData[field.name].quantity_validated != 0) {
      const rate = outData[field.name].delivered_quantity / outData[field.name].quantity_validated;
      outData[field.name].satisfaction_rate = !Number.isNaN(rate) ? `${(rate * 100).toFixed(2)} %` : 'NA';
    } else {
      outData[field.name].satisfaction_rate = undefined;
    }

    outData[field.name].theoretical_quantity_to_order = (outData[field.name].year_chw_cmm - outData[field.name].inventory_quantity) * (req.body.cmm_mutipliation ?? 1)
  }




  // [0]   year: 2024,
  // [0]   month: '03',
  // [0]   districts: [ 'KOEmjPzRmPd' ],
  // [0]   sites: [ 'f56baf28-02fc-4db8-96fc-b957081f3f01' ],
  // [0]   chws: [ '36de2140-65d3-4d8c-a304-1d6e1976859a' ],
  // [0]   cmm_start_year_month: 'juillet_2023_juin_2024',
  // [0]   cmm_mutipliation: 1,

  return { drugData: outData as ChwsDrugData, patologieData: patologieData };
}

// ##############################################
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

// function generateDrugQty(data: ChwsDrug, fieldId: string): number {
//   if (fieldId == "lumartem" && data.lumartem) return data.lumartem;
//   if (fieldId == "alben_400" && data.alben_400) return data.alben_400!;
//   if (fieldId == "amox_250" && data.amox_250) return data.amox_250!;
//   if (fieldId == "amox_500" && data.amox_500) return data.amox_500!;
//   if (fieldId == "pills" && data.pills) return data.pills!;
//   if (fieldId == "para_250" && data.para_250) return data.para_250!;
//   if (fieldId == "para_500" && data.para_500) return data.para_500!;
//   if (fieldId == "pregnancy_test" && data.pregnancy_test) return data.pregnancy_test!;
//   if (fieldId == "sayana" && data.sayana) return data.sayana!;
//   if (fieldId == "sro" && data.sro) return data.sro!;
//   if (fieldId == "tdr" && data.tdr) return data.tdr!;
//   if (fieldId == "vit_A1" && data.vit_A1) return data.vit_A1!;
//   if (fieldId == "vit_A2" && data.vit_A2) return data.vit_A2!;
//   if (fieldId == "zinc" && data.zinc) return data.zinc!;
//   if (fieldId == "other_drug" && data.other_drug) return data.other_drug!;
//   return 0;
// }

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

