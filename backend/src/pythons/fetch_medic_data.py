import json
from operator import indexOf
import sys
import couchdb

from functions import between, chwsFound, convert_milisecond_to_date, createFile, date_to_milisecond, dhisApi, districtFound, extractFolder, formView, getOutPutData, getOutPutDataFromFile, getValue, matchDhis2Data, medicDataType, record


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

    couch = couchdb.Server("https://{}:{}@{}".format(KWARG['medic_username'],KWARG['medic_password'], KWARG['medic_host']))[KWARG['medic_database']]

    total_reference_women_emergency_suivi = {}
    total_femme_enceinte_women_emergency_suivi = {}
    total_femme_postpartum_women_emergency_suivi = {}
    total_family_planning_renewal_suivi = {}
    total_reference_family_planning_renewal_suivi = {}
    total_home_visit = {}
    total_pcime_soins = {}
    total_pcime_suivi = {}
    total_reference_pcime_suivi = {}
    total_reference_pcime_soins = {}
    total_diarrhee_pcime_soins = {}
    total_paludisme_pcime_soins = {}
    total_pneumonie_pcime_soins = {}
    total_malnutrition_pcime_soins = {}
    prompt_diarrhee_24h_pcime_soins = {}
    prompt_diarrhee_48h_pcime_soins = {}
    prompt_diarrhee_72h_pcime_soins = {}
    prompt_paludisme_24h_pcime_soins = {}
    prompt_paludisme_48h_pcime_soins = {}
    prompt_paludisme_72h_pcime_soins = {}
    prompt_pneumonie_24h_pcime_soins = {}
    prompt_pneumonie_48h_pcime_soins = {}
    prompt_pneumonie_72h_pcime_soins = {}
    total_pregnancy_family_planning = {}
    total_reference_family_planning_soins = {}
    total_reference_femme_enceinte_soins = {}
    total_vad_femme_enceinte_NC_soins = {}
    total_vad_femme_enceinte_soins = {}
    total_test_de_grossesse_domicile = {}
    total_newborn_suivi = {}
    total_reference_newborn = {}
    total_malnutrition_suivi = {}
    total_reference_malnutrition_suivi = {}
    total_prenatal_suivi = {}
    total_reference_prenatal_suivi = {}
    total_postnatal_suivi = {}
    total_reference_postnatal_suivi = {}
    total_vad_femme_postpartum_NC = {}
    total_vad_women_emergency_suivi = {}
    total_vad_family_planning_NC = {}

    x = 0
    
    for row in couch.view("medic-client/reports_by_date", key=[date_to_milisecond(KWARG['start_date'], True)], endkey=[date_to_milisecond(KWARG['end_date'], False)], **COUCH_KWARGS):

        try:
            createdAt = convert_milisecond_to_date(row.doc["reported_date"])
            if between(createdAt, KWARG['start_date'], KWARG['end_date']) and chwsFound(row.doc) and districtFound(row.doc) and record(row.doc):
                asc = chwsFound(row.doc, "code")
                field = row.doc["fields"]
                if formView(row.doc, "home_visit"):
                    if asc not in total_home_visit:
                        total_home_visit[asc] = {"asc": asc, "nbr": 1}
                    else:
                        total_home_visit[asc]["nbr"] += 1

                if formView(row.doc, "pcime_c_asc"):
                    if asc not in total_pcime_soins:
                        total_pcime_soins[asc] = {"asc": asc, "nbr": 1}
                    else:
                        total_pcime_soins[asc]["nbr"] += 1

                    if field["group_review"]["s_have_you_refer_child"] == "yes":  # err medic
                        if asc not in total_reference_pcime_soins:
                            total_reference_pcime_soins[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_reference_pcime_soins[asc]["nbr"] += 1

                    if field["has_diarrhea"] == "true":  # err medic
                        if asc not in total_diarrhee_pcime_soins:
                            total_diarrhee_pcime_soins[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_diarrhee_pcime_soins[asc]["nbr"] += 1

                        if field["within_24h"] == "true":
                            if asc not in prompt_diarrhee_24h_pcime_soins:
                                prompt_diarrhee_24h_pcime_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_diarrhee_24h_pcime_soins[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true":
                            if asc not in prompt_diarrhee_48h_pcime_soins:
                                prompt_diarrhee_48h_pcime_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_diarrhee_48h_pcime_soins[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true" or field["within_72h"] == "true":
                            if asc not in prompt_diarrhee_72h_pcime_soins:
                                prompt_diarrhee_72h_pcime_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_diarrhee_72h_pcime_soins[asc]["nbr"] += 1

                    if field["fever_with_malaria"] == "true":
                        # field["s_fever"]["s_fever_child_TDR_result"] == "positive"
                        if asc not in total_paludisme_pcime_soins:
                            total_paludisme_pcime_soins[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_paludisme_pcime_soins[asc]["nbr"] += 1

                        if field["within_24h"] == "true":
                            if asc not in prompt_paludisme_24h_pcime_soins:
                                prompt_paludisme_24h_pcime_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_paludisme_24h_pcime_soins[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true":
                            if asc not in prompt_paludisme_48h_pcime_soins:
                                prompt_paludisme_48h_pcime_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_paludisme_48h_pcime_soins[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true" or field["within_72h"] == "true":
                            if asc not in prompt_paludisme_72h_pcime_soins:
                                prompt_paludisme_72h_pcime_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_paludisme_72h_pcime_soins[asc]["nbr"] += 1

                    if field["has_pneumonia"] == "true":
                        if asc not in total_pneumonie_pcime_soins:
                            total_pneumonie_pcime_soins[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_pneumonie_pcime_soins[asc]["nbr"] += 1

                        if field["within_24h"] == "true":
                            if asc not in prompt_pneumonie_24h_pcime_soins:
                                prompt_pneumonie_24h_pcime_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pneumonie_24h_pcime_soins[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true":
                            if asc not in prompt_pneumonie_48h_pcime_soins:
                                prompt_pneumonie_48h_pcime_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pneumonie_48h_pcime_soins[asc]["nbr"] += 1

                        if field["within_24h"] == "true" or field["within_48h"] == "true" or field["within_72h"] == "true":
                            if asc not in prompt_pneumonie_72h_pcime_soins:
                                prompt_pneumonie_72h_pcime_soins[asc] = {
                                    "asc": asc, "nbr": 1}
                            else:
                                prompt_pneumonie_72h_pcime_soins[asc]["nbr"] += 1

                    if field["has_malnutrition"] == "true":
                        # field["s_constant"]["s_constant_child_brachial_perimeter"] < 125:
                        if asc not in total_malnutrition_pcime_soins:
                            total_malnutrition_pcime_soins[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_malnutrition_pcime_soins[asc]["nbr"] += 1

                if formView(row.doc, "pcime_c_followup"):
                    if asc not in total_pcime_suivi:
                        total_pcime_suivi[asc] = {"asc": asc, "nbr": 1}
                    else:
                        total_pcime_suivi[asc]["nbr"] += 1
                    if field["group_review"]["s_have_you_refer_child"] == "yes":
                        if asc not in total_reference_pcime_suivi:
                            total_reference_pcime_suivi[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_reference_pcime_suivi[asc]["nbr"] += 1

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
                        if asc not in total_vad_femme_postpartum_NC:
                            total_vad_femme_postpartum_NC[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_vad_femme_postpartum_NC[asc]["nbr"] += 1

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
                                if asc not in total_test_de_grossesse_domicile:
                                    total_test_de_grossesse_domicile[asc] = {
                                        "asc": asc, "nbr": 1}
                                else:
                                    total_test_de_grossesse_domicile[asc]["nbr"] += 1

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
                                if asc not in total_vad_family_planning_NC:
                                    total_vad_family_planning_NC[asc] = {"asc": asc, "nbr": 1}
                                else:
                                    total_vad_family_planning_NC[asc]["nbr"] += 1

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
                        if asc not in total_femme_enceinte_women_emergency_suivi:
                            total_femme_enceinte_women_emergency_suivi[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_femme_enceinte_women_emergency_suivi[asc]["nbr"] += 1

                    if field["initial"]["woman_status"] == "postpartum":
                        if asc not in total_femme_postpartum_women_emergency_suivi:
                            total_femme_postpartum_women_emergency_suivi[asc] = {
                                "asc": asc, "nbr": 1}
                        else:
                            total_femme_postpartum_women_emergency_suivi[asc]["nbr"] += 1

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
                outPutData['ErrorMsg']['noDataOnApp'] = "Error when trying to get data from Medic Mobile database"


    for i in chwsFound("chws", "chws_array"):
        if i not in total_newborn_suivi:
            total_newborn_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_women_emergency_suivi:
            total_reference_women_emergency_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_femme_enceinte_women_emergency_suivi:
            total_femme_enceinte_women_emergency_suivi[i] = {
                "asc": i, "nbr": 0}
        if i not in total_femme_postpartum_women_emergency_suivi:
            total_femme_postpartum_women_emergency_suivi[i] = {
                "asc": i, "nbr": 0}
        if i not in total_family_planning_renewal_suivi:
            total_family_planning_renewal_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_family_planning_renewal_suivi:
            total_reference_family_planning_renewal_suivi[i] = {
                "asc": i, "nbr": 0}
        if i not in total_home_visit:
            total_home_visit[i] = {"asc": i, "nbr": 0}
        if i not in total_pcime_soins:
            total_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in total_pcime_suivi:
            total_pcime_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_pcime_suivi:
            total_reference_pcime_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_reference_pcime_soins:
            total_reference_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in total_diarrhee_pcime_soins:
            total_diarrhee_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in total_paludisme_pcime_soins:
            total_paludisme_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in total_pneumonie_pcime_soins:
            total_pneumonie_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in total_malnutrition_pcime_soins:
            total_malnutrition_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in prompt_diarrhee_24h_pcime_soins:
            prompt_diarrhee_24h_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in prompt_diarrhee_48h_pcime_soins:
            prompt_diarrhee_48h_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in prompt_diarrhee_72h_pcime_soins:
            prompt_diarrhee_72h_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in prompt_paludisme_24h_pcime_soins:
            prompt_paludisme_24h_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in prompt_paludisme_48h_pcime_soins:
            prompt_paludisme_48h_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in prompt_paludisme_72h_pcime_soins:
            prompt_paludisme_72h_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pneumonie_24h_pcime_soins:
            prompt_pneumonie_24h_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pneumonie_48h_pcime_soins:
            prompt_pneumonie_48h_pcime_soins[i] = {"asc": i, "nbr": 0}
        if i not in prompt_pneumonie_72h_pcime_soins:
            prompt_pneumonie_72h_pcime_soins[i] = {"asc": i, "nbr": 0}
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
        if i not in total_test_de_grossesse_domicile:
            total_test_de_grossesse_domicile[i] = {"asc": i, "nbr": 0}
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
        if i not in total_vad_femme_postpartum_NC:
            total_vad_femme_postpartum_NC[i] = {"asc": i, "nbr": 0}
        if i not in total_vad_women_emergency_suivi:
            total_vad_women_emergency_suivi[i] = {"asc": i, "nbr": 0}
        if i not in total_vad_family_planning_NC:
            total_vad_family_planning_NC[i] = {"asc": i, "nbr": 0}

    return {"total_home_visit": total_home_visit,
            "total_pcime_soins": total_pcime_soins,
            "total_pcime_suivi": total_pcime_suivi,
            "total_reference_pcime_suivi": total_reference_pcime_suivi,
            "total_reference_pcime_soins": total_reference_pcime_soins,
            "total_diarrhee_pcime_soins": total_diarrhee_pcime_soins,
            "total_paludisme_pcime_soins": total_paludisme_pcime_soins,
            "total_pneumonie_pcime_soins": total_pneumonie_pcime_soins,
            "total_malnutrition_pcime_soins": total_malnutrition_pcime_soins,
            "prompt_diarrhee_24h_pcime_soins": prompt_diarrhee_24h_pcime_soins,
            "prompt_diarrhee_48h_pcime_soins": prompt_diarrhee_48h_pcime_soins,
            "prompt_diarrhee_72h_pcime_soins": prompt_diarrhee_72h_pcime_soins,
            "prompt_paludisme_24h_pcime_soins": prompt_paludisme_24h_pcime_soins,
            "prompt_paludisme_48h_pcime_soins": prompt_paludisme_48h_pcime_soins,
            "prompt_paludisme_72h_pcime_soins": prompt_paludisme_72h_pcime_soins,
            "prompt_pneumonie_24h_pcime_soins": prompt_pneumonie_24h_pcime_soins,
            "prompt_pneumonie_48h_pcime_soins": prompt_pneumonie_48h_pcime_soins,
            "prompt_pneumonie_72h_pcime_soins": prompt_pneumonie_72h_pcime_soins,
            "total_pregnancy_family_planning": total_pregnancy_family_planning,
            "total_reference_family_planning_soins": total_reference_family_planning_soins,
            "total_reference_femme_enceinte_soins": total_reference_femme_enceinte_soins,
            "total_vad_femme_enceinte_soins": total_vad_femme_enceinte_soins,
            "total_vad_femme_enceinte_NC_soins": total_vad_femme_enceinte_NC_soins,
            "total_test_de_grossesse_domicile": total_test_de_grossesse_domicile,
            "total_newborn_suivi": total_newborn_suivi,
            "total_reference_newborn": total_reference_newborn,
            "total_malnutrition_suivi": total_malnutrition_suivi,
            "total_reference_malnutrition_suivi": total_reference_malnutrition_suivi,
            "total_prenatal_suivi": total_prenatal_suivi,
            "total_reference_prenatal_suivi": total_reference_prenatal_suivi,
            "total_postnatal_suivi": total_postnatal_suivi,
            "total_reference_postnatal_suivi": total_reference_postnatal_suivi,
            "total_vad_femme_postpartum_NC": total_vad_femme_postpartum_NC,
            "total_vad_women_emergency_suivi": total_vad_women_emergency_suivi,
            "total_reference_women_emergency_suivi": total_reference_women_emergency_suivi,
            "total_femme_enceinte_women_emergency_suivi": total_femme_enceinte_women_emergency_suivi,
            "total_femme_postpartum_women_emergency_suivi": total_femme_postpartum_women_emergency_suivi,
            "total_family_planning_renewal_suivi": total_family_planning_renewal_suivi,
            "total_reference_family_planning_renewal_suivi": total_reference_family_planning_renewal_suivi,
            "total_vad_family_planning_NC": total_vad_family_planning_NC
            }

def flushMedicDataToDhis2(KWARG,fileName = "medic_output",data_type = "Consultation"):

    defaultFileName = "medic_output"

    if fileName == defaultFileName:
        # deleteFile(extractPath(fileName+".csv"))
        fileName0 = fileName+"_"+KWARG['user']+"_output"
    else:
        fileName0 = fileName

    try:
        all_datas_found = countDataFound(KWARG)

        total_pcime_soins = all_datas_found["total_pcime_soins"]
        total_pregnancy_family_planning = all_datas_found["total_pregnancy_family_planning"]
        total_pcime_suivi = all_datas_found["total_pcime_suivi"]
        total_newborn_suivi = all_datas_found["total_newborn_suivi"]
        total_malnutrition_suivi = all_datas_found["total_malnutrition_suivi"]
        total_prenatal_suivi = all_datas_found["total_prenatal_suivi"]
        total_postnatal_suivi = all_datas_found["total_postnatal_suivi"]
        total_vad_women_emergency_suivi = all_datas_found["total_vad_women_emergency_suivi"]
        total_family_planning_renewal_suivi = all_datas_found["total_family_planning_renewal_suivi"]
        total_reference_pcime_soins = all_datas_found["total_reference_pcime_soins"]
        total_reference_pcime_suivi = all_datas_found["total_reference_pcime_suivi"]
        total_reference_newborn = all_datas_found["total_reference_newborn"]
        total_reference_malnutrition_suivi = all_datas_found["total_reference_malnutrition_suivi"]
        total_reference_family_planning_soins = all_datas_found["total_reference_family_planning_soins"]
        total_reference_femme_enceinte_soins = all_datas_found["total_reference_femme_enceinte_soins"]
        total_reference_family_planning_renewal_suivi = all_datas_found["total_reference_family_planning_renewal_suivi"]
        total_reference_prenatal_suivi = all_datas_found["total_reference_prenatal_suivi"]
        total_reference_postnatal_suivi = all_datas_found["total_reference_postnatal_suivi"]
        total_reference_women_emergency_suivi = all_datas_found["total_reference_women_emergency_suivi"]
        total_vad_femme_enceinte_soins = all_datas_found["total_vad_femme_enceinte_soins"]
        total_femme_enceinte_women_emergency_suivi = all_datas_found["total_femme_enceinte_women_emergency_suivi"]
        total_femme_postpartum_women_emergency_suivi = all_datas_found["total_femme_postpartum_women_emergency_suivi"]

        with createFile(extractFolder(), fileName0) as result:
            if fileName == defaultFileName:
                result.write("site,reported_date,district,asc_code,total_vad,total_vad_pcime_c,total_suivi_pcime_c,reference_femmes_pf,reference_pcime,reference_femmes_enceinte_postpartum,total_vad_femmes_enceinte,total_vad_femmes_postpartum,total_home_visit,total_diarrhee_pcime_soins,total_paludisme_pcime_soins,total_pneumonie_pcime_soins,total_malnutrition_pcime_soins,prompt_diarrhee_24h_pcime_soins,prompt_diarrhee_48h_pcime_soins,prompt_diarrhee_72h_pcime_soins,prompt_paludisme_24h_pcime_soins,prompt_paludisme_48h_pcime_soins,prompt_paludisme_72h_pcime_soins,prompt_pneumonie_24h_pcime_soins,prompt_pneumonie_48h_pcime_soins,prompt_pneumonie_72h_pcime_soins,total_vad_femme_enceinte_NC_soins,total_vad_femme_postpartum_NC,total_test_de_grossesse_domicile,total_vad_family_planning\n")
            else:
                result.write("Site,District,ChwsCode,ChwsName,Type,"+KWARG['start_date']+"\n")
                # result.write("ChwsCode,ChwsName,Type,District,Site,total_vad,home_visite,consultation\n")
            found = 0
            response = ['','']
            # datalenght = len(chwsFound("chws", "chws_array"))
            for i in chwsFound("chws", "chws_array"):
                chwsData = {}
                total_vad  = all_datas_found["total_home_visit"][i]["nbr"] + total_pcime_soins[i]["nbr"] + total_pregnancy_family_planning[i]["nbr"] +  \
                            total_pcime_suivi[i]["nbr"] + total_newborn_suivi[i]["nbr"] + total_prenatal_suivi[i]["nbr"] + total_postnatal_suivi[i]["nbr"] + \
                            total_malnutrition_suivi[i]["nbr"] + total_vad_women_emergency_suivi[i]["nbr"] + total_family_planning_renewal_suivi[i]["nbr"]
                # if int(total_vad) != 0:
                if fileName == defaultFileName:
                    found+=1
                    total_vad_pcime_c = total_pcime_soins[i]["nbr"] + total_pcime_suivi[i]["nbr"] + total_newborn_suivi[i]["nbr"] + total_malnutrition_suivi[i]["nbr"]
                    total_suivi_pcime_c = total_pcime_suivi[i]["nbr"] + total_newborn_suivi[i]["nbr"] + total_malnutrition_suivi[i]["nbr"]

                    reference_femmes_pf = total_reference_family_planning_soins[i]["nbr"] + total_reference_family_planning_renewal_suivi[i]["nbr"]
                    reference_pcime = total_reference_pcime_soins[i]["nbr"] + total_reference_pcime_suivi[i]["nbr"] + total_reference_newborn[i]["nbr"] + \
                                        total_reference_malnutrition_suivi[i]["nbr"]
                    reference_femmes_enceinte_postpartum = total_reference_femme_enceinte_soins[i]["nbr"] + total_reference_prenatal_suivi[i]["nbr"] + \
                                                            total_reference_postnatal_suivi[i]["nbr"] + total_reference_women_emergency_suivi[i]["nbr"]
                    total_vad_femmes_enceinte = total_vad_femme_enceinte_soins[i]["nbr"] + total_prenatal_suivi[i]["nbr"] + total_femme_enceinte_women_emergency_suivi[i]["nbr"]
                    total_vad_femmes_postpartum = total_postnatal_suivi[i]["nbr"] + total_femme_postpartum_women_emergency_suivi[i]["nbr"]
                    # total_vad_family_planning = all_datas_found["total_vad_family_planning_NC"][i]["nbr"] + total_family_planning_renewal_suivi[i]["nbr"]
                    total_vad_family_planning = total_vad - (total_vad_pcime_c + total_vad_femmes_enceinte + total_vad_femmes_postpartum + all_datas_found["total_home_visit"][i]["nbr"])
                    
                    ############################################ 
                    
                    chwsData["orgUnit"] = chwsFound(i, "findByCode",5)
                    chwsData["reported_date"] = KWARG['end_date']
                    chwsData["code_asc"] = i
                    chwsData["district"] = "Kozah"
                    chwsData["data_source"] = 'medic'
                    chwsData["total_vad"] = total_vad
                    chwsData["total_vad_pcime_c"] = total_vad_pcime_c
                    chwsData["total_suivi_pcime_c"] = total_suivi_pcime_c
                    chwsData["total_vad_femmes_enceinte"] = total_vad_femmes_enceinte
                    chwsData["total_vad_femmes_postpartum"] = total_vad_femmes_postpartum
                    chwsData["total_recherche_active"] = all_datas_found["total_home_visit"][i]["nbr"]
                    chwsData["total_vad_family_planning"] = total_vad_family_planning
                    chwsData["reference_femmes_pf"] = reference_femmes_pf
                    chwsData["reference_pcime"] = reference_pcime
                    chwsData["reference_femmes_enceinte_postpartum"] = reference_femmes_enceinte_postpartum
                    chwsData["total_diarrhee_pcime_soins"] = all_datas_found["total_diarrhee_pcime_soins"][i]["nbr"]
                    chwsData["total_paludisme_pcime_soins"] = all_datas_found["total_paludisme_pcime_soins"][i]["nbr"]
                    chwsData["total_pneumonie_pcime_soins"] = all_datas_found["total_pneumonie_pcime_soins"][i]["nbr"]
                    chwsData["total_malnutrition_pcime_soins"] = all_datas_found["total_malnutrition_pcime_soins"][i]["nbr"]
                    chwsData["prompt_diarrhee_24h_pcime_soins"] = all_datas_found["prompt_diarrhee_24h_pcime_soins"][i]["nbr"]
                    chwsData["prompt_diarrhee_48h_pcime_soins"] = all_datas_found["prompt_diarrhee_48h_pcime_soins"][i]["nbr"]
                    chwsData["prompt_diarrhee_72h_pcime_soins"] = all_datas_found["prompt_diarrhee_72h_pcime_soins"][i]["nbr"]
                    chwsData["prompt_paludisme_24h_pcime_soins"] = all_datas_found["prompt_paludisme_24h_pcime_soins"][i]["nbr"]
                    chwsData["prompt_paludisme_48h_pcime_soins"] = all_datas_found["prompt_paludisme_48h_pcime_soins"][i]["nbr"]
                    chwsData["prompt_paludisme_72h_pcime_soins"] = all_datas_found["prompt_paludisme_72h_pcime_soins"][i]["nbr"]
                    chwsData["prompt_pneumonie_24h_pcime_soins"] = all_datas_found["prompt_pneumonie_24h_pcime_soins"][i]["nbr"]
                    chwsData["prompt_pneumonie_48h_pcime_soins"] = all_datas_found["prompt_pneumonie_48h_pcime_soins"][i]["nbr"]
                    chwsData["prompt_pneumonie_72h_pcime_soins"] = all_datas_found["prompt_pneumonie_72h_pcime_soins"][i]["nbr"]
                    chwsData["total_vad_femmes_enceintes_NC"] = all_datas_found["total_vad_femme_enceinte_NC_soins"][i]["nbr"]
                    chwsData["total_vad_femme_postpartum_NC"] = all_datas_found["total_vad_femme_postpartum_NC"][i]["nbr"]
                    chwsData["total_test_de_grossesse_domicile"] = all_datas_found["total_test_de_grossesse_domicile"][i]["nbr"]
                    
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
                    chwsData["total_vad_pcime_c"],
                    chwsData["total_suivi_pcime_c"],
                    chwsData["reference_femmes_pf"],
                    chwsData["reference_pcime"],
                    chwsData["reference_femmes_enceinte_postpartum"], 
                    chwsData["total_vad_femmes_enceinte"], 
                    chwsData["total_vad_femmes_postpartum"], 
                    chwsData["total_recherche_active"],
                    chwsData["total_diarrhee_pcime_soins"],
                    chwsData["total_paludisme_pcime_soins"],
                    chwsData["total_pneumonie_pcime_soins"],
                    chwsData["total_malnutrition_pcime_soins"],
                    chwsData["prompt_diarrhee_24h_pcime_soins"],
                    chwsData["prompt_diarrhee_48h_pcime_soins"],
                    chwsData["prompt_diarrhee_72h_pcime_soins"],
                    chwsData["prompt_paludisme_24h_pcime_soins"],
                    chwsData["prompt_paludisme_48h_pcime_soins"],
                    chwsData["prompt_paludisme_72h_pcime_soins"],
                    chwsData["prompt_pneumonie_24h_pcime_soins"],
                    chwsData["prompt_pneumonie_48h_pcime_soins"],
                    chwsData["prompt_pneumonie_72h_pcime_soins"],
                    chwsData["total_vad_femmes_enceintes_NC"],
                    chwsData["total_vad_femme_postpartum_NC"],
                    chwsData["total_test_de_grossesse_domicile"],
                    chwsData["total_vad_family_planning"]),)
                else:
                    # 'ChwsCode,ChwsName,Type,District,Site,consultation'
                    data = ''
                    if data_type == medicDataType()[0]:
                        data = total_vad
                    elif data_type == medicDataType()[1]:
                        data = all_datas_found["total_home_visit"][i]["nbr"]
                    else:
                        data = int(total_vad) - int(all_datas_found["total_home_visit"][i]["nbr"])

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
                    outPutData['ErrorMsg']['noDataOnApp'] = "Data was not found on Medic for this periode"

        if outPutData['Error'] == 0 and outPutData['Dhis2Import']['ErrorCount'] == 0:
            outPutData['success'] = 'true'
            # outPutData['Data'] = chwsData
    except:
        outPutData['Error'] +=1
        if 'server_error' not in outPutData['ErrorMsg']:
            outPutData['ErrorMsg']['server_error'] = " Can not connect to server to get Data. Check your Connection or informations you provided !"

    if KWARG['type'] == 'medic_only':
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

if KWARGS['type'] == 'medic_only':
    flushMedicDataToDhis2(KWARGS)