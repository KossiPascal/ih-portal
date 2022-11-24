# _*_ coding:utf-8 _*_

import csv
import os
from dhis2 import Api
from datetime import datetime, timedelta
import io
import tableauserverclient as TSC

def pythonFolder():
     #pythons
    return os.path.dirname(__file__) or '.'

def srcFolder():
     #src
    return os.path.dirname(pythonFolder())

def backendFolder():
     #backend
    return os.path.dirname(srcFolder())

def projectFolder():
     #ih-portal
    return os.path.dirname(backendFolder())

def projectFolderParent():
     #ih-portal parent
    return os.path.dirname(projectFolder)

def sslFolder(file_Name_with_extension):
    return projectFolderParent()+"/ssl/"+file_Name_with_extension


def OPEN_KWARGS(mode='w'):
    return {
        'mode': mode,
        'encoding': 'utf8',
        'errors': 'strict',
        'buffering': 1
    }
    
def getOutPutDataFromFile(fileName):
    finalFile = open(extractPath(fileName)+'.csv', **OPEN_KWARGS('r'))
    finalFileCsvReader = csv.reader(finalFile)
    finalCsvFileHeader = next(finalFileCsvReader)
    finalCsvFileBody = list(finalFileCsvReader)
    return {
        "head":finalCsvFileHeader,
        "body":finalCsvFileBody
    }

def getOutPutData():
    return {
        "success": "false",
        "Error": 0,
        "ErrorMsg": {},
        "Dhis2Import":{'ErrorCount':0, "ErrorMsg":'', "Created": 0, "Updated": 0, "Deleted": 0},
        "Data": {"head":{}, "body":{}}
    }

def signIn(server,KWARG):

    if KWARG['useToken'] == True:
        tableau_auth = TSC.PersonalAccessTokenAuth(token_name="{}".format(KWARG["thinkmd_token_username"]),personal_access_token="{}".format(KWARG["thinkmd_token"]), site_id="{}".format(KWARG["thinkmd_site"]))
        # print('with Token')
        return server.auth.sign_in_with_personal_access_token(tableau_auth)
    else:
        tableau_auth = TSC.TableauAuth("{}".format(KWARG["thinkmd_username"]),"{}".format(KWARG["thinkmd_password"]),"{}".format(KWARG["thinkmd_site"]))
        # print('with user access')
        return server.auth.sign_in(tableau_auth)

def addOrSubtractDay(date,day,sub=False):
    if sub:
        return date - timedelta(day)
    return date + timedelta(day)

def datetimeToString(date,type='en'):
    # year = date.strftime("%Y") | month = date.strftime("%m") | day = date.strftime("%d")
    # time = date.strftime("%H:%M:%S") | return date.strftime("%m/%d/%Y, %H:%M:%S")
    if type == 'en':
        return date.strftime("%Y-%m-%d")
    return date.strftime("%d/%m/%Y")

def stringToDate(date):
    # date_time_str = '18/09/19 01:55:19'
    # date_time_obj = datetime.strptime(date_time_str, '%d/%m/%y %H:%M:%S')
    return datetime.strptime(date, '%Y-%m-%d')

def addDayToStringDate(date,day):
    # print(datetimeToString(addOrSubtractDay(stringToDate(date),day)))
    return datetimeToString(addOrSubtractDay(stringToDate(date),day))

def nextMondayDate(date):
    date = stringToDate(date)
    return date + timedelta(days=-date.weekday(), weeks=1)

def getNexSundayDate(date):
    return datetimeToString(addOrSubtractDay(nextMondayDate(date),1,True))

def dhisApi(KWARG):
    return Api("https://{}".format(KWARG['dhis2_host']),"{}".format(KWARG['dhis2_username']), "{}".format(KWARG['dhis2_password']))

def createFolder(folderName):
    if not os.path.exists(pythonFolder()+'/'+folderName):
        os.mkdir(pythonFolder()+'/'+folderName)

def createFile(folderName, fileName):
    createFolder(folderName)
    return io.open(pythonFolder()+'/'+folderName+'/'+fileName+'.csv', **OPEN_KWARGS())

def getReportOrgUnit(data,codeAsc):
    d = ','
    for e in data:
        if e == codeAsc.split('-')[0]:
            d = data[e]['site']+','+data[e]['district']
    return d

def extractFolder():
    """ extract folder name"""
    return 'extracts'  

def getReportData(data,codeAsc, dataDate):
    d = '0'
    for row in data:
        if row[0] == codeAsc and row[2] == dataDate:
            d = row[4]
    return d

def extractPath(file):
    return pythonFolder()+'/'+extractFolder()+"/"+file

def pathExist(pathName):
    return os.path.exists(pathName)

def deleteFile(filePath):
    # check if file exists 
    try:
        if os.path.exists(filePath):
            os.remove(filePath)
    except:
        pass

def chwRemplacante(chwname):
    if chwname.find('(R)')!=-1:
        return 'Remplaçante'
    return ''

def convertDate(dateString):
    if dateString == 'All':
        return 'Total'
    return dateString[6:]+'/'+dateString[4:-2]+'/'+dateString[:-4]

def getChwsFromDhis2(KWARG):
    ih_dhis_api = dhisApi(KWARG)
    r = ih_dhis_api.get("options", params={
                        "paging": "false", "filter": "optionSet.id:eq:uOKgQa2W8tn", "fields": "id,code,name,optionSet"})
    return r.json()["options"]

def getValue(dataArray, dataElement):
    for item in dataArray:
        if item["dataElement"] == dataElement:
            return item["value"]
    return ''

def matchDhis2Data(datas):
    
    dataValues = [
        {
            "dataElement": "FW6z2Ha2GNr",  # source de données
            "value": datas["data_source"],
        },
        {
            "dataElement": "lbHrQBTbY1d",  # report_date
            "value": datas["reported_date"],
        },
        {
            "dataElement": "JkMyqI3e6or",  #list des ASC
            "value": datas["code_asc"],
        },
        {
            "dataElement": "JC752xYegbJ",  # admin_org_unit_district
            "value": datas["district"],
        },
        {
            "dataElement": "lvW5Kj1cisa", # "Nombre d'enfant 0 à 5 ans pris en charge à domicile
            "value": datas["total_vad_pcime_c"],
        },
        {
            "dataElement": "M6WRPsREqsZ",  # "Total Vad PCIME Suivi
            "value": datas["total_suivi_pcime_c"],
        },
        {
            "dataElement": "oeDKJi4BICh",  # total_vad
            "value": datas["total_vad"],
        },
        {
            "dataElement": "PrN89trdUGm", # "Nombre de femme enceinte nouveau cas
            "value": datas["total_vad_femmes_enceintes_NC"],
        },
        {
            "dataElement": "wdg7jjP9ZRg", # "Nombre de femmes référée pour plannification familiale
            "value": datas["reference_femmes_pf"],
        },
        {
            "dataElement": "qNxNXSwDAaI", # "promptitude diarrhée 24h
            "value": datas["prompt_diarrhee_24h_pcime_soins"],
        },
        {
            "dataElement": "S1zPDVOIVLZ",  # "promptitude diarrhee 48h
            "value": datas["prompt_diarrhee_48h_pcime_soins"],
        },
        {
            "dataElement": "nW3O5ULr75J", # "promptitude diarrhée 72h
            "value": datas["prompt_diarrhee_72h_pcime_soins"],
        },
        {
            "dataElement": "NUpARMZ383s", # "promptitude paludisme 24h
            "value": datas["prompt_paludisme_24h_pcime_soins"],
        },
        {
            "dataElement": "yQa48SF9bua", # "promptitude paludisme 48h
            "value": datas["prompt_paludisme_48h_pcime_soins"],
        },
        {
            "dataElement": "NzKjJuAniNx", # "promptitude paludisme 72h
            "value": datas["prompt_paludisme_72h_pcime_soins"],
        },
        {
            "dataElement": "AA2We0Ao5sv", # "promptitude pneumonie 24h
            "value": datas["prompt_pneumonie_24h_pcime_soins"],
        },
        {
            "dataElement": "PYwikai4k2J", # "promptitude pneumonie 48h
            "value": datas["prompt_pneumonie_48h_pcime_soins"],
        },
        {
            "dataElement": "rgjFO0bDVUL", # "promptitude pneumonie 72h
            "value": datas["prompt_pneumonie_72h_pcime_soins"],
        },
        {
            "dataElement": "WR9u3cGJn9W", # "total consultation femme enceinte
            "value": datas["total_vad_femmes_enceinte"],
        },
        {
            "dataElement": "Pl6qRNgjd3a", # "total de femmes référées par les asc
            "value": datas["reference_femmes_enceinte_postpartum"],
        },
        {
            "dataElement": "DicYcTqr9xT", # "Total de référence pcime
            "value": datas["reference_pcime"],
        },
        {
            "dataElement": "caef2rf638P", # "total diarrhee pcime
            "value": datas["total_diarrhee_pcime_soins"],
        },
        {
            "dataElement": "Q0BQtUdJOCy", # "Total femmes en postpartum
            "value": datas["total_vad_femmes_postpartum"],
        },
        {
            "dataElement": "dLYksBMOqST", # "total malnutrition pcime
            "value": datas["total_malnutrition_pcime_soins"],
        },
        {
            "dataElement": "jp2i3vN3VJk", # "total paludisme pcime
            "value": datas["total_paludisme_pcime_soins"],
        },
        {
            "dataElement": "LZ3R8fj9CGG", # "total pneumonie pcime
            "value": datas["total_pneumonie_pcime_soins"],
        },
        {
            "dataElement": "O9EZVn3C3pF", # "Total postpartum nouveau cas
            "value": datas["total_vad_femme_postpartum_NC"],
        },
        {
            "dataElement": "lsBS60uQPtc", # "Total recherche active
            "value": datas["total_recherche_active"],
        },
        {
            "dataElement": "lopdYxQrgyj", # "Total test de grossesse administrée
            "value": datas["total_test_de_grossesse_domicile"],
        },
        {
            "dataElement": "AzwUzgh0nd7",  # "Total Vad Pf
            "value": datas["total_vad_family_planning"],
        }
    ]

    data = {
        "program": "aaw8nwnmmcC",
        "orgUnit": datas["orgUnit"],  # "PgoyKuRs20z",
        "eventDate": datas["reported_date"]+"T00:00:00.000",  # "2021-05-07T00:00:00.000",
        "status": "COMPLETED",
        "completedDate": datas["reported_date"]+"T00:00:00.000",  # "2021-05-07T00:00:00.000",
        "dataValues": dataValues
    }

    return data

def getData(data,codeAsc, indicateur):
    d = ''
    for row in data:
        if row[0] == codeAsc and row[1] == indicateur:
            d = row[5]
    return d

def getDhis2OrgUnit(label, isDhis2UidOutPut = True):
    dhis2File = open(pythonFolder()+"/external_data/thinkMdOrgUnits.csv")
    dhis2FileCsvReader = csv.reader(dhis2File)
    dhis2FileHeader = next(dhis2FileCsvReader)
    for r in dhis2FileCsvReader:
        if isDhis2UidOutPut == True:
            if r[0] == label and r[0] != None and r[0] != '' and r[0] != ' ':
                return r[1]
        if isDhis2UidOutPut == False:
            if r[1] == label and r[1] != None and r[1] != '' and r[1] != ' ':
                return r[0]
    # dhis2File.close()
    return label

def getMatchDataElementUid(label,index):
    thinkMdDhis2File = open(pythonFolder()+"/external_data/ThinkMD-Dhis2-mapping.csv")
    thinkMdDhis2FileCsvReader = csv.reader(thinkMdDhis2File)
    thinkMdDhis2FileHeader = next(thinkMdDhis2FileCsvReader)
    for r in thinkMdDhis2FileCsvReader:
        if r[2] == label and r[0] != None and r[0] != '' and r[0] != ' ':
            return r[0]
    # thinkMdDhis2File.close()
    return 'Error'+str(index)

def getOtherData(data,codeAsc):
    for row in data:
        if row[0] == codeAsc:
            return [row[2][:-2]+'-'+row[2][-2:]+'-20',row[3],row[4]]
    return ['','','']

def getVal(dataElement, tm_dataElement, value):
	if dataElement == tm_dataElement:
		return value
	return ""

def date_to_milisecond(milisecond,start=True):
    if milisecond != "":
        if start:
            dt = " 00:00:00,000001"
        else:
            dt = " 23:59:59,999999"
        dt_obj = datetime.strptime(str(milisecond) + dt, '%Y-%m-%d %H:%M:%S,%f')
        return dt_obj.timestamp() * 1000
    return milisecond

def districtFound(datas, label=False):
    district = datas["contact"]["parent"]["parent"]["_id"]
    if district != "" and district != None:
        medicFile = open(pythonFolder()+"/external_data/medicOrgUnit.csv")
        medicFileCsvReader = csv.reader(medicFile)
        medicFileHeader = next(medicFileCsvReader)
        if label:
            for r in medicFileCsvReader:
                if r[3] == district:
                    return r[4]
        else:
            districts_Ids = []
            for r in medicFileCsvReader:
                districts_Ids.append(r[3])
            if district in districts_Ids:
                return True
            else:
                return False
    else:
        pass

def convert_milisecond_to_date(milisecond, var_return="date"):
    date_time_str = str(datetime.fromtimestamp(milisecond//1000.0))
    # date_time_str = str(datetime.utcfromtimestamp(milisecond//1000).replace(microsecond=milisecond%1000*1000))
    # return date_time_str
    if len(date_time_str.split('.')) < 2:
        date_time_obj = datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S')
    else:
        date_time_obj = datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S.%f')

    if var_return == "time":
        return str(date_time_obj.time())
    elif var_return == "fullDate":
        return str(date_time_obj)
    else:
        return str(date_time_obj.strftime('%Y-%m-%d'))

def between(date, d_from, d_to):
    if date >= d_from and date <= d_to:
        return True
    return False

def chwsFound(datas, label='bool', index=1):
    try:
        chwsId = datas["contact"]["_id"]
    except:
        chwsId = datas
    if chwsId != "" and chwsId != None:
        medicFile = open(pythonFolder()+"/external_data/medicOrgUnit.csv")
        medicFileCsvReader = csv.reader(medicFile)
        medicFileHeader = next(medicFileCsvReader)
        if label == "id" or label == "code" or label == "name" or label == "site" or label == "siteId" or label == "orgUnit" or label == "findByCode":
            i=0
            if label == "id":
                index = 0
            if label == "code":
                index = 1
            if label == "name":
                index = 2
            if label == "siteId":
                index = 3
            if label == "site":
                index = 4
            if label == "orgUnit":
                index = 5
            if label == "findByCode":
                i = 1
            for r in medicFileCsvReader:
                if r[i] == chwsId:
                    return r[index]
        elif label == "chws_array":
            chws_array = []
            for r in medicFileCsvReader:
                chws_array.append(r[index])
            return chws_array
        else:
            chws_Ids = []
            for r in medicFileCsvReader:
                chws_Ids.append(r[0])
            if chwsId in chws_Ids:
                return True
            else:
                return False
    else:
        pass

def medicDataType():
    """ data to extract type ( ["TotalVad","Recherche","Consultation"] ) """
    return ["TotalVad","Recherche","Consultation"]

def record(datas):
    if datas["type"] == 'data_record':
        return True
    return False

def formView(datas, cible):
    if datas["form"] == cible:
        return True
    return False
