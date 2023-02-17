import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import { Between, In } from "typeorm";
import { ChtOutPutData, DataIndicators } from "../entity/DataAggragate";
import { getChwsDataSyncRepository, ChwsData, Chws } from "../entity/Sync";
import { DateUtils, isNotNull, sslFolder } from "../utils/functions";
import { getChws } from "./orgUnitsFromDB ";

const request = require('request');
// const fetch = require('node-fetch');

require('dotenv').config({ path: sslFolder('.env') });


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
        id: isNotNull(req.body.id) ? req.body.id : isNotNull(req.params.id) ? req.params.id : undefined,
        reported_date: isNotNull(req.body.start_date) && isNotNull(req.body.end_date) ? Between(req.body.start_date, req.body.end_date) : undefined,
        form: isNotNull(req.body.forms) ? In(req.body.forms) : undefined,
        source: isNotNull(req.body.sources) ? In(req.body.sources) : undefined,
        district: isNotNull(req.body.districts) ? { id: In(req.body.districts) } : undefined,
        site: isNotNull(req.body.sites) ? { id: In(req.body.sites) } : undefined,
        zone: isNotNull(req.body.zones) ? { id: In(req.body.zones) } : undefined,
        chw: isNotNull(req.body.chws) ? { id: In(req.body.chws) } : undefined
      }
    });

    respData = !allSync ? { status: 201, data: 'Not data found with parametter!' } : { status: 200, data: allSync }
  }
  catch (err) {
    // return next(err);
    respData = { status: 201, data: errorMsg };
  }

  return onlyData ? respData : res.status(respData.status).json(respData);
};


export async function fetchIhChtDataPerChw(req: Request, res: Response, next: NextFunction) {

  const chwsData: { status: number, data: ChwsData[] } = await getChwsDataWithParams(req, res, next, true);
  const chws: { status: number, data: Chws[] } = await getChws(req, res, next, true);

  if (chwsData.status == 200 && chws.status == 200) {

    const dbChwsData: { chw: Chws, data: DataIndicators }[] = getAllAboutData(chwsData.data, chws.data, req, res);
    if (!dbChwsData) return res.status(201).json({ status: 201, data: 'No data found !' });

    return res.status(200).json({ status: 200, data: dbChwsData });

  } else {
    return res.status(chwsData.status).json({ status: 201, data: 'No data found !' });
  }
}


function getAllAboutData(ChwsDataFromDb$: ChwsData[], Chws$: Chws[], req: Request, res: Response): { chw: Chws, data: DataIndicators }[] {
  // 'Démarrage du calcule des indicateurs ...'
  const { start_date, end_date, sources, districts, sites, chws } = req.body;

  var outPutData: ChtOutPutData = {
    total_home_visit: {},
    total_pcime_soins: {},
    total_pcime_suivi: {},
    total_reference_pcime_suivi: {},
    total_reference_pcime_soins: {},
    total_diarrhee_pcime_soins: {},
    total_paludisme_pcime_soins: {},
    total_pneumonie_pcime_soins: {},
    total_malnutrition_pcime_soins: {},
    prompt_diarrhee_24h_pcime_soins: {},
    prompt_diarrhee_48h_pcime_soins: {},
    prompt_diarrhee_72h_pcime_soins: {},
    prompt_paludisme_24h_pcime_soins: {},
    prompt_paludisme_48h_pcime_soins: {},
    prompt_paludisme_72h_pcime_soins: {},
    prompt_pneumonie_24h_pcime_soins: {},
    prompt_pneumonie_48h_pcime_soins: {},
    prompt_pneumonie_72h_pcime_soins: {},
    total_pregnancy_family_planning: {},
    total_reference_family_planning_soins: {},
    total_reference_femme_enceinte_soins: {},
    total_vad_femme_enceinte_soins: {},
    total_vad_femme_enceinte_NC_soins: {},
    total_test_de_grossesse_domicile: {},
    total_newborn_suivi: {},
    total_reference_newborn: {},
    total_malnutrition_suivi: {},
    total_reference_malnutrition_suivi: {},
    total_prenatal_suivi: {},
    total_reference_prenatal_suivi: {},
    total_postnatal_suivi: {},
    total_reference_postnatal_suivi: {},
    total_vad_femme_postpartum_NC: {},
    total_vad_women_emergency_suivi: {},
    total_reference_women_emergency_suivi: {},
    total_femme_enceinte_women_emergency_suivi: {},
    total_femme_postpartum_women_emergency_suivi: {},
    total_family_planning_renewal_suivi: {},
    total_reference_family_planning_renewal_suivi: {},
    total_vad_family_planning_NC: {}
  }

  for (let i = 0; i < Chws$.length; i++) {
    const ascId = Chws$[i].id;
    if (ascId != null && ascId != '') {
      Object.entries(outPutData).map(([key, val]) => {
        const vals: any = val as any;
        if (!vals.hasOwnProperty(ascId)) vals[ascId] = { chwId: ascId, count: 0 }
      });
    }
  }

  for (let i = 0; i < ChwsDataFromDb$.length; i++) {
    const data: ChwsData = ChwsDataFromDb$[i];

    if (data) {
      const form = data.form;
      const field = data.fields;
      const source: string = data.source != null && data.source != '' ? data.source : '';
      const district: string = data.district.id != null ? data.district.id != null && data.district.id != '' ? data.district.id : '' : '';
      const site: string = data.site != null ? data.site.id != null && data.site.id != '' ? data.site.id : '' : '';
      const chw: string = data.chw != null ? data.chw.id != null && data.chw.id != '' ? data.chw.id : '' : '';

      const idSourceValid: boolean = isNotNull(source) && isNotNull(sources) && sources?.includes(source) || !isNotNull(sources);
      const idDistrictValid: boolean = isNotNull(district) && isNotNull(districts) && districts?.includes(district) || !isNotNull(districts);
      const idSiteValid: boolean = isNotNull(site) && isNotNull(sites) && sites?.includes(site) || !isNotNull(sites);
      const idChwValid: boolean = isNotNull(chw) && isNotNull(chws) && chws?.includes(chw) || !isNotNull(chws);
      const isDateValid: boolean = isNotNull(start_date) && isNotNull(end_date) ? DateUtils.isBetween(`${start_date}`, data.reported_date, `${end_date}`) : false;

      if (isDateValid && idSourceValid && idDistrictValid && idSiteValid && idChwValid) {
        if (form === "home_visit") outPutData.total_home_visit[chw].count += 1
        if (form === "pcime_c_asc") {
          outPutData.total_pcime_soins[chw].count += 1
          if (field["group_review.s_have_you_refer_child"] == "yes") outPutData.total_reference_pcime_soins[chw].count += 1
          if (field["has_diarrhea"] == "true") {
            outPutData.total_diarrhee_pcime_soins[chw].count += 1
            if (field["within_24h"] == "true") outPutData.prompt_diarrhee_24h_pcime_soins[chw].count += 1
            if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_diarrhee_48h_pcime_soins[chw].count += 1
            if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_diarrhee_72h_pcime_soins[chw].count += 1
          }

          if (field["fever_with_malaria"] == "true") {
            outPutData.total_paludisme_pcime_soins[chw].count += 1
            if (field["within_24h"] == "true") outPutData.prompt_paludisme_24h_pcime_soins[chw].count += 1
            if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_paludisme_48h_pcime_soins[chw].count += 1
            if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_paludisme_72h_pcime_soins[chw].count += 1
          }

          if (field["has_pneumonia"] == "true") {
            outPutData.total_pneumonie_pcime_soins[chw].count += 1
            if (field["within_24h"] == "true") outPutData.prompt_pneumonie_24h_pcime_soins[chw].count += 1
            if (field["within_24h"] == "true" || field["within_48h"] == "true") outPutData.prompt_pneumonie_48h_pcime_soins[chw].count += 1
            if (field["within_24h"] == "true" || field["within_48h"] == "true" || field["within_72h"] == "true") outPutData.prompt_pneumonie_72h_pcime_soins[chw].count += 1
          }

          if (field["has_malnutrition"] == "true") outPutData.total_malnutrition_pcime_soins[chw].count += 1
        }

        if (form === "pcime_c_followup") {
          outPutData.total_pcime_suivi[chw].count += 1
          if (field["group_review.s_have_you_refer_child"] == "yes") outPutData.total_reference_pcime_suivi[chw].count += 1
        }

        if (form === "newborn_followup") {
          outPutData.total_newborn_suivi[chw].count += 1
          if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_newborn[chw].count += 1
        }

        if (form === "malnutrition_followup") {
          outPutData.total_malnutrition_suivi[chw].count += 1
          if (field["results_page.s_have_you_refer_child"] == "yes") outPutData.total_reference_malnutrition_suivi[chw].count += 1
        }

        if (form === "prenatal_followup") {
          outPutData.total_prenatal_suivi[chw].count += 1
          if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_prenatal_suivi[chw].count += 1
        }

        if (form === "postnatal_followup") {
          outPutData.total_postnatal_suivi[chw].count += 1
          if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_postnatal_suivi[chw].count += 1
          if (field["follow_up_count"] == "1") outPutData.total_vad_femme_postpartum_NC[chw].count += 1
        }

        if (form === "pregnancy_family_planning") {
          outPutData.total_pregnancy_family_planning[chw].count += 1
          var pregnant_1 = field["s_reg_pregnancy_screen.s_reg_urine_result"] == "positive"
          var pregnant_2 = field["s_reg_pregnancy_screen.s_reg_why_urine_test_not_done"] == "already_pregnant"

          if (field["s_reg_pregnancy_screen.s_reg_urine_test"] == "yes") outPutData.total_test_de_grossesse_domicile[chw].count += 1
          if (field["s_summary.s_have_you_refer_child"] == "yes" && !pregnant_1 && !pregnant_2) outPutData.total_reference_family_planning_soins[chw].count += 1
          if (pregnant_1 || pregnant_2) {
            outPutData.total_vad_femme_enceinte_soins[chw].count += 1
            if (field["s_reg_mode.s_reg_how_found"] != "fp_followup") outPutData.total_vad_femme_enceinte_NC_soins[chw].count += 1
            if (field["s_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_femme_enceinte_soins[chw].count += 1
          }
          if (field["s_fam_plan_screen.agreed_to_fp"] == "yes") outPutData.total_vad_family_planning_NC[chw].count += 1
        }

        if (form === "women_emergency_followup") {
          outPutData.total_vad_women_emergency_suivi[chw].count += 1
          if (field["group_summary.s_have_you_refer_child"] == "yes") outPutData.total_reference_women_emergency_suivi[chw].count += 1
          if (field["initial.woman_status"] == "pregnant") outPutData.total_femme_enceinte_women_emergency_suivi[chw].count += 1
          if (field["initial.woman_status"] == "postpartum") outPutData.total_femme_postpartum_women_emergency_suivi[chw].count += 1
        }

        if (form === "fp_follow_up_renewal") {
          outPutData.total_family_planning_renewal_suivi[chw].count += 1
          if (field["checklist2.s_refer_for_health_state"] == "true") outPutData.total_reference_family_planning_renewal_suivi[chw].count += 1
        }
      }
    }
  }

  return transformChwsData(outPutData, Chws$, req, res);

}

function transformChwsData(allDatasFound: ChtOutPutData, Chws$: Chws[], req: Request, res: Response): { chw: Chws, data: DataIndicators }[] {
  const { end_date, params } = req.body;

  var allAggragateData: { chw: Chws, data: DataIndicators }[] = [];

  for (let i = 0; i < Chws$.length; i++) {
    const chw: Chws = Chws$[i];
    const ascId = chw.id!;
    var chwsData: DataIndicators = {

      total_vad: 0,
      total_vad_pcime_c: 0,
      total_suivi_pcime_c: 0,
      total_vad_femmes_enceinte: 0,
      total_vad_femmes_postpartum: 0,
      total_recherche_active: 0,
      total_vad_family_planning: 0,
      reference_femmes_pf: 0,
      reference_pcime: 0,
      reference_femmes_enceinte_postpartum: 0,
      total_diarrhee_pcime_soins: 0,
      total_paludisme_pcime_soins: 0,
      total_pneumonie_pcime_soins: 0,
      total_malnutrition_pcime_soins: 0,
      prompt_diarrhee_24h_pcime_soins: 0,
      prompt_diarrhee_48h_pcime_soins: 0,
      prompt_diarrhee_72h_pcime_soins: 0,
      prompt_paludisme_24h_pcime_soins: 0,
      prompt_paludisme_48h_pcime_soins: 0,
      prompt_paludisme_72h_pcime_soins: 0,
      prompt_pneumonie_24h_pcime_soins: 0,
      prompt_pneumonie_48h_pcime_soins: 0,
      prompt_pneumonie_72h_pcime_soins: 0,
      total_vad_femmes_enceintes_NC: 0,
      total_vad_femme_postpartum_NC: 0,
      total_test_de_grossesse_domicile: 0,
    };

    if (params !='onlydata') {
      chwsData.orgUnit = '';
      chwsData.reported_date = '';
      chwsData.code_asc = '';
      chwsData.district = '';
      chwsData.data_source = '';
    }

    const total_vad = allDatasFound.total_home_visit[ascId]["count"] + allDatasFound.total_pcime_soins[ascId]["count"] + allDatasFound.total_pregnancy_family_planning[ascId]["count"] + allDatasFound.total_pcime_suivi[ascId]["count"] + allDatasFound.total_newborn_suivi[ascId]["count"] + allDatasFound.total_prenatal_suivi[ascId]["count"] + allDatasFound.total_postnatal_suivi[ascId]["count"] + allDatasFound.total_malnutrition_suivi[ascId]["count"] + allDatasFound.total_vad_women_emergency_suivi[ascId]["count"] + allDatasFound.total_family_planning_renewal_suivi[ascId]["count"];
    const total_vad_pcime_c = allDatasFound.total_pcime_soins[ascId]["count"] + allDatasFound.total_pcime_suivi[ascId]["count"] + allDatasFound.total_newborn_suivi[ascId]["count"] + allDatasFound.total_malnutrition_suivi[ascId]["count"];
    const total_suivi_pcime_c = allDatasFound.total_pcime_suivi[ascId]["count"] + allDatasFound.total_newborn_suivi[ascId]["count"] + allDatasFound.total_malnutrition_suivi[ascId]["count"];
    const reference_femmes_pf = allDatasFound.total_reference_family_planning_soins[ascId]["count"] + allDatasFound.total_reference_family_planning_renewal_suivi[ascId]["count"];
    const reference_pcime = allDatasFound.total_reference_pcime_soins[ascId]["count"] + allDatasFound.total_reference_pcime_suivi[ascId]["count"] + allDatasFound.total_reference_newborn[ascId]["count"] + allDatasFound.total_reference_malnutrition_suivi[ascId]["count"];
    const reference_femmes_enceinte_postpartum = allDatasFound.total_reference_femme_enceinte_soins[ascId]["count"] + allDatasFound.total_reference_prenatal_suivi[ascId]["count"] + allDatasFound.total_reference_postnatal_suivi[ascId]["count"] + allDatasFound.total_reference_women_emergency_suivi[ascId]["count"];
    const total_vad_femmes_enceinte = allDatasFound.total_vad_femme_enceinte_soins[ascId]["count"] + allDatasFound.total_prenatal_suivi[ascId]["count"] + allDatasFound.total_femme_enceinte_women_emergency_suivi[ascId]["count"];
    const total_vad_femmes_postpartum = allDatasFound.total_postnatal_suivi[ascId]["count"] + allDatasFound.total_femme_postpartum_women_emergency_suivi[ascId]["count"];
    const total_vad_family_planning = total_vad - (total_vad_pcime_c + total_vad_femmes_enceinte + total_vad_femmes_postpartum + allDatasFound["total_home_visit"][ascId]["count"]);

    if (params !='onlydata'){
      chwsData.orgUnit += chw.site?.external_id!;
      chwsData.reported_date += end_date;
      chwsData.code_asc += chw.external_id!;
      chwsData.district += chw.district?.name!;
      chwsData.data_source += 'medic';
    }

    chwsData.total_vad += total_vad;
    chwsData.total_vad_pcime_c += total_vad_pcime_c;
    chwsData.total_suivi_pcime_c += total_suivi_pcime_c;
    chwsData.total_vad_femmes_enceinte += total_vad_femmes_enceinte;
    chwsData.total_vad_femmes_postpartum += total_vad_femmes_postpartum;
    chwsData.total_recherche_active += allDatasFound.total_home_visit[ascId]["count"];
    chwsData.total_vad_family_planning = total_vad_family_planning;
    chwsData.reference_femmes_pf += reference_femmes_pf;
    chwsData.reference_pcime += reference_pcime;
    chwsData.reference_femmes_enceinte_postpartum = reference_femmes_enceinte_postpartum;
    chwsData.total_diarrhee_pcime_soins += allDatasFound.total_diarrhee_pcime_soins[ascId]["count"];
    chwsData.total_paludisme_pcime_soins += allDatasFound.total_paludisme_pcime_soins[ascId]["count"];
    chwsData.total_pneumonie_pcime_soins += allDatasFound.total_pneumonie_pcime_soins[ascId]["count"];
    chwsData.total_malnutrition_pcime_soins += allDatasFound.total_malnutrition_pcime_soins[ascId]["count"];
    chwsData.prompt_diarrhee_24h_pcime_soins += allDatasFound.prompt_diarrhee_24h_pcime_soins[ascId]["count"];
    chwsData.prompt_diarrhee_48h_pcime_soins += allDatasFound.prompt_diarrhee_48h_pcime_soins[ascId]["count"];
    chwsData.prompt_diarrhee_72h_pcime_soins += allDatasFound.prompt_diarrhee_72h_pcime_soins[ascId]["count"];
    chwsData.prompt_paludisme_24h_pcime_soins += allDatasFound.prompt_paludisme_24h_pcime_soins[ascId]["count"];
    chwsData.prompt_paludisme_48h_pcime_soins += allDatasFound.prompt_paludisme_48h_pcime_soins[ascId]["count"];
    chwsData.prompt_paludisme_72h_pcime_soins += allDatasFound.prompt_paludisme_72h_pcime_soins[ascId]["count"];
    chwsData.prompt_pneumonie_24h_pcime_soins += allDatasFound.prompt_pneumonie_24h_pcime_soins[ascId]["count"];
    chwsData.prompt_pneumonie_48h_pcime_soins += allDatasFound.prompt_pneumonie_48h_pcime_soins[ascId]["count"];
    chwsData.prompt_pneumonie_72h_pcime_soins += allDatasFound.prompt_pneumonie_72h_pcime_soins[ascId]["count"];
    chwsData.total_vad_femmes_enceintes_NC += allDatasFound.total_vad_femme_enceinte_NC_soins[ascId]["count"];
    chwsData.total_vad_femme_postpartum_NC += allDatasFound.total_vad_femme_postpartum_NC[ascId]["count"];
    chwsData.total_test_de_grossesse_domicile += allDatasFound.total_test_de_grossesse_domicile[ascId]["count"];

    allAggragateData.push({ chw: chw, data: chwsData });
  }


  return allAggragateData;
}





export async function deleteChwsData(req: Request, res: Response, next: NextFunction) { }

