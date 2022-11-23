import csv
from functions import chwRemplacante, convertDate, createFile, deleteFile, extractFolder, extractPath, getChwsFromDhis2, getNexSundayDate, getOutPutData, getOutPutDataFromFile, getReportData, getReportOrgUnit, pathExist, signIn
from fetch_medic_data import flushMedicDataToDhis2
import tableauserverclient as TSC
from operator import indexOf
import json
import sys


outPutData = getOutPutData()


def getThinkMdMedicWeeklyDataFromDhis2(ARGS):
    try:
        server = TSC.Server("https://{}".format(ARGS["thinkmd_host"]), use_server_version=True)
        server.version = '3.6'
        with signIn(server,ARGS):
            # print('\n🌍 ThinkMd Fetch start')
            
            req_option = TSC.RequestOptions()
            req_option.filter.add(TSC.Filter(TSC.RequestOptions.Field.Name,TSC.RequestOptions.Operator.Equals,'IH - homemade viz'))
            matching_workbooks, pagination_item = server.workbooks.get(req_option)
            final_view = []

            # for table in TSC. .Pager(server.tables):
                # if(table.name == 'TABLE_NAME'):
                # print(table.name)
                # server.tables.populate_columns(table)
                # for column in table.columns:
                # print(column.name)

            for i in matching_workbooks:
                server.workbooks.populate_views(i)
                views = i.views
                for v in views:
                    if v.content_url == 'IH-homemadeviz/sheets/ConsultationASCsemainenew':
                        final_view.append(v)
            default_view = final_view[0]
            csv_req_option =  TSC.ImageRequestOptions(imageresolution=TSC.ImageRequestOptions.Resolution.High,maxage=0)
            # csv_req_option =  TSC.CSVRequestOptions(maxage=0)
            dateFilter = ''
            for date in ARGS['weekly_Choosen_Dates']:
                d = str(date).split('-')
                dateFilter+=str(d[0])+str(d[1])+str(d[2])+','

            csv_req_option.vf('Semaine de start string', dateFilter[:-1])
            # csv_req_option.vf('Village corrected', 'Koundoum, Manga')
            server.views.populate_csv(default_view, csv_req_option)
            with open(f""+extractPath("/week_reports_"+ARGS['user']+".csv"), 'wb') as f:
                f.write(b''.join(default_view.csv))


        ###############################################################################


        file = open(extractPath("week_reports_"+ARGS['user']+".csv"))
        csvreader = csv.reader(file)
        header = next(csvreader)
        allData = []
        chwsFounded = {}
        allChws = getChwsFromDhis2(ARGS)

        SelectedDates = []
        for row in csvreader:
            allData.append(row)
            if row[0].split('-')[0] not in chwsFounded:
                chwsFounded[row[0].split('-')[0]] = {'code':row[0], 'district':row[1], 'site':row[3]}
            if row[2] not in SelectedDates:
                SelectedDates.append(row[2])
        
        # for dx in ARGS['weekly_Choosen_Dates']:
        #     dy = str(dx).split('-')
        #     dz=str(dy[0])+str(dy[1])+str(dy[2])
        #     if dz not in SelectedDates:
        #         SelectedDates.append(dz)


        if len(allData)!=0 and len(chwsFounded) != 0 and len(SelectedDates) !=0:
            with createFile(extractFolder(), "weekly_thinkmd_medic_data_"+ARGS['user']) as result:
                oldOrgUnitLine = ''
                # new = 'Exportation des données par semaine: '+str(SelectedDates).replace(',',' ')[1:][:-1].replace("'All'",'')+'\n\n'
                new = ''
                new += 'Site,District,ChwsCode,ChwsName,Type'
                for i in SelectedDates:
                    new+=','+convertDate(i)
                new+='\n' 
                result.write(new)
                for c in allChws:
                    indx = indexOf(allChws,c)
                    if c['code'].split('-')[0] in chwsFounded:
                        old = ''
                        old0 = ''
                        newOrgUnitLine = getReportOrgUnit(chwsFounded,c['code'])
                        # if oldOrgUnitLine != '' and oldOrgUnitLine != newOrgUnitLine:
                        #     old0+=',,,,'
                        #     for i in SelectedDates:
                        #         old0+=','
                        #     old0+='\n'
                        #     result.write(old0)
                        #     result.write(old0)


                        old+=newOrgUnitLine
                        old+=','+c['code']
                        name = c['name'].replace(c['code']+' ','')
                        old+=','+name
                        old+=','+ chwRemplacante(name)
                        for j in SelectedDates:
                            old+=','+getReportData(allData,c['code'],j)
                        if indx < len(allChws) - 1:
                            old+='\n'
                        result.write(old)
                        oldOrgUnitLine = newOrgUnitLine
            file.close()
    except:
        outPutData['Error'] +=1
        if 'server_error' not in outPutData['ErrorMsg']:
            outPutData['ErrorMsg']['server_error'] = " Can not connect to ThinkMd server to get Data. Check your Connection or informations you provided !"

    getMedicWeeklyData(ARGS)



def getMedicWeeklyData(ARGS, data_type="TotalVad"):
    if pathExist(extractPath("week_reports_"+ARGS['user']+".csv")):
        dFile = open(extractPath("week_reports_"+ARGS['user']+".csv"))
        dCsvreader = csv.reader(dFile)
        dHeader = next(dCsvreader)
        AllSelectedDates = []
        for row in dCsvreader:
            for ddDate in ARGS['weekly_Choosen_Dates']:
                dDate = str(ddDate).replace('-','')
                if dDate == row[2] and ddDate not in AllSelectedDates:
                    AllSelectedDates.append(ddDate)

        deleteFile(extractPath("week_reports_"+ARGS['user']+".csv"))


    try:
        for anyDate in AllSelectedDates:
            # print(anyDate, ' ==> ' ,getNexSundayDate(anyDate))
            ARGS['start_date'] = anyDate
            ARGS['end_date'] = getNexSundayDate(anyDate)

            flushMedicDataToDhis2(ARGS,"medic_week_reports_"+str(indexOf(AllSelectedDates,anyDate))+"_"+ARGS['user'],data_type)
    
        file = open(extractPath("medic_week_reports_0"+"_"+ARGS['user']+".csv"))
        csvreader = list(csv.reader(file))
        with open(extractPath("weekly_thinkmd_medic_data_"+ARGS['user']+".csv"), 'a', newline='') as f_object:  
            merge_result = []
            oldOrgUnitLine = ''
            writer_object = csv.writer(f_object)

            for anyDate in AllSelectedDates:
                index = indexOf(AllSelectedDates,anyDate)
                for bigrow in csvreader:
                    if index > 0:
                        file0 = open(extractPath("medic_week_reports_"+str(index)+"_"+ARGS['user']+".csv"))
                        csvRead = list(csv.reader(file0))
                        for r in csvRead:
                            p = 0
                            if r[2] == bigrow[2]:
                                bigrow.append(r[5])
                                if index == len(AllSelectedDates) - 1 and bigrow not in merge_result:
                                    if indexOf(csvreader,bigrow) <= 0:
                                        bigrow.append('Sum')
                                    else:
                                        for j in range(5,len(bigrow)):
                                            p+=int(bigrow[j])
                                        bigrow.append(str(p))
                                    newOrgUnitLine = bigrow[1] + bigrow[0]
                                    # if oldOrgUnitLine != '' and oldOrgUnitLine != newOrgUnitLine or 'Sum' in bigrow and 'District' in bigrow:
                                    #     gs = []
                                    #     for g in bigrow:
                                    #         gs.append('')
                                    #     writer_object.writerow(gs) 
                                    #     writer_object.writerow(gs) 
                                    if 'Sum' not in bigrow and 'District' not in bigrow:
                                        merge_result.append(bigrow)
                                        writer_object.writerow(bigrow)
                                        oldOrgUnitLine = newOrgUnitLine 
                        file0.close()
        f_object.close()
        # with createFile(extractFolder(), 'medic_weekly_output') as result:
        #     for match in merge_result:
        #         f = ''
        #         for m in range(len(match)):
        #             f+=match[m]+','
        #         f = f[:-1]
        #         f+='\n'
        #         result.write(f)
        file.close()
        for i in range(50):
            deleteFile(extractPath("medic_week_reports_"+str(i)+"_"+ARGS['user']+".csv"))
    except:
        outPutData['Error'] +=1
        if 'server_error' not in outPutData['ErrorMsg']:
            outPutData['ErrorMsg']['server_error'] = " Can not connect to Medic server to get Data. Check your Connection or informations you provided !"


    if pathExist(extractPath("weekly_thinkmd_medic_data_"+ARGS['user']+".csv")):
        allData = getOutPutDataFromFile("weekly_thinkmd_medic_data_"+ARGS['user'])
        outPutData["Data"]["head"] = allData['head']
        finalBody = allData['body']
        for row in finalBody:
            rowData = []
            for r in row:
                rowData.append(str(r).replace("'", '’'))
            outPutData["Data"]["body"][str(indexOf(finalBody,row))] = rowData
    print(str(outPutData).replace("'", '"'))



KWARGS = json.loads(sys.argv[1])

# KWARGS ={"start_date":"", "end_date": "", "weekly_Choosen_Dates": ['2022-10-31', '2022-11-07'], "thinkmd_host": "10az.online.tableau.com", "thinkmd_site": "datasincbeta", "useToken": False, "thinkmd_token_username": "", "thinkmd_token": "", "thinkmd_username": "seaq@santeintegree.org", "thinkmd_password": "si@Kara0", "medic_host": "hth-togo.app.medicmobile.org", "medic_username": "admin", "medic_password": "0c2e4d44ef80408b850a207f7bab6e0c", "medic_database": "medic", "InsertIntoDhis2": False, "dhis2_host": "dhis2.integratehealth.org/dhis", "dhis2_username": "admin", "dhis2_password": "IH@-@admin$_$2021-@IH", "ssl_verification": False, "user": "1", "type": "thinkMd_and_medic"}

if KWARGS['type'] == 'thinkMd_and_medic':
    getThinkMdMedicWeeklyDataFromDhis2(KWARGS)
