# _*_ coding:utf-8 _*_

import json
import tableauserverclient as TSC
from datetime import datetime
from operator import indexOf
import pandas as pd  
import csv
from functions import createFile, deleteFile, dhisApi, extractFolder, extractPath, getData, getDhis2OrgUnit, getMatchDataElementUid, getOtherData, getOutPutData, getOutPutDataFromFile, getVal, getValue, matchDhis2Data, signIn

import sys
sys.stdout.reconfigure(encoding='utf-8')

outPutData = getOutPutData()


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
            r = ih_dhis_api.put(
                "events/"+r.json()["events"][0]['event'], json=json)
            outPutData['Dhis2Import']['Updated'] += 1
            return [str(r.status_code), 'Updated']
        else:
            r = ih_dhis_api.post("events", json=json)
            outPutData['Dhis2Import']['Created'] += 1
            return [str(r.status_code), 'Created']
    except Exception as err:
        outPutData['Dhis2Import']['ErrorCount'] +=1
        if outPutData['Dhis2Import']['ErrorMsg'] == None:
            # outPutData['Dhis2Import']['ErrorMsg'] = "Erreur lors de l'importation des données dans le DHIS2"
            outPutData['Dhis2Import']['ErrorMsg'] = " "+str(err)
        return [None, None]

def UploadThinkMdDataToDhis2(KWARG):
    #get data lenght
    file0 = open(extractPath("output"+"_"+str(str(KWARG['user']))+".csv"))
    datalenght = len(list(csv.reader(file0))) -1
    file0.close()
    
    #Fecth data
    file = open(extractPath("output"+"_"+str(KWARG['user'])+".csv"))
    csvreader = csv.reader(file)
    headers = next(csvreader)


    with createFile(extractFolder(), "thinkMd_output"+"_"+str(KWARG['user'])+"_output") as result:
        result.write("site,reported_date,district,asc_code,total_vad,total_vad_pcime_c,total_suivi_pcime_c,reference_femmes_pf,reference_pcime,reference_femmes_enceinte_postpartum,total_vad_femmes_enceinte,total_vad_femmes_postpartum,total_home_visit,total_diarrhee_pcime_soins,total_paludisme_pcime_soins,total_pneumonie_pcime_soins,total_malnutrition_pcime_soins,prompt_diarrhee_24h_pcime_soins,prompt_diarrhee_48h_pcime_soins,prompt_diarrhee_72h_pcime_soins,prompt_paludisme_24h_pcime_soins,prompt_paludisme_48h_pcime_soins,prompt_paludisme_72h_pcime_soins,prompt_pneumonie_24h_pcime_soins,prompt_pneumonie_48h_pcime_soins,prompt_pneumonie_72h_pcime_soins,total_vad_femme_enceinte_NC_soins,total_vad_femme_postpartum_NC,total_test_de_grossesse_domicile,total_vad_family_planning\n")
        i = 0
        response = ['','']

        for row in csvreader:
            data_source = ""
            reported_date = ""
            code_asc = ""
            district = ""
            total_vad_pcime_c = ""
            total_suivi_pcime_c = ""
            total_vad = ""
            total_vad_femmes_enceintes_NC = ""
            reference_femmes_pf = ""
            prompt_diarrhee_24h_pcime_soins = ""
            prompt_diarrhee_48h_pcime_soins = ""
            prompt_diarrhee_72h_pcime_soins = ""
            prompt_paludisme_24h_pcime_soins = ""
            prompt_paludisme_48h_pcime_soins = ""
            prompt_paludisme_72h_pcime_soins = ""
            prompt_pneumonie_24h_pcime_soins = ""
            prompt_pneumonie_48h_pcime_soins = ""
            prompt_pneumonie_72h_pcime_soins = ""
            total_vad_femmes_enceinte = ""
            reference_femmes_enceinte_postpartum = ""
            reference_pcime = ""
            total_diarrhee_pcime_soins = ""
            total_vad_femmes_postpartum = ""
            total_malnutrition_pcime_soins = ""
            total_paludisme_pcime_soins = ""
            total_pneumonie_pcime_soins = ""
            total_vad_femme_postpartum_NC = ""
            total_recherche_active = ""
            total_test_de_grossesse_domicile = ""
            program = ""
            orgUnit = ""
            eventDate = ""
            status = ""
            completedDate = ""
            total_vad_family_planning = ""

            for j in range(0,len(headers)):
                data_source += getVal("FW6z2Ha2GNr", headers[j], row[j])
                reported_date += getVal("lbHrQBTbY1d", headers[j], row[j])
                code_asc += getVal("JkMyqI3e6or", headers[j], row[j])
                district += getVal("JC752xYegbJ", headers[j], row[j])
                total_vad_pcime_c += getVal("lvW5Kj1cisa", headers[j], row[j])
                total_suivi_pcime_c+= getVal("M6WRPsREqsZ", headers[j], row[j])
                total_vad += getVal("oeDKJi4BICh", headers[j], row[j])
                total_vad_femmes_enceintes_NC += getVal("PrN89trdUGm", headers[j], row[j])
                reference_femmes_pf += getVal("wdg7jjP9ZRg", headers[j], row[j])
                prompt_diarrhee_24h_pcime_soins += getVal("qNxNXSwDAaI", headers[j], row[j])
                prompt_diarrhee_48h_pcime_soins += getVal("S1zPDVOIVLZ", headers[j], row[j])
                prompt_diarrhee_72h_pcime_soins += getVal("nW3O5ULr75J", headers[j], row[j])
                prompt_paludisme_24h_pcime_soins += getVal("NUpARMZ383s", headers[j], row[j])
                prompt_paludisme_48h_pcime_soins += getVal("yQa48SF9bua", headers[j], row[j])
                prompt_paludisme_72h_pcime_soins += getVal("NzKjJuAniNx", headers[j], row[j])
                prompt_pneumonie_24h_pcime_soins += getVal("AA2We0Ao5sv", headers[j], row[j])
                prompt_pneumonie_48h_pcime_soins += getVal("PYwikai4k2J", headers[j], row[j])
                prompt_pneumonie_72h_pcime_soins += getVal("rgjFO0bDVUL", headers[j], row[j])
                total_vad_femmes_enceinte += getVal("WR9u3cGJn9W", headers[j], row[j])
                reference_femmes_enceinte_postpartum += getVal("Pl6qRNgjd3a", headers[j], row[j])
                reference_pcime += getVal("DicYcTqr9xT", headers[j], row[j])
                total_diarrhee_pcime_soins += getVal("caef2rf638P", headers[j], row[j])
                total_vad_femmes_postpartum += getVal("Q0BQtUdJOCy", headers[j], row[j])
                total_malnutrition_pcime_soins += getVal("dLYksBMOqST", headers[j], row[j])
                total_paludisme_pcime_soins += getVal("jp2i3vN3VJk", headers[j], row[j])
                total_pneumonie_pcime_soins += getVal("LZ3R8fj9CGG", headers[j], row[j])
                total_vad_femme_postpartum_NC += getVal("O9EZVn3C3pF", headers[j], row[j])
                total_recherche_active += getVal("lsBS60uQPtc", headers[j], row[j])
                total_test_de_grossesse_domicile += getVal("lopdYxQrgyj", headers[j], row[j])
                total_vad_family_planning+= getVal("AzwUzgh0nd7", headers[j], row[j])
                program += getVal("program", headers[j], row[j])
                orgUnit += getVal("orgUnit", headers[j], row[j])
                eventDate += getVal("eventDate", headers[j], row[j])
                status += getVal("status", headers[j], row[j])
                completedDate += getVal("completedDate", headers[j], row[j])
            
            chwsData = {
                "orgUnit": orgUnit,
                "reported_date": reported_date,
                "code_asc": code_asc,
                "district": district,
                "data_source": 'thinkmd',
                "total_vad": total_vad,
                "total_vad_pcime_c": total_vad_pcime_c,
                "total_suivi_pcime_c": total_suivi_pcime_c,
                "total_vad_femmes_enceintes_NC": total_vad_femmes_enceintes_NC,
                "reference_femmes_pf": reference_femmes_pf,
                "prompt_diarrhee_24h_pcime_soins": prompt_diarrhee_24h_pcime_soins,
                "prompt_diarrhee_48h_pcime_soins": prompt_diarrhee_48h_pcime_soins,
                "prompt_diarrhee_72h_pcime_soins": prompt_diarrhee_72h_pcime_soins,
                "prompt_paludisme_24h_pcime_soins": prompt_paludisme_24h_pcime_soins,
                "prompt_paludisme_48h_pcime_soins": prompt_paludisme_48h_pcime_soins,
                "prompt_paludisme_72h_pcime_soins": prompt_paludisme_72h_pcime_soins,
                "prompt_pneumonie_24h_pcime_soins": prompt_pneumonie_24h_pcime_soins,
                "prompt_pneumonie_48h_pcime_soins": prompt_pneumonie_48h_pcime_soins,
                "prompt_pneumonie_72h_pcime_soins": prompt_pneumonie_72h_pcime_soins,
                "total_vad_femmes_enceinte": total_vad_femmes_enceinte,
                "reference_femmes_enceinte_postpartum": reference_femmes_enceinte_postpartum,
                "reference_pcime": reference_pcime,
                "total_diarrhee_pcime_soins": total_diarrhee_pcime_soins,
                "total_vad_femmes_postpartum": total_vad_femmes_postpartum,
                "total_malnutrition_pcime_soins": total_malnutrition_pcime_soins,
                "total_paludisme_pcime_soins": total_paludisme_pcime_soins,
                "total_pneumonie_pcime_soins": total_pneumonie_pcime_soins,
                "total_vad_femme_postpartum_NC": total_vad_femme_postpartum_NC,
                "total_recherche_active": total_recherche_active,
                "total_test_de_grossesse_domicile": total_test_de_grossesse_domicile,
                "total_vad_family_planning": total_vad_family_planning,
            }

            if KWARG['InsertIntoDhis2'] == True:
                response = insertOrUpdateDataToDhis2(chwsData, KWARG)
                if response[0] == '200':
                    pass
                else:
                    pass
            else:
                pass

            result.write("{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}\n".format(
                getDhis2OrgUnit(chwsData["orgUnit"], False), # get Name
                chwsData["reported_date"], 
                chwsData["district"],
                chwsData["code_asc"], # get Name
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
        

    if outPutData['Error'] == 0 and outPutData['Dhis2Import']['ErrorCount'] == 0:
        outPutData['success'] = 'true'

    generateDataFromFinalFile(KWARG)

    file.close()
    try:
        deleteFile(extractPath("output"+"_"+str(KWARG['user'])+".csv"))
    except:
        pass

def flushThinkMdDataToDhis2(KWARG):
    try:
        bigin = datetime.now()
        server = TSC.Server("https://{}".format(KWARG['thinkmd_host']), use_server_version=True)
        deleteFile(extractPath("brut"+"_"+str(KWARG['user'])+".csv"))
        deleteFile(extractPath("results"+"_"+str(KWARG['user'])+".csv"))
        deleteFile(extractPath("output"+"_"+str(KWARG['user'])+".csv"))

        with signIn(server,KWARG):
            
            req_option = TSC.RequestOptions()
            req_option.filter.add(TSC.Filter(TSC.RequestOptions.Field.Name,TSC.RequestOptions.Operator.Equals,'IH - homemade viz'))
            matching_workbooks, pagination_item = server.workbooks.get(req_option)
            final_view = []
            for i in matching_workbooks:
                server.workbooks.populate_views(i)
                views = i.views
                for v in views:
                    if v.content_url == 'IH-homemadeviz/sheets/DLforDHIS2-SInew':
                        final_view.append(v)
            default_view = final_view[0]
            csv_req_option =  TSC.ImageRequestOptions(imageresolution=TSC.ImageRequestOptions.Resolution.High,maxage=0)
            # csv_req_option =  TSC.CSVRequestOptions(maxage=0)
            # csv_req_option.vf('Prefecture corrected', 'Bassar')
            # csv_req_option.vf('Village corrected', 'Koundoum, Manga')
            date = str(KWARG['end_date']).split('-') #[2022,01,20]
            csv_req_option.vf('Mois corrigé SI', str(date[0])+str(date[1]))
            server.views.populate_csv(default_view, csv_req_option)
            with open(f""+extractPath("brut"+"_"+str(KWARG['user'])+".csv"), 'wb') as f:
                f.write(b''.join(default_view.csv))
        
        #################################################################################################""

        file = open(extractPath("brut"+"_"+str(KWARG['user'])+".csv"))
        csvreader = csv.reader(file)
        header = next(csvreader)
        allData = []
        code = []
        title = []
        for row in csvreader:
            allData.append(row)
            if row[0] not in code:
                code.append(row[0])
            if row[1] not in title:
                title.append(row[1])
        
        if len(allData)!=0 and len(code) != 0 and len(title) !=0:
            with createFile(extractFolder(), "results"+"_"+str(KWARG['user'])) as result:
                new = 'lbHrQBTbY1d,JC752xYegbJ,orgUnit,JkMyqI3e6or' #reported_date, district, orgUnit, codeASC
                for i in title:
                    new+=','+getMatchDataElementUid(i, indexOf(title,i))
                new+='\n' 
                result.write(new)
                for c in code:
                    otherData = getOtherData(allData,c)
                    old = ''
                    old+=otherData[0]
                    old+=','+otherData[1]
                    old+=','+getDhis2OrgUnit(otherData[2])
                    old+=','+c
                    for j in title:
                        old+=','+getData(allData,c,j)
                    old+='\n'
                    result.write(old)
            file.close()

            #########################################################################################
            
            data = pd.read_csv(extractPath("results"+"_"+str(KWARG['user'])+".csv"))
            for i in range(0,len(title)):
                try:
                    data.drop('Error'+str(i), inplace=True, axis=1)
                except:
                    pass
            data.to_csv(extractPath("output"+"_"+str(KWARG['user'])+".csv"), index=False)
            deleteFile(extractPath("brut"+"_"+str(KWARG['user'])+".csv"))
            deleteFile(extractPath("results"+"_"+str(KWARG['user'])+".csv"))
            UploadThinkMdDataToDhis2(KWARG)
        else:
            outPutData['Error'] +=1
            if 'noDataOnApp' not in outPutData['ErrorMsg']:
                outPutData['ErrorMsg']['noDataOnApp'] = "Data was not found on ThinkMd for this periode"
    except Exception as err:
        outPutData['Error'] +=1
        if 'server_error' not in outPutData['ErrorMsg']:
            # outPutData['ErrorMsg']['server_error'] = " Can not connect to server to get Data. Check your Connection or informations you provided !"
            outPutData['ErrorMsg']['server_error'] = " "+ str(err) 

        generateDataFromFinalFile(KWARG)





def generateDataFromFinalFile(KWARG):

    if KWARG['type'] == 'thinkMd_only':
        try:
            allData = getOutPutDataFromFile("thinkMd_output"+"_"+str(KWARG['user'])+"_output")
            outPutData["Data"]["head"] = allData['head']
            finalBody = allData['body']
            for row in finalBody:
                rowData = []
                for r in row:
                    # # ---------------------------
                    # if indexOf(row,r) == 0:
                    #     rowData.append(str(getDhis2OrgUnit(r, False)).replace("'", '’'))
                    # else:
                    #     rowData.append(str(r).replace("'", '’'))
                    # # ---------------------------
                    rowData.append(str(r).replace("'", '’'))
                outPutData["Data"]["body"][str(indexOf(finalBody,row))] = rowData
        except:
            pass
        print(str(outPutData).replace("'", '"'))



KWARGS = json.loads(sys.argv[1])

if KWARGS['type'] == 'thinkMd_only':
    flushThinkMdDataToDhis2(KWARGS)