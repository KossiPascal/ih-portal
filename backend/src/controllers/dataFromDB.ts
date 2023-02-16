import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import { Between, In } from "typeorm";
import { ChtOutPutData, DataIndicators } from "../entity/DataAggragate";
import { getChwsDataSyncRepository, ChwsData, Chws } from "../entity/Sync";
import { Dhis2DataFormat } from "../utils/appInterface";
import { DateUtils, Functions, getValue, httpHeaders, isNotNull, sslFolder } from "../utils/functions";
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

    const dbChwsData: { chw: Chws, data: DataIndicators }[] = getAllAboutData(chwsData.data, chws.data, req.body);
    if (!dbChwsData) return res.status(201).json({ status: 201, data: 'No data found !' });

    return res.status(200).json({ status: 200, data: dbChwsData });

  } else {
    return res.status(chwsData.status).json({ status: 201, data: 'No data found !' });
  }
}


function getAllAboutData(ChwsDataFromDb$: ChwsData[], Chws$: Chws[], reqBody: any): { chw: Chws, data: DataIndicators }[] {
  // 'Démarrage du calcule des indicateurs ...'
  const { start_date, end_date, sources, districts, sites, chws } = reqBody;

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

  for (let index = 0; index < ChwsDataFromDb$.length; index++) {
    const data: ChwsData = ChwsDataFromDb$[index];

    if (data != null) {
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

  return transformChwsData(outPutData, Chws$, reqBody);

}

function transformChwsData(allDatasFound: ChtOutPutData, Chws$: Chws[], reqBody: any): { chw: Chws, data: DataIndicators }[] {
  const { end_date, InsertIntoDhis2 } = reqBody;

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

    if (InsertIntoDhis2 == true) {
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


    if (InsertIntoDhis2 == true) {
      chwsData.orgUnit = chw.site?.external_id!;
      chwsData.reported_date = end_date;
      chwsData.code_asc = chw.external_id!;
      chwsData.district = chw.district?.name!;
      chwsData.data_source = 'medic';
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




    if (InsertIntoDhis2 == true) {
      var response = insertOrUpdateDataToDhis2(chwsData, reqBody)
    }





    allAggragateData.push({ chw: chw, data: chwsData });
  }


  return allAggragateData;
}




async function insertOrUpdateDataToDhis2(chwsData: DataIndicators, reqBody: any) {
  const { dhis2_username, dhis2_password } = reqBody;
  try {
    var jsonData = matchDhis2Data(chwsData);


    if (isNotNull(jsonData)) {
      const date = getValue(jsonData["dataValues"], "lbHrQBTbY1d");  // reported_date
      const srce = getValue(jsonData["dataValues"], "FW6z2Ha2GNr");  // data_source
      const dist = getValue(jsonData["dataValues"], "JC752xYegbJ");  // district
      const chw = getValue(jsonData["dataValues"], "JkMyqI3e6or");  // code_asc
      const site = jsonData['orgUnit'];
      const program = jsonData['program'];
      const data_filter = "JC752xYegbJ:EQ:" + dist + ",JkMyqI3e6or:like:" + chw + ",lbHrQBTbY1d:EQ:" + date + ",FW6z2Ha2GNr:like:" + srce;
      const fields = "event,eventDate,dataValues[dataElement, value]";
      const headers = httpHeaders('Basic ' + Buffer.from(`${dhis2_username}:${dhis2_password}`).toString('base64'));


      const link = `https://${process.env.DHIS_HOST}/api/events`;
      const params = `.json?paging=false&program=${program}&orgUnit=${site}&filter=${data_filter}&fields=${fields}&order=created:desc`;






      request({
        url: link + params,
        method: 'GET',
        headers: headers
      }, async function (err: any, response: any, body: any) {
        if (err) return;

        const jsonBody = JSON.parse(body);
        if (jsonBody.hasOwnProperty('events')) {
          var reqData: Dhis2DataFormat[] = jsonBody["events"] as Dhis2DataFormat[];
          const dataId = reqData[0].event;

          // console.log(response.statusCode)
          // console.log(response.statusMessage)

          // request({
          //   url: reqData .length > 0 ? `${link}/${dataId}` : link,
          //   cache: 'no-cache',
          //   mode: "cors",
          //   credentials: "include",
          //   referrerPolicy: 'no-referrer',
          //   method: reqData .length > 0 ? 'PUT' : 'POST',
          //   body: JSON.stringify(jsonData),
          //   headers: headers
          // }, async function (err: any, response: any, body: any) {


          // });

        } else {

        }
      });






      //     if len(r.json()["events"]) == 1:
      //         r = ih_dhis_api.put("events/"+r.json()["events"][0]['event'], json=json)
      //         outPutData['Dhis2Import']['Updated'] += 1
      //         return [str(r.status_code), 'Updated']
      //     else:
      //         r = ih_dhis_api.post("events", json=json)
      //         outPutData['Dhis2Import']['Created'] += 1
      //         return [str(r.status_code), 'Created']
      // except:
      //     outPutData['Dhis2Import']['ErrorCount'] +=1
      //     if outPutData['Dhis2Import']['ErrorMsg'] == None:
      //         outPutData['Dhis2Import']['ErrorMsg'] = "Erreur lors de l'importation des données dans le DHIS2"
      //     return [None, None]
    }
  } catch (error) {

  }

}



function matchDhis2Data(datas: DataIndicators) {

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



export async function deleteChwsData(req: Request, res: Response, next: NextFunction) { }

