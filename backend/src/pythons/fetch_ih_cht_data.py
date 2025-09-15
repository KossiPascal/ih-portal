# _*_ coding:utf-8 _*_

import json
from operator import indexOf
import couchdb
from functions import between, chwsFound, convert_milisecond_to_date, createExtractFolderIfNotExist, createFile, date_to_milisecond, dhisApi, districtFound, extractFolder, formView, getOutPutData, getOutPutDataFromFile, getValue, matchDhis2Data, medicDataType, record
import sys
sys.stdout.reconfigure(encoding='utf-8')

outPutData = getOutPutData()

COUCH_KWARGS = {
    "include_docs": True,
    "reduce": False,
    "attachments": False
}

def insertOrUpdateDataToDhis2(data, KWARG):
    ih_dhis_api = dhisApi(KWARG)
    try:
        json = matchDhis2Data(data)
        date = getValue(json["dataValues"], "lbHrQBTbY1d")  # reported_date
        srce = getValue(json["dataValues"], "FW6z2Ha2GNr")  # data_source
        dist = getValue(json["dataValues"], "JC752xYegbJ")  # district
        chws = getValue(json["dataValues"], "JkMyqI3e6or")  # code_asc
        site = json['orgUnit']
        program = json['program']
        data_filter = "JC752xYegbJ:EQ:" + dist + ",JkMyqI3e6or:like:" + chws + ",lbHrQBTbY1d:EQ:" + date + ",FW6z2Ha2GNr:like:" + srce

        r = ih_dhis_api.get("events", params={"paging": "false", "program": program, "orgUnit": site,"filter": data_filter, "fields": "event,eventDate,dataValues[dataElement, value]"})

        if len(r.json()["events"]) == 1:

            r = ih_dhis_api.put("events/"+r.json()["events"][0]['event'], json=json)

            outPutData['Dhis2Import']['Updated'] += 1
            return [str(r.status_code), 'Updated']
        else:

            r = ih_dhis_api.post("events", json=json)
            
            outPutData['Dhis2Import']['Created'] += 1
            return [str(r.status_code), 'Created']
    except:
        outPutData['Dhis2Import']['ErrorCount'] +=1
        if outPutData['Dhis2Import']['ErrorMsg'] == None:
            outPutData['Dhis2Import']['ErrorMsg'] = "Erreur lors de l'importation des données dans le DHIS2"
        return [None, None]

def countDataFound(KWARG):

    couch = couchdb.Server("https://{}:{}@{}".format(KWARG['cht_username'],KWARG['cht_password'], KWARG['cht_host']))[KWARG['cht_database']]

    total_reference_women_emergency_suivi = {}
    femme_enceinte_women_emergency_suivi = {}
    femme_postpartum_women_emergency_suivi = {}
    total_family_planning_renewal_suivi = {}
    total_reference_family_planning_renewal_suivi = {}
    home_visit = {}
    soins_pcime = {}
    suivi_pcime = {}
    reference_pcime_suivi = {}
    reference_pcime_soins = {}
    diarrhee_pcime = {}
    paludisme_pcime = {}
    pneumonie_pcime = {}
    malnutrition_pcime = {}
    prompt_pcime_diarrhee_24h = {}
    prompt_pcime_diarrhee_48h = {}
    prompt_pcime_diarrhee_72h = {}
    prompt_pcime_paludisme_24h = {}
    prompt_pcime_paludisme_48h = {}
    prompt_pcime_paludisme_72h = {}
    prompt_pcime_pneumonie_24h = {}
    prompt_pcime_pneumonie_48h = {}
    prompt_pcime_pneumonie_72h = {}
    total_pregnancy_family_planning = {}
    total_reference_family_planning_soins = {}
    total_reference_femme_enceinte_soins = {}
    total_vad_femme_enceinte_NC_soins = {}
    total_vad_femme_enceinte_soins = {}
    test_de_grossesse = {}
    total_newborn_suivi = {}
    total_reference_newborn = {}
    total_malnutrition_suivi = {}
    total_reference_malnutrition_suivi = {}
    total_prenatal_suivi = {}
    total_reference_prenatal_suivi = {}
    total_postnatal_suivi = {}
    total_reference_postnatal_suivi = {}
    femme_postpartum_NC = {}
    total_vad_women_emergency_suivi = {}
    pf_NC = {}

    x = 0
    
    for row in couch.view("medic-client/reports_by_date", key=[date_to_milisecond(KWARG['start_date'], True)], endkey=[date_to_milisecond(KWARG['end_date'], False)], **COUCH_KWARGS):

        try:
            createdAt = convert_milisecond_to_date(row.doc["reported_date"])
            if between(createdAt, KWARG['start_date'], KWARG['end_date']) and chwsFound(row.doc) and districtFound(row.doc) and record(row.doc):
                asc = chwsFound(row.doc, "code")
                field = row.doc["fields"]
                if formView(row.doc, "home_visit") or formView(row.doc, "death_report"):
                    if asc not in home_visit:
                        home_visit[asc] = {"asc": asc, "nbr": 1}
                    else:
                        home_visit[asc]["nbr"] += 1

                if formView(row.doc, "pcime_c_asc"):
                    if asc not in soins_pcime:
                        soins_pcime[asc] = {"asc": asc, "nbr": 1}
                    else:
                        soins_pcime[asc]["nbr"] += 1

                    if field["group_review"]["s_have_you_refer_child"] == "yes":  # err cht
                        if asc not in reference_pcime_soins:
                            reference_pcime_soins[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            reference_pcime_soins[asc]["nbr"] += 1

                    if field["has_diarrhea"] == "true":  # err cht
                        if asc not in diarrhee_pcime:
                            diarrhee_pcime[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            diarrhee_pcime[asc]["nbr"] += 1

                        if field["within_24h"] == "true":
                            if asc not in prompt_pcime_diarrhee_24h:
                                prompt_pcime_diarrhee_24h[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pcime_diarrhee_24h[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true":
                            if asc not in prompt_pcime_diarrhee_48h:
                                prompt_pcime_diarrhee_48h[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pcime_diarrhee_48h[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true" or field["within_72h"] == "true":
                            if asc not in prompt_pcime_diarrhee_72h:
                                prompt_pcime_diarrhee_72h[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pcime_diarrhee_72h[asc]["nbr"] += 1

                    if field["fever_with_malaria"] == "true":
                        # field["s_fever"]["s_fever_child_TDR_result"] == "positive"
                        if asc not in paludisme_pcime:
                            paludisme_pcime[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            paludisme_pcime[asc]["nbr"] += 1

                        if field["within_24h"] == "true":
                            if asc not in prompt_pcime_paludisme_24h:
                                prompt_pcime_paludisme_24h[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pcime_paludisme_24h[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true":
                            if asc not in prompt_pcime_paludisme_48h:
                                prompt_pcime_paludisme_48h[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pcime_paludisme_48h[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true" or field["within_72h"] == "true":
                            if asc not in prompt_pcime_paludisme_72h:
                                prompt_pcime_paludisme_72h[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pcime_paludisme_72h[asc]["nbr"] += 1

                    if field["has_pneumonia"] == "true":
                        if asc not in pneumonie_pcime:
                            pneumonie_pcime[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            pneumonie_pcime[asc]["nbr"] += 1

                        if field["within_24h"] == "true":
                            if asc not in prompt_pcime_pneumonie_24h:
                                prompt_pcime_pneumonie_24h[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pcime_pneumonie_24h[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true":
                            if asc not in prompt_pcime_pneumonie_48h:
                                prompt_pcime_pneumonie_48h[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pcime_pneumonie_48h[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true" or field["within_72h"] == "true":
                            if asc not in prompt_pcime_pneumonie_72h:
                                prompt_pcime_pneumonie_72h[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pcime_pneumonie_72h[asc]["nbr"] += 1

                    if field["has_malnutrition"] == "true":
                        # field["s_constant"]["s_constant_child_brachial_perimeter"] < 125:
                        if asc not in malnutrition_pcime:
                            malnutrition_pcime[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            malnutrition_pcime[asc]["nbr"] += 1

                if formView(row.doc, "pcime_c_followup"):
                    if asc not in suivi_pcime:
                        suivi_pcime[asc] = {"asc": asc, "nbr": 1}
                    else:
                        suivi_pcime[asc]["nbr"] += 1
                    if field["group_review"]["s_have_you_refer_child"] == "yes":
                        if asc not in reference_pcime_suivi:
                            reference_pcime_suivi[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            reference_pcime_suivi[asc]["nbr"] += 1

                if formView(row.doc, "newborn_followup"):
                    if asc not in total_newborn_suivi:
                        total_newborn_suivi[asc] = {"asc": asc, "nbr": 1}
                    else:
                        total_newborn_suivi[asc]["nbr"] += 1

                    if "group_summary" in field:
                        if "s_have_you_refer_child" in field["group_summary"]:
                            if field["group_summary"]["s_have_you_refer_child"] == "yes":
                                if asc not in total_reference_newborn:
                                    total_reference_newborn[asc] = {
                                        "asc": asc, "nbr": 1}
                                else:
                                    total_reference_newborn[asc]["nbr"] += 1

                if formView(row.doc, "malnutrition_followup"):
                    if asc not in total_malnutrition_suivi:
                        total_malnutrition_suivi[asc] = {"asc": asc, "nbr": 1}
                    else:
                        total_malnutrition_suivi[asc]["nbr"] += 1
                    if "results_page" in field:
                        if "s_have_you_refer_child" in field["results_page"]:
                            if field["results_page"]["s_have_you_refer_child"] == "yes":
                                if asc not in total_reference_malnutrition_suivi:
                                    total_reference_malnutrition_suivi[asc] = {
                                        "asc": asc, "nbr": 1}
                                else:
                                    total_reference_malnutrition_suivi[asc]["nbr"] += 1

                if formView(row.doc, "prenatal_followup"):
                    if asc not in total_prenatal_suivi:
                        total_prenatal_suivi[asc] = {"asc": asc, "nbr": 1}
                    else:
                        total_prenatal_suivi[asc]["nbr"] += 1
                    if "group_summary" in field:
                        if "s_have_you_refer_child" in field["group_summary"]:
                            if field["group_summary"]["s_have_you_refer_child"] == "yes":
                                if asc not in total_reference_prenatal_suivi:
                                    total_reference_prenatal_suivi[asc] = {
                                        "asc": asc, "nbr": 1}
                                else:
                                    total_reference_prenatal_suivi[asc]["nbr"] += 1

                if formView(row.doc, "postnatal_followup"):
                    if asc not in total_postnatal_suivi:
                        total_postnatal_suivi[asc] = {"asc": asc, "nbr": 1}
                    else:
                        total_postnatal_suivi[asc]["nbr"] += 1

                    if "group_summary" in field:
                        if "s_have_you_refer_child" in field["group_summary"]:
                            if field["group_summary"]["s_have_you_refer_child"] == "yes":
                                if asc not in total_reference_postnatal_suivi:
                                    total_reference_postnatal_suivi[asc] = {
                                        "asc": asc, "nbr": 1}
                                else:
                                    total_reference_postnatal_suivi[asc]["nbr"] += 1

                    if field["follow_up_count"] == "1":
                        if asc not in femme_postpartum_NC:
                            femme_postpartum_NC[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            femme_postpartum_NC[asc]["nbr"] += 1

                if formView(row.doc, "pregnancy_family_planning"):
                    if asc not in total_pregnancy_family_planning:
                        total_pregnancy_family_planning[asc] = {
                            "asc": asc, "nbr": 1}
                    else:
                        total_pregnancy_family_planning[asc]["nbr"] += 1
                    pregnant_1 = False
                    pregnant_2 = False
                    if "s_reg_pregnancy_screen" in field:
                        if "s_reg_urine_result" in field["s_reg_pregnancy_screen"]:
                            pregnant_1 = field["s_reg_pregnancy_screen"]["s_reg_urine_result"] == "positive"
                        if "s_reg_why_urine_test_not_done" in field["s_reg_pregnancy_screen"]:
                            pregnant_2 = field["s_reg_pregnancy_screen"][
                                "s_reg_why_urine_test_not_done"] == "already_pregnant"

                        if "s_reg_urine_test" in field["s_reg_pregnancy_screen"]:
                            if field["s_reg_pregnancy_screen"]["s_reg_urine_test"] == "yes":
                                if asc not in test_de_grossesse:
                                    test_de_grossesse[asc] = {
                                        "asc": asc, "nbr": 1}
                                else:
                                    test_de_grossesse[asc]["nbr"] += 1

                    if "s_have_you_refer_child" in field["s_summary"]:
                        if field["s_summary"]["s_have_you_refer_child"] == "yes" and not pregnant_1 and not pregnant_2:
                            if asc not in total_reference_family_planning_soins:
                                total_reference_family_planning_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                total_reference_family_planning_soins[asc]["nbr"] += 1

                    if pregnant_1 or pregnant_2:
                        if asc not in total_vad_femme_enceinte_soins:
                            total_vad_femme_enceinte_soins[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_vad_femme_enceinte_soins[asc]["nbr"] += 1

                        if "s_reg_how_found" in field["s_reg_mode"]:
                            if field["s_reg_mode"]["s_reg_how_found"] != "fp_followup":
                                if asc not in total_vad_femme_enceinte_NC_soins:
                                    total_vad_femme_enceinte_NC_soins[asc] = {
                                        "asc": asc, "nbr": 1}
                                else:
                                    total_vad_femme_enceinte_NC_soins[asc]["nbr"] += 1

                        if "s_have_you_refer_child" in field["s_summary"]:
                            if field["s_summary"]["s_have_you_refer_child"] == "yes":
                                if asc not in total_reference_femme_enceinte_soins:
                                    total_reference_femme_enceinte_soins[asc] = {
                                        "asc": asc, "nbr": 1}
                                else:
                                    total_reference_femme_enceinte_soins[asc]["nbr"] += 1
                    
                    if "s_fam_plan_screen" in field:
                        if "agreed_to_fp" in field["s_fam_plan_screen"]:
                            if field["s_fam_plan_screen"]["agreed_to_fp"] == "yes":
                                if asc not in pf_NC:
                                    pf_NC[asc] = {"asc": asc, "nbr": 1}
                                else:
                                    pf_NC[asc]["nbr"] += 1

                if formView(row.doc, "women_emergency_followup"):
                    if asc not in total_vad_women_emergency_suivi:
                        total_vad_women_emergency_suivi[asc] = {
                            "asc": asc, "nbr": 1}
                    else:
                        total_vad_women_emergency_suivi[asc]["nbr"] += 1

                    if field["group_summary"]["s_have_you_refer_child"] == "yes":
                        if asc not in total_reference_women_emergency_suivi:
                            total_reference_women_emergency_suivi[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_reference_women_emergency_suivi[asc]["nbr"] += 1

                    if field["initial"]["woman_status"] == "pregnant":
                        if asc not in femme_enceinte_women_emergency_suivi:
                            femme_enceinte_women_emergency_suivi[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            femme_enceinte_women_emergency_suivi[asc]["nbr"] += 1

                    if field["initial"]["woman_status"] == "postpartum":
                        if asc not in femme_postpartum_women_emergency_suivi:
                            femme_postpartum_women_emergency_suivi[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            femme_postpartum_women_emergency_suivi[asc]["nbr"] += 1

                if formView(row.doc, "fp_follow_up_renewal"):
                    if asc not in total_family_planning_renewal_suivi:
                        total_family_planning_renewal_suivi[asc] = {
                            "asc": asc, "nbr": 1}
                    else:
                        total_family_planning_renewal_suivi[asc]["nbr"] += 1

                    if field["checklist2"]["s_refer_for_health_state"] == "true":
                        if asc not in total_reference_family_planning_renewal_suivi:
                            total_reference_family_planning_renewal_suivi[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_reference_family_planning_renewal_suivi[asc]["nbr"] += 1
        
        except Exception as e:
            outPutData['Error'] +=1
            if 'noDataOnApp' not in outPutData['ErrorMsg']:
                outPutData['ErrorMsg']['noDataOnApp'] = "Error when trying to get data from CHT database"


    for i in chwsFound("chws", "chws_array"):
        if i not in total_newborn_suivi:
            total_newborn_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_women_emergency_suivi:
            total_reference_women_emergency_suivi[i] = {"asc": i, "nbr": 0}
        if i not in femme_enceinte_women_emergency_suivi:
            femme_enceinte_women_emergency_suivi[i] = {
                "asc": i, "nbr": 0}
        if i not in femme_postpartum_women_emergency_suivi:
            femme_postpartum_women_emergency_suivi[i] = {
                "asc": i, "nbr": 0}
        if i not in total_family_planning_renewal_suivi:
            total_family_planning_renewal_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_family_planning_renewal_suivi:
            total_reference_family_planning_renewal_suivi[i] = {
                "asc": i, "nbr": 0}
        if i not in home_visit:
            home_visit[i] = {"asc": i, "nbr": 0}
        if i not in soins_pcime:
            soins_pcime[i] = {"asc": i, "nbr": 0}
        if i not in suivi_pcime:
            suivi_pcime[i] = {"asc": i, "nbr": 0}
        if i not in reference_pcime_suivi:
            reference_pcime_suivi[i] = {"asc": i, "nbr": 0}
        if i not in reference_pcime_soins:
            reference_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in diarrhee_pcime:
            diarrhee_pcime[i] = {"asc": i, "nbr": 0}
        if i not in paludisme_pcime:
            paludisme_pcime[i] = {"asc": i, "nbr": 0}
        if i not in pneumonie_pcime:
            pneumonie_pcime[i] = {"asc": i, "nbr": 0}
        if i not in malnutrition_pcime:
            malnutrition_pcime[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pcime_diarrhee_24h:
            prompt_pcime_diarrhee_24h[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pcime_diarrhee_48h:
            prompt_pcime_diarrhee_48h[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pcime_diarrhee_72h:
            prompt_pcime_diarrhee_72h[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pcime_paludisme_24h:
            prompt_pcime_paludisme_24h[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pcime_paludisme_48h:
            prompt_pcime_paludisme_48h[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pcime_paludisme_72h:
            prompt_pcime_paludisme_72h[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pcime_pneumonie_24h:
            prompt_pcime_pneumonie_24h[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pcime_pneumonie_48h:
            prompt_pcime_pneumonie_48h[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pcime_pneumonie_72h:
            prompt_pcime_pneumonie_72h[i] = {"asc": i, "nbr": 0}
        if i not in total_pregnancy_family_planning:
            total_pregnancy_family_planning[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_family_planning_soins:
            total_reference_family_planning_soins[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_femme_enceinte_soins:
            total_reference_femme_enceinte_soins[i] = {"asc": i, "nbr": 0}
        if i not in total_vad_femme_enceinte_NC_soins:
            total_vad_femme_enceinte_NC_soins[i] = {"asc": i, "nbr": 0}
        if i not in total_vad_femme_enceinte_soins:
            total_vad_femme_enceinte_soins[i] = {"asc": i, "nbr": 0}
        if i not in test_de_grossesse:
            test_de_grossesse[i] = {"asc": i, "nbr": 0}
        if i not in total_newborn_suivi:
            total_newborn_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_newborn:
            total_reference_newborn[i] = {"asc": i, "nbr": 0}
        if i not in total_malnutrition_suivi:
            total_malnutrition_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_malnutrition_suivi:
            total_reference_malnutrition_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_prenatal_suivi:
            total_prenatal_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_prenatal_suivi:
            total_reference_prenatal_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_postnatal_suivi:
            total_postnatal_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_postnatal_suivi:
            total_reference_postnatal_suivi[i] = {"asc": i, "nbr": 0}
        if i not in femme_postpartum_NC:
            femme_postpartum_NC[i] = {"asc": i, "nbr": 0}
        if i not in total_vad_women_emergency_suivi:
            total_vad_women_emergency_suivi[i] = {"asc": i, "nbr": 0}
        if i not in pf_NC:
            pf_NC[i] = {"asc": i, "nbr": 0}

    return {"home_visit": home_visit,
            "soins_pcime": soins_pcime,
            "suivi_pcime": suivi_pcime,
            "reference_pcime_suivi": reference_pcime_suivi,
            "reference_pcime_soins": reference_pcime_soins,
            "diarrhee_pcime": diarrhee_pcime,
            "paludisme_pcime": paludisme_pcime,
            "pneumonie_pcime": pneumonie_pcime,
            "malnutrition_pcime": malnutrition_pcime,
            "prompt_pcime_diarrhee_24h": prompt_pcime_diarrhee_24h,
            "prompt_pcime_diarrhee_48h": prompt_pcime_diarrhee_48h,
            "prompt_pcime_diarrhee_72h": prompt_pcime_diarrhee_72h,
            "prompt_pcime_paludisme_24h": prompt_pcime_paludisme_24h,
            "prompt_pcime_paludisme_48h": prompt_pcime_paludisme_48h,
            "prompt_pcime_paludisme_72h": prompt_pcime_paludisme_72h,
            "prompt_pcime_pneumonie_24h": prompt_pcime_pneumonie_24h,
            "prompt_pcime_pneumonie_48h": prompt_pcime_pneumonie_48h,
            "prompt_pcime_pneumonie_72h": prompt_pcime_pneumonie_72h,
            "total_pregnancy_family_planning": total_pregnancy_family_planning,
            "total_reference_family_planning_soins": total_reference_family_planning_soins,
            "total_reference_femme_enceinte_soins": total_reference_femme_enceinte_soins,
            "total_vad_femme_enceinte_soins": total_vad_femme_enceinte_soins,
            "total_vad_femme_enceinte_NC_soins": total_vad_femme_enceinte_NC_soins,
            "test_de_grossesse": test_de_grossesse,
            "total_newborn_suivi": total_newborn_suivi,
            "total_reference_newborn": total_reference_newborn,
            "total_malnutrition_suivi": total_malnutrition_suivi,
            "total_reference_malnutrition_suivi": total_reference_malnutrition_suivi,
            "total_prenatal_suivi": total_prenatal_suivi,
            "total_reference_prenatal_suivi": total_reference_prenatal_suivi,
            "total_postnatal_suivi": total_postnatal_suivi,
            "total_reference_postnatal_suivi": total_reference_postnatal_suivi,
            "femme_postpartum_NC": femme_postpartum_NC,
            "total_vad_women_emergency_suivi": total_vad_women_emergency_suivi,
            "total_reference_women_emergency_suivi": total_reference_women_emergency_suivi,
            "femme_enceinte_women_emergency_suivi": femme_enceinte_women_emergency_suivi,
            "femme_postpartum_women_emergency_suivi": femme_postpartum_women_emergency_suivi,
            "total_family_planning_renewal_suivi": total_family_planning_renewal_suivi,
            "total_reference_family_planning_renewal_suivi": total_reference_family_planning_renewal_suivi,
            "pf_NC": pf_NC
            }

def flushIhChtDataToDhis2(KWARG,fileName = "cht_output",data_type = "Consultation"):

    defaultFileName = "cht_output"

    if fileName == defaultFileName:
        # deleteFile(extractPath(fileName+".csv"))
        fileName0 = fileName+"_"+str(KWARG['userId'])+"_output"
    else:
        fileName0 = fileName

    try:
        all_datas_found = countDataFound(KWARG)

        soins_pcime = all_datas_found["soins_pcime"]
        total_pregnancy_family_planning = all_datas_found["total_pregnancy_family_planning"]
        suivi_pcime = all_datas_found["suivi_pcime"]
        total_newborn_suivi = all_datas_found["total_newborn_suivi"]
        total_malnutrition_suivi = all_datas_found["total_malnutrition_suivi"]
        total_prenatal_suivi = all_datas_found["total_prenatal_suivi"]
        total_postnatal_suivi = all_datas_found["total_postnatal_suivi"]
        total_vad_women_emergency_suivi = all_datas_found["total_vad_women_emergency_suivi"]
        total_family_planning_renewal_suivi = all_datas_found["total_family_planning_renewal_suivi"]
        reference_pcime_soins = all_datas_found["reference_pcime_soins"]
        reference_pcime_suivi = all_datas_found["reference_pcime_suivi"]
        total_reference_newborn = all_datas_found["total_reference_newborn"]
        total_reference_malnutrition_suivi = all_datas_found["total_reference_malnutrition_suivi"]
        total_reference_family_planning_soins = all_datas_found["total_reference_family_planning_soins"]
        total_reference_femme_enceinte_soins = all_datas_found["total_reference_femme_enceinte_soins"]
        total_reference_family_planning_renewal_suivi = all_datas_found["total_reference_family_planning_renewal_suivi"]
        total_reference_prenatal_suivi = all_datas_found["total_reference_prenatal_suivi"]
        total_reference_postnatal_suivi = all_datas_found["total_reference_postnatal_suivi"]
        total_reference_women_emergency_suivi = all_datas_found["total_reference_women_emergency_suivi"]
        total_vad_femme_enceinte_soins = all_datas_found["total_vad_femme_enceinte_soins"]
        femme_enceinte_women_emergency_suivi = all_datas_found["femme_enceinte_women_emergency_suivi"]
        femme_postpartum_women_emergency_suivi = all_datas_found["femme_postpartum_women_emergency_suivi"]

        with createFile(extractFolder(), fileName0) as result:
            if fileName == defaultFileName:
                result.write("site,reported_date,district,asc_code,total_vad,pcime,suivi_pcime,reference_pf,reference_pcime,reference_femmes_enceinte_postpartum,femmes_enceinte,femmes_postpartum,home_visit,diarrhee_pcime,paludisme_pcime,pneumonie_pcime,malnutrition_pcime,prompt_pcime_diarrhee_24h,prompt_pcime_diarrhee_48h,prompt_pcime_diarrhee_72h,prompt_pcime_paludisme_24h,prompt_pcime_paludisme_48h,prompt_pcime_paludisme_72h,prompt_pcime_pneumonie_24h,prompt_pcime_pneumonie_48h,prompt_pcime_pneumonie_72h,total_vad_femme_enceinte_NC_soins,femme_postpartum_NC,test_de_grossesse,pf\n")
            else:
                result.write("Site,District,ChwsCode,ChwsName,Type,"+KWARG['start_date']+"\n")
                # result.write("ChwsCode,ChwsName,Type,District,Site,total_vad,home_visite,consultation\n")
            found = 0
            response = ['','']
            # datalenght = len(chwsFound("chws", "chws_array"))
            for i in chwsFound("chws", "chws_array"):
                chwsData = {}
                total_vad  = all_datas_found["home_visit"][i]["nbr"] + soins_pcime[i]["nbr"] + total_pregnancy_family_planning[i]["nbr"] +  \
                            suivi_pcime[i]["nbr"] + total_newborn_suivi[i]["nbr"] + total_prenatal_suivi[i]["nbr"] + total_postnatal_suivi[i]["nbr"] + \
                            total_malnutrition_suivi[i]["nbr"] + total_vad_women_emergency_suivi[i]["nbr"] + total_family_planning_renewal_suivi[i]["nbr"]
                # if int(total_vad) != 0:
                if fileName == defaultFileName:
                    found+=1
                    pcime = soins_pcime[i]["nbr"] + suivi_pcime[i]["nbr"] + total_newborn_suivi[i]["nbr"] + total_malnutrition_suivi[i]["nbr"]
                    suivi_pcime = suivi_pcime[i]["nbr"] + total_newborn_suivi[i]["nbr"] + total_malnutrition_suivi[i]["nbr"]

                    reference_pf = total_reference_family_planning_soins[i]["nbr"] + total_reference_family_planning_renewal_suivi[i]["nbr"]
                    reference_pcime = reference_pcime_soins[i]["nbr"] + reference_pcime_suivi[i]["nbr"] + total_reference_newborn[i]["nbr"] + \
                                        total_reference_malnutrition_suivi[i]["nbr"]
                    reference_femmes_enceinte_postpartum = total_reference_femme_enceinte_soins[i]["nbr"] + total_reference_prenatal_suivi[i]["nbr"] + \
                                                            total_reference_postnatal_suivi[i]["nbr"] + total_reference_women_emergency_suivi[i]["nbr"]
                    femmes_enceinte = total_vad_femme_enceinte_soins[i]["nbr"] + total_prenatal_suivi[i]["nbr"] + femme_enceinte_women_emergency_suivi[i]["nbr"]
                    femmes_postpartum = total_postnatal_suivi[i]["nbr"] + femme_postpartum_women_emergency_suivi[i]["nbr"]
                    # pf = all_datas_found["pf_NC"][i]["nbr"] + total_family_planning_renewal_suivi[i]["nbr"]
                    pf = total_vad - (pcime + femmes_enceinte + femmes_postpartum + all_datas_found["home_visit"][i]["nbr"])
                    
                    ############################################ 
                    
                    chwsData["orgUnit"] = chwsFound(i, "findByCode",5)
                    chwsData["reported_date"] = KWARG['end_date']
                    chwsData["code_asc"] = i
                    chwsData["district"] = "Kozah"
                    chwsData["data_source"] = 'ih-cht'
                    chwsData["total_vad"] = total_vad
                    chwsData["pcime"] = pcime
                    chwsData["suivi_pcime"] = suivi_pcime
                    chwsData["femmes_enceinte"] = femmes_enceinte
                    chwsData["femmes_postpartum"] = femmes_postpartum
                    chwsData["home_visit"] = all_datas_found["home_visit"][i]["nbr"]
                    chwsData["pf"] = pf
                    chwsData["reference_pf"] = reference_pf
                    chwsData["reference_pcime"] = reference_pcime
                    chwsData["reference_femmes_enceinte_postpartum"] = reference_femmes_enceinte_postpartum
                    chwsData["diarrhee_pcime"] = all_datas_found["diarrhee_pcime"][i]["nbr"]
                    chwsData["paludisme_pcime"] = all_datas_found["paludisme_pcime"][i]["nbr"]
                    chwsData["pneumonie_pcime"] = all_datas_found["pneumonie_pcime"][i]["nbr"]
                    chwsData["malnutrition_pcime"] = all_datas_found["malnutrition_pcime"][i]["nbr"]
                    chwsData["prompt_pcime_diarrhee_24h"] = all_datas_found["prompt_pcime_diarrhee_24h"][i]["nbr"]
                    chwsData["prompt_pcime_diarrhee_48h"] = all_datas_found["prompt_pcime_diarrhee_48h"][i]["nbr"]
                    chwsData["prompt_pcime_diarrhee_72h"] = all_datas_found["prompt_pcime_diarrhee_72h"][i]["nbr"]
                    chwsData["prompt_pcime_paludisme_24h"] = all_datas_found["prompt_pcime_paludisme_24h"][i]["nbr"]
                    chwsData["prompt_pcime_paludisme_48h"] = all_datas_found["prompt_pcime_paludisme_48h"][i]["nbr"]
                    chwsData["prompt_pcime_paludisme_72h"] = all_datas_found["prompt_pcime_paludisme_72h"][i]["nbr"]
                    chwsData["prompt_pcime_pneumonie_24h"] = all_datas_found["prompt_pcime_pneumonie_24h"][i]["nbr"]
                    chwsData["prompt_pcime_pneumonie_48h"] = all_datas_found["prompt_pcime_pneumonie_48h"][i]["nbr"]
                    chwsData["prompt_pcime_pneumonie_72h"] = all_datas_found["prompt_pcime_pneumonie_72h"][i]["nbr"]
                    chwsData["femmes_enceintes_NC"] = all_datas_found["total_vad_femme_enceinte_NC_soins"][i]["nbr"]
                    chwsData["femme_postpartum_NC"] = all_datas_found["femme_postpartum_NC"][i]["nbr"]
                    chwsData["test_de_grossesse"] = all_datas_found["test_de_grossesse"][i]["nbr"]
                    
                    if KWARG['InsertIntoDhis2'] == True:
                        response = insertOrUpdateDataToDhis2(chwsData,KWARG)
                        if response[0] == '200':
                            pass

                    result.write("{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}\n".format(
                    chwsFound(i, "findByCode", 4),
                    chwsData["reported_date"], 
                    chwsData["district"],
                    chwsFound(i, "findByCode", 2),
                    chwsData["total_vad"],
                    chwsData["pcime"],
                    chwsData["suivi_pcime"],
                    chwsData["reference_pf"],
                    chwsData["reference_pcime"],
                    chwsData["reference_femmes_enceinte_postpartum"], 
                    chwsData["femmes_enceinte"], 
                    chwsData["femmes_postpartum"], 
                    chwsData["home_visit"],
                    chwsData["diarrhee_pcime"],
                    chwsData["paludisme_pcime"],
                    chwsData["pneumonie_pcime"],
                    chwsData["malnutrition_pcime"],
                    chwsData["prompt_pcime_diarrhee_24h"],
                    chwsData["prompt_pcime_diarrhee_48h"],
                    chwsData["prompt_pcime_diarrhee_72h"],
                    chwsData["prompt_pcime_paludisme_24h"],
                    chwsData["prompt_pcime_paludisme_48h"],
                    chwsData["prompt_pcime_paludisme_72h"],
                    chwsData["prompt_pcime_pneumonie_24h"],
                    chwsData["prompt_pcime_pneumonie_48h"],
                    chwsData["prompt_pcime_pneumonie_72h"],
                    chwsData["femmes_enceintes_NC"],
                    chwsData["femme_postpartum_NC"],
                    chwsData["test_de_grossesse"],
                    chwsData["pf"]),)
                else:
                    # 'ChwsCode,ChwsName,Type,District,Site,consultation'
                    data = ''
                    if data_type == medicDataType()[0]:
                        data = total_vad
                    elif data_type == medicDataType()[1]:
                        data = all_datas_found["home_visit"][i]["nbr"]
                    else:
                        data = int(total_vad) - int(all_datas_found["home_visit"][i]["nbr"])

                    result.write("{},{},{},{},{},{}\n".format(
                    chwsFound(i, "findByCode", 4),
                    "Kozah",
                    chwsFound(i, "findByCode", 1),
                    chwsFound(i, "findByCode", 2),
                    '',
                    data
                    ),)
            # bar.finish()
        if fileName == defaultFileName:
            if found ==0:
                outPutData['Error'] += 1
                if 'noDataOnApp' not in outPutData['ErrorMsg']:
                    outPutData['ErrorMsg']['noDataOnApp'] = "Data was not found on CHT for this periode"

        if outPutData['Error'] == 0 and outPutData['Dhis2Import']['ErrorCount'] == 0:
            outPutData['success'] = 'true'
            # outPutData['Data'] = chwsData
    except:
        outPutData['Error'] +=1
        if 'server_error' not in outPutData['ErrorMsg']:
            outPutData['ErrorMsg']['server_error'] = " Can not connect to server to get Data. Check your Connection or informations you provided !"

    if KWARG['type'] == 'cht_only':
        allData = getOutPutDataFromFile(fileName0)
        outPutData["Data"]["head"] = allData['head']
        finalBody = allData['body']
        for row in finalBody:
            rowData = []
            for r in row:
                rowData.append(str(r).replace("'", '’'))
            outPutData["Data"]["body"][str(indexOf(finalBody,row))] = rowData
        print(str(outPutData).replace("'", '"'))


KWARGS = json.loads(sys.argv[1])

if KWARGS['type'] == 'cht_only':
    # flushIhChtDataToDhis2(KWARGS)
    createExtractFolderIfNotExist()
    couch = couchdb.Server("https://{}:{}@{}".format(KWARGS['cht_username'],KWARGS['cht_password'], KWARGS['cht_host']))[KWARGS['cht_database']]

    for row in couch.view("medic-client/reports_by_date", key=[date_to_milisecond(KWARGS['start_date'], True)], endkey=[date_to_milisecond(KWARGS['end_date'], False)], **COUCH_KWARGS):

        print(row.doc)