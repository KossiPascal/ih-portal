# _*_ coding:utf-8 _*_

import json
import tableauserverclient as TSC
from datetime import datetime
from operator import indexOf
import pandas as pd  
import csv
from functions import extractFolder, createExtractFolderIfNotExist, createFile, deleteFile, dhisApi, extractPath, getData, getDhis2OrgUnit, getMatchDataElementUid, getOtherData, getOutPutData, getOutPutDataFromFile, getVal, getValue, matchDhis2Data, signIn

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

def GenerateThinkMdDataToPushDhis2(KWARG):
    # #get data lenght
    # file0 = open(extractPath("output"+"_"+str(str(KWARG['userId']))+".csv"))
    # datalenght = len(list(csv.reader(file0))) -1
    # file0.close()
    
    # #Fecth data
    # file = open(extractPath("output"+"_"+str(KWARG['userId'])+".csv"))
    # csvreader = csv.reader(file)
    # headers = next(csvreader)

    fileData = getOutPutDataFromFile("output"+"_"+str(KWARG['userId']))
    headers = fileData['head']
    csvreader = fileData['body']


    with createFile(extractFolder(), "thinkMd_output_for_dhis2_"+str(KWARG['userId'])+"_output", ".json") as dhis2result:
        with createFile(extractFolder(), "thinkMd_output_"+str(KWARG['userId'])+"_output") as result:
            result.write("site,reported_date,district,asc_code,total_vad,pcime,suivi_pcime,reference_pf,reference_pcime,reference_femmes_enceinte_postpartum,femmes_enceinte,femmes_postpartum,home_visit,diarrhee_pcime,paludisme_pcime,pneumonie_pcime,malnutrition_pcime,prompt_pcime_diarrhee_24h,prompt_pcime_diarrhee_48h,prompt_pcime_diarrhee_72h,prompt_pcime_paludisme_24h,prompt_pcime_paludisme_48h,prompt_pcime_paludisme_72h,prompt_pcime_pneumonie_24h,prompt_pcime_pneumonie_48h,prompt_pcime_pneumonie_72h,total_vad_femme_enceinte_NC_soins,femme_postpartum_NC,test_de_grossesse,pf\n")


            dhis2DictionaryData = []
            for row in csvreader:
                data_source = ""
                reported_date = ""
                code_asc = ""
                district = ""
                pcime = ""
                suivi_pcime = ""
                total_vad = ""
                femmes_enceintes_NC = ""
                reference_pf = ""
                prompt_pcime_diarrhee_24h = ""
                prompt_pcime_diarrhee_48h = ""
                prompt_pcime_diarrhee_72h = ""
                prompt_pcime_paludisme_24h = ""
                prompt_pcime_paludisme_48h = ""
                prompt_pcime_paludisme_72h = ""
                prompt_pcime_pneumonie_24h = ""
                prompt_pcime_pneumonie_48h = ""
                prompt_pcime_pneumonie_72h = ""
                femmes_enceinte = ""
                reference_femmes_enceinte_postpartum = ""
                reference_pcime = ""
                diarrhee_pcime = ""
                femmes_postpartum = ""
                malnutrition_pcime = ""
                paludisme_pcime = ""
                pneumonie_pcime = ""
                femme_postpartum_NC = ""
                home_visit = ""
                test_de_grossesse = ""
                program = ""
                orgUnit = ""
                eventDate = ""
                status = ""
                completedDate = ""
                pf = ""

                for j in range(0,len(headers)):
                    data_source += getVal("FW6z2Ha2GNr", headers[j], row[j])
                    reported_date += getVal("lbHrQBTbY1d", headers[j], row[j])
                    code_asc += getVal("JkMyqI3e6or", headers[j], row[j])
                    district += getVal("JC752xYegbJ", headers[j], row[j])
                    pcime += getVal("lvW5Kj1cisa", headers[j], row[j])
                    suivi_pcime+= getVal("M6WRPsREqsZ", headers[j], row[j])
                    total_vad += getVal("oeDKJi4BICh", headers[j], row[j])
                    femmes_enceintes_NC += getVal("PrN89trdUGm", headers[j], row[j])
                    reference_pf += getVal("wdg7jjP9ZRg", headers[j], row[j])
                    prompt_pcime_diarrhee_24h += getVal("qNxNXSwDAaI", headers[j], row[j])
                    prompt_pcime_diarrhee_48h += getVal("S1zPDVOIVLZ", headers[j], row[j])
                    prompt_pcime_diarrhee_72h += getVal("nW3O5ULr75J", headers[j], row[j])
                    prompt_pcime_paludisme_24h += getVal("NUpARMZ383s", headers[j], row[j])
                    prompt_pcime_paludisme_48h += getVal("yQa48SF9bua", headers[j], row[j])
                    prompt_pcime_paludisme_72h += getVal("NzKjJuAniNx", headers[j], row[j])
                    prompt_pcime_pneumonie_24h += getVal("AA2We0Ao5sv", headers[j], row[j])
                    prompt_pcime_pneumonie_48h += getVal("PYwikai4k2J", headers[j], row[j])
                    prompt_pcime_pneumonie_72h += getVal("rgjFO0bDVUL", headers[j], row[j])
                    femmes_enceinte += getVal("WR9u3cGJn9W", headers[j], row[j])
                    reference_femmes_enceinte_postpartum += getVal("Pl6qRNgjd3a", headers[j], row[j])
                    reference_pcime += getVal("DicYcTqr9xT", headers[j], row[j])
                    diarrhee_pcime += getVal("caef2rf638P", headers[j], row[j])
                    femmes_postpartum += getVal("Q0BQtUdJOCy", headers[j], row[j])
                    malnutrition_pcime += getVal("dLYksBMOqST", headers[j], row[j])
                    paludisme_pcime += getVal("jp2i3vN3VJk", headers[j], row[j])
                    pneumonie_pcime += getVal("LZ3R8fj9CGG", headers[j], row[j])
                    femme_postpartum_NC += getVal("O9EZVn3C3pF", headers[j], row[j])
                    home_visit += getVal("lsBS60uQPtc", headers[j], row[j])
                    test_de_grossesse += getVal("lopdYxQrgyj", headers[j], row[j])
                    pf+= getVal("AzwUzgh0nd7", headers[j], row[j])
                    program += getVal("program", headers[j], row[j])
                    orgUnit += getVal("orgUnit", headers[j], row[j])
                    eventDate += getVal("eventDate", headers[j], row[j])
                    status += getVal("status", headers[j], row[j])
                    completedDate += getVal("completedDate", headers[j], row[j])
                
                if orgUnit in KWARG['sites']:
                    chwsData = {
                        "orgUnit": orgUnit,
                        "reported_date": reported_date,
                        "code_asc": code_asc,
                        "district": district,
                        "data_source": 'thinkmd',
                        "total_vad": total_vad,
                        "pcime": pcime,
                        "suivi_pcime": suivi_pcime,
                        "femmes_enceintes_NC": femmes_enceintes_NC,
                        "reference_pf": reference_pf,
                        "prompt_pcime_diarrhee_24h": prompt_pcime_diarrhee_24h,
                        "prompt_pcime_diarrhee_48h": prompt_pcime_diarrhee_48h,
                        "prompt_pcime_diarrhee_72h": prompt_pcime_diarrhee_72h,
                        "prompt_pcime_paludisme_24h": prompt_pcime_paludisme_24h,
                        "prompt_pcime_paludisme_48h": prompt_pcime_paludisme_48h,
                        "prompt_pcime_paludisme_72h": prompt_pcime_paludisme_72h,
                        "prompt_pcime_pneumonie_24h": prompt_pcime_pneumonie_24h,
                        "prompt_pcime_pneumonie_48h": prompt_pcime_pneumonie_48h,
                        "prompt_pcime_pneumonie_72h": prompt_pcime_pneumonie_72h,
                        "femmes_enceinte": femmes_enceinte,
                        "reference_femmes_enceinte_postpartum": reference_femmes_enceinte_postpartum,
                        "reference_pcime": reference_pcime,
                        "diarrhee_pcime": diarrhee_pcime,
                        "femmes_postpartum": femmes_postpartum,
                        "malnutrition_pcime": malnutrition_pcime,
                        "paludisme_pcime": paludisme_pcime,
                        "pneumonie_pcime": pneumonie_pcime,
                        "femme_postpartum_NC": femme_postpartum_NC,
                        "home_visit": home_visit,
                        "test_de_grossesse": test_de_grossesse,
                        "pf": pf,
                    }
                    
                    if KWARG['InsertIntoDhis2'] == True:
                        dhis2DictionaryData.append(chwsData)

                    result.write("{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}\n".format(
                        getDhis2OrgUnit(chwsData["orgUnit"], False), # get Name
                        chwsData["reported_date"], 
                        chwsData["district"],
                        chwsData["code_asc"], # get Name
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
                
        # Serializing json
        json_object = json.dumps(dhis2DictionaryData, indent=4)
        # Writing to sample.json
        dhis2result.write(json_object)




    if outPutData['Error'] == 0 and outPutData['Dhis2Import']['ErrorCount'] == 0:
        outPutData['success'] = 'true'

    generateDataFromFinalFile(KWARG)

    # file.close()
    try:
        deleteFile(extractPath("output"+"_"+str(KWARG['userId'])+".csv"))
    except:
        pass



def getThinkMdDataFromCloud(KWARG):
    try:
        bigin = datetime.now()
        server = TSC.Server("https://{}".format(KWARG['thinkmd_host']), use_server_version=True)
        deleteFile(extractPath("brut"+"_"+str(KWARG['userId'])+".csv"))
        deleteFile(extractPath("results"+"_"+str(KWARG['userId'])+".csv"))
        deleteFile(extractPath("output"+"_"+str(KWARG['userId'])+".csv"))

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
            with open(f""+extractPath("brut"+"_"+str(KWARG['userId'])+".csv"), 'wb') as f:
                f.write(b''.join(default_view.csv))
        
        #################################################################################################""

        # file = open(extractPath("brut"+"_"+str(KWARG['userId'])+".csv"), 'r')
        # csvreader = csv.reader(file)
        # header = next(csvreader)
        fileData = getOutPutDataFromFile("brut"+"_"+str(KWARG['userId']))
        headers = fileData['head']
        csvreader = fileData['body']

        allData = []
        code = []
        title = []
        # for row in csvreader:
        for row in fileData['body']:
            allData.append(row)
            if row[0] not in code:
                code.append(row[0])
            if row[1] not in title:
                title.append(row[1])
        
        if len(allData)!=0 and len(code) != 0 and len(title) !=0:
            with createFile(extractFolder(), "results"+"_"+str(KWARG['userId'])) as result:
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

            #########################################################################################
            
            data = pd.read_csv(extractPath("results"+"_"+str(KWARG['userId'])+".csv"))
            for i in range(0,len(title)):
                try:
                    data.drop('Error'+str(i), inplace=True, axis=1)
                except:
                    pass
            data.to_csv(extractPath("output"+"_"+str(KWARG['userId'])+".csv"), index=False)
            deleteFile(extractPath("brut"+"_"+str(KWARG['userId'])+".csv"))
            deleteFile(extractPath("results"+"_"+str(KWARG['userId'])+".csv"))
            GenerateThinkMdDataToPushDhis2(KWARG)
        else:
            outPutData['Error'] +=1
            if 'noDataOnApp' not in outPutData['ErrorMsg']:
                outPutData['ErrorMsg']['noDataOnApp'] = "Data was not found on ThinkMd for this periode"
    except Exception as err:
        outPutData['Error'] +=1
        if 'server_error' not in outPutData['ErrorMsg']:
            # outPutData['ErrorMsg']['server_error'] = " Can not connect to server to get Data. Check your Connection or informations you provided !"
            outPutData['ErrorMsg']['server_error'] = " "+ str(err) 

        generateDataFromFinalFile(KWARG, True)





def generateDataFromFinalFile(KWARG, isError = False):
    if KWARG['type'] == 'thinkMd_only':
        if isError != True:
            try:
                allData = getOutPutDataFromFile("thinkMd_output_"+str(KWARG['userId'])+"_output")
                outPutData["Data"]["head"] = allData['head']
                finalBody = allData['body']
                for row in finalBody:
                    rowData = []
                    for r in row:
                        rowData.append(str(r).replace("'", '’'))
                    outPutData["Data"]["body"][str(indexOf(finalBody,row))] = rowData
            except:
                pass
        print(str(outPutData).replace("'", '"'))



KWARGS = json.loads(sys.argv[1])

if KWARGS['type'] == 'thinkMd_only':
    createExtractFolderIfNotExist()
    getThinkMdDataFromCloud(KWARGS)