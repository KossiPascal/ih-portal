# _*_ coding:utf-8 _*_

import csv
from functions import chwRemplacante, convertDate, createExtractFolderIfNotExist, createFile, deleteFile, extractFolder, extractPath, getChwsFromDhis2, getNexSundayDate, getOutPutData, getOutPutDataFromFile, getReportData, getReportOrgUnit, pathExist, signIn
from fetch_medic_data import flushMedicDataToDhis2
import tableauserverclient as TSC
from operator import indexOf
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')


outPutData = getOutPutData()


def getThinkMdWeeklyDataFromDhis2(ARGS):
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
            with open(f""+extractPath("/week_reports_"+str(ARGS['userId'])+".csv"), 'wb') as f:
                f.write(b''.join(default_view.csv))


        ###############################################################################


        # file = open(extractPath("week_reports_"+str(ARGS['userId'])+".csv"))
        # csvreader = csv.reader(file)
        # header = next(csvreader)

        fileData = getOutPutDataFromFile("week_reports_"+str(ARGS['userId']))
        headers = fileData['head']
        csvreader = fileData['body']

        allData = []
        chwsFounded = {}

        # allChws = getChwsFromDhis2(ARGS)

        allChws = ARGS['chws']

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
            with createFile(extractFolder(), "weekly_thinkmd_medic_data_"+str(ARGS['userId'])) as result:
                oldOrgUnitLine = ''
                # new = 'Exportation des données par semaine: '+str(SelectedDates).replace(',',' ')[1:][:-1].replace("'All'",'')+'\n\n'
                new = ''
                # new += 'Site,District,ChwsCode,ChwsName,Type'
                new += 'Code ASC,Nom ASC,Site,District'
                for i in SelectedDates:
                    new+=','+convertDate(i, True)
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

                        old+=c['code']
                        name = c['name'].replace(c['code']+' ','')
                        old+=','+name

                        old+=','+newOrgUnitLine
                        # old+=','+ chwRemplacante(name) ==> Type
                        for j in SelectedDates:
                            old+=','+getReportData(allData,c['code'],j)
                        if indx < len(allChws) - 1:
                            old+='\n'
                        result.write(old)
                        oldOrgUnitLine = newOrgUnitLine
            # file.close()
    except Exception as err :
        outPutData['Error'] +=1
        if 'server_error' not in outPutData['ErrorMsg']:
            # outPutData['ErrorMsg']['server_error'] = " Can not connect to ThinkMd server to get Data. Check your Connection or informations you provided !"
            outPutData['ErrorMsg']['server_error'] = " "+str(err)

    generateThinkMdWeeklyData(ARGS)
    # getMedicWeeklyData(ARGS)

def generateThinkMdWeeklyData(ARGS):
    if pathExist(extractPath("weekly_thinkmd_medic_data_"+str(ARGS['userId'])+".csv")):
        allData = getOutPutDataFromFile("weekly_thinkmd_medic_data_"+str(ARGS['userId']))
        outPutData["Data"]["head"] = allData['head']
        finalBody = allData['body']
        for row in finalBody:
            rowData = []
            for r in row:
                rowData.append(str(r).replace("'", '`').replace("’", '`'))
            outPutData["Data"]["body"][str(indexOf(finalBody,row))] = rowData
    print(str(outPutData).replace("'", '"'))


# def getMedicWeeklyData(ARGS, data_type="TotalVad"):

#     fileName = "week_reports_"+str(ARGS['userId'])

#     if pathExist(extractPath(fileName +".csv")):
#         # dFile = open(extractPath("week_reports_"+str(ARGS['userId'])+".csv"))
#         # dCsvreader = csv.reader(dFile)
#         # dHeader = next(dCsvreader)

#         fileData = getOutPutDataFromFile(fileName)
#         dHeader = fileData['head']
#         dCsvreader = fileData['body']
#         AllSelectedDates = []
#         for row in dCsvreader:
#             for ddDate in ARGS['weekly_Choosen_Dates']:
#                 dDate = str(ddDate).replace('-','')
#                 if dDate == row[2] and ddDate not in AllSelectedDates:
#                     AllSelectedDates.append(ddDate)

#         deleteFile(extractPath("week_reports_"+str(ARGS['userId'])+".csv"))

#     # try:
#     #     for anyDate in AllSelectedDates:
#     #         # print(anyDate, ' ==> ' ,getNexSundayDate(anyDate))
#     #         ARGS['start_date'] = anyDate
#     #         ARGS['end_date'] = getNexSundayDate(anyDate)

#     #         flushMedicDataToDhis2(ARGS,"medic_week_reports_"+str(indexOf(AllSelectedDates,anyDate))+"_"+str(ARGS['userId']),data_type)
    
#     #     file = open(extractPath("medic_week_reports_0"+"_"+str(ARGS['userId'])+".csv"))
#     #     csvreader = list(csv.reader(file))
#     #     with open(extractPath("weekly_thinkmd_medic_data_"+str(ARGS['userId'])+".csv"), 'a', newline='') as f_object:  
#     #         merge_result = []
#     #         oldOrgUnitLine = ''
#     #         writer_object = csv.writer(f_object)

#     #         for anyDate in AllSelectedDates:
#     #             index = indexOf(AllSelectedDates,anyDate)
#     #             for bigrow in csvreader:
#     #                 if index > 0:
#     #                     file0 = open(extractPath("medic_week_reports_"+str(index)+"_"+str(ARGS['userId'])+".csv"))
#     #                     csvRead = list(csv.reader(file0))
#     #                     for r in csvRead:
#     #                         p = 0
#     #                         if r[2] == bigrow[2]:
#     #                             bigrow.append(r[5])
#     #                             if index == len(AllSelectedDates) - 1 and bigrow not in merge_result:
#     #                                 if indexOf(csvreader,bigrow) <= 0:
#     #                                     bigrow.append('Sum')
#     #                                 else:
#     #                                     for j in range(5,len(bigrow)):
#     #                                         p+=int(bigrow[j])
#     #                                     bigrow.append(str(p))
#     #                                 newOrgUnitLine = bigrow[1] + bigrow[0]
#     #                                 # if oldOrgUnitLine != '' and oldOrgUnitLine != newOrgUnitLine or 'Sum' in bigrow and 'District' in bigrow:
#     #                                 #     gs = []
#     #                                 #     for g in bigrow:
#     #                                 #         gs.append('')
#     #                                 #     writer_object.writerow(gs) 
#     #                                 #     writer_object.writerow(gs) 
#     #                                 if 'Sum' not in bigrow and 'District' not in bigrow:
#     #                                     merge_result.append(bigrow)
#     #                                     writer_object.writerow(bigrow)
#     #                                     oldOrgUnitLine = newOrgUnitLine 
#     #                     file0.close()
#     #     f_object.close()
#     #     # with createFile(extractFolder(), 'medic_weekly_output') as result:
#     #     #     for match in merge_result:
#     #     #         f = ''
#     #     #         for m in range(len(match)):
#     #     #             f+=match[m]+','
#     #     #         f = f[:-1]
#     #     #         f+='\n'
#     #     #         result.write(f)
#     #     file.close()
#     #     for i in range(50):
#     #         deleteFile(extractPath("medic_week_reports_"+str(i)+"_"+str(ARGS['userId'])+".csv"))
#     # except Exception as err:
#     #     outPutData['Error'] +=1
#     #     if 'server_error' not in outPutData['ErrorMsg']:
#     #         # outPutData['ErrorMsg']['server_error'] = " Can not connect to Medic server to get Data. Check your Connection or informations you provided !"
#     #         outPutData['ErrorMsg']['server_error'] = " "+str(err)





KWARGS = json.loads(sys.argv[1])

if KWARGS['type'] == 'thinkMd_weekly':
    createExtractFolderIfNotExist()
    getThinkMdWeeklyDataFromDhis2(KWARGS)
