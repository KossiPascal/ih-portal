'use strict';
import { spawn } from "child_process";
import { Request, Response } from "express";
import express = require("express");
import { DataIndicators } from "../entity/DataAggragate";
import { Middelware } from "../middleware/auth";
import { DataFromPython } from "../utils/appInterface";
import { extractFolder, notEmpty, sslFolder } from "../utils/functions";
var path = require('path');
const pyRouter = express.Router();
// const utf8 = require('utf8');
const fs = require("fs");
const csv = require("csv-parser");

require('dotenv').config({ path: sslFolder('.ih-env') });
const { TSC_HOST, TSC_SITE, TSC_TOKEN_NAME, TSC_TOKEN_CODE, DHIS_HOST, TSC_USER, TSC_PASS } = process.env;



var basename = path.dirname(__dirname)
const regex = /('(?=(,\s*')))|('(?=:))|((?<=([:,]\s*))')|((?<={)')|('(?=}))/g;

var errorToSend: any = {};


function formatData(data: any) {
    // utf8.decode(utf8.encode(`${data}`));
    return `${data}`.replace(regex, '"')
        .replace('======================', '')
        .replace('=====================', '')
        .replace('===================', '')
        .replace('==================', '')
        .replace('=================', '')
        .replace('================', '')
        .replace('===============', '')
        .replace('==============', '')
        .replace('=============', '')
        .replace('============', '')
        .replace('===========', '')
        .replace('==========', '')
        .replace('=========', '')
        .replace('========', '')
        .replace('=======', '')
        .replace('======', '')
        .replace('=====', '')
        .replace('====', '')
        .replace('===', '')
        .replace('==', '')
        .replace('=', '')
        .replace('           ', '')
        .replace('          ', '')
        .replace('         ', '')
        .replace('        ', '')
        .replace('       ', '')
        .replace('      ', '')
        .replace('     ', '')
        .replace('    ', '')
        .replace('   ', '')
        .replace('  ', '')
        .replace(' ', '');
}

function dataToReturn(data: any) {
    return notEmpty(data) ? data : {};
}


pyRouter.post('/thinkmd_to_dhis2', Middelware.authMiddleware, async (req: Request, res: Response) => {
    var dataToSend: string = '{}';
    req.body['type'] = 'thinkMd_only'
    const userId = `${req.body['userId']}`;
    errorToSend[`${userId}`] = { "ErrorCount": 0, "ErrorData": [], "ConsoleError": "" };

    req.body['thinkmd_host'] = TSC_HOST;
    req.body['thinkmd_site'] = TSC_SITE;
    req.body['thinkmd_token_username'] = TSC_TOKEN_NAME;
    req.body['thinkmd_token'] = TSC_TOKEN_CODE;
    // if (req.body['useToken'] == false) {
    //     req.body['thinkmd_username'] = TSC_USER;
    //     req.body['thinkmd_password'] = TSC_PASS;
    // }

    req.body['dhis2_host'] = DHIS_HOST;

    const python = spawn('python3', [basename + '/pythons/fetch_thinkmd_data.py', JSON.stringify(req.body),]);

    python.stdout.on('data', (data) => { if (dataToSend === '{}') dataToSend = formatData(data); });
    python.stderr.on('data', (data) => {
        errorToSend[`${userId}`]['ErrorCount'] += 1;
        errorToSend[`${userId}`]['ErrorData'].push(formatData(data));
    });
    python.on('error', function (err) { errorToSend[`${userId}`]['ConsoleError'] = err; });
    python.on('close', async (code) => {
        let brutOutPut = `{"errorToSend": ${JSON.stringify(errorToSend[`${userId}`])},"dataToSend": ${dataToReturn(dataToSend)}, "DataFordhis2":[]}`
        try {
            let ThinkMdOutPutData = JSON.parse(brutOutPut);
            if (req.body.InsertIntoDhis2 == true &&
                ThinkMdOutPutData.errorToSend.ErrorCount == 0 &&
                ThinkMdOutPutData.errorToSend.ErrorData.length <= 0 &&
                ThinkMdOutPutData.dataToSend.success == 'true' &&
                ThinkMdOutPutData.dataToSend.Error == 0 &&
                Object.values(ThinkMdOutPutData.dataToSend.Data.body).length > 0) {
                    
                // const csvOutputFile = `${srcFolder()}/pythons/extracts/thinkMd_output_for_dhis2_${userId}_output.csv`;
                // fs.createReadStream(csvOutputFile).pipe(csv()).on("data", (data:any) => { console.log(data) });
                const jsonOutputFile = extractFolder(`thinkMd_output_for_dhis2_${userId}_output.json`,true);

                let rawdata = fs.readFileSync(jsonOutputFile);
                ThinkMdOutPutData.DataFordhis2 = JSON.parse(rawdata) as DataIndicators[];
            }
            return res.jsonp(ThinkMdOutPutData);
        } catch (error) {
            return res.jsonp(brutOutPut);
        }

    });
    python.on('end', (msg) => console.log(`Finish`));
});



pyRouter.post('/thinkmd_weekly', Middelware.authMiddleware, (req: Request, res: Response) => {
    var dataToSend: string = '{}';
    req.body['type'] = 'thinkMd_weekly';
    const userId = `${req.body['userId']}`;
    errorToSend[`${userId}`] = { "ErrorCount": 0, "ErrorData": [], "ConsoleError": "" };

    req.body['thinkmd_host'] = TSC_HOST;
    req.body['thinkmd_site'] = TSC_SITE;
    req.body['thinkmd_token_username'] = TSC_TOKEN_NAME;
    req.body['thinkmd_token'] = TSC_TOKEN_CODE;

    // req.body['dhis2_host'] = DHIS_HOST;

    const python = spawn('python3', [basename + '/pythons/thinkmd_weekly_data.py', JSON.stringify(req.body),]);

    python.stdout.on('data', (data) => { if (dataToSend === '{}') dataToSend = formatData(data); });
    python.stderr.on('data', (data) => {
        errorToSend[`${userId}`]['ErrorCount'] += 1;
        errorToSend[`${userId}`]['ErrorData'].push(formatData(data));
    });
    python.on('error', function (err) { errorToSend[`${userId}`]['ConsoleError'] = err; });
    python.on('close', (code) => {
        let brutOutPut = `{"errorToSend": ${JSON.stringify(errorToSend[`${userId}`])},"dataToSend": ${dataToReturn(dataToSend)}}`;
        // try {
        //     let rawdata = JSON.parse(brutOutPut) as DataFromPython;
        //     return res.jsonp(rawdata);
        // } catch (error) {
        //     return res.jsonp(brutOutPut);
        // }
        var out1 = brutOutPut.replace('\\','');
        var out2 = out1.replace('\\','');
        var out3 = out2.replace('\\','');
        var out4 = out3.replace("'", '`')
        var out5 = out4.replace("'", '`');
        var out6 = out5.replace("’", '`');
        var out = out6.replace("’", '`');
        return res.jsonp(out);
    });
    python.on('end', (msg) => console.log(`Finish`));
});

// pyRouter.post('/medic_to_dhis2', Middelware.authMiddleware, (req: Request, res: Response) => {
//     var dataToSend: string = '{}';
//     req.body['type'] = 'medic_only';
//     const userId = `${req.body['userId']}`;
//     errorToSend[`${userId}`] = { "ErrorCount": 0, "ErrorData": [], "ConsoleError": "" };

//     req.body['medic_password'] = COUCH_PASS;

//     const python = spawn('python3', [basename + '/pythons/fetch_medic_data.py', JSON.stringify(req.body),]);

//     python.stdout.on('data', (data) => { if (dataToSend === '{}') dataToSend = formatData(data) });
//     python.stderr.on('data', (data) => { 
//         errorToSend[`${userId}`]['ErrorCount'] += 1; 
//         errorToSend[`${userId}`]['ErrorData'].push(formatData(data)); 
//     });
//     python.on('error', function (err) { errorToSend[`${userId}`]['ConsoleError'] = err; });
//     python.on('close', (code) => { res.jsonp(`{"errorToSend": ${JSON.stringify(errorToSend[`${userId}`])},"dataToSend": ${dataToReturn(dataToSend)}}`); });
//     python.on('end', (msg) => console.log(`Finish`));
// });


// pyRouter.post('/ih_cht_to_dhis2', Middelware.authMiddleware, (req: Request, res: Response) => {
//     var dataToSend: string = '{}';
//     req.body['type'] = 'cht_only';
//     const userId = `${req.body['userId']}`;
//     errorToSend[`${userId}`] = { "ErrorCount": 0, "ErrorData": [], "ConsoleError": "" };

//     if (req.body['dhis2_password'] === '' || req.body['dhis2_password'] === null) req.body['dhis2_password'] = DHIS_PASS;
//     if (req.body['cht_password'] === '' || req.body['cht_password'] === null) req.body['cht_password'] = CHT_PASS;
//     const python = spawn('python3', [basename + '/pythons/fetch_ih_cht_data.py', JSON.stringify(req.body),]);

//     python.stdout.on('data', (data) => { 
//         if (dataToSend === '{}') dataToSend = formatData(data);
//         console.log(dataToSend)
//      });
//     python.stderr.on('data', (data) => { 
//         errorToSend[`${userId}`]['ErrorCount'] += 1; 
//         errorToSend[`${userId}`]['ErrorData'].push(formatData(data)); 
//     });
//     python.on('error', function (err) { errorToSend[`${userId}`]['ConsoleError'] = err; });
//     python.on('close', (code) => { res.jsonp(`{"errorToSend": ${JSON.stringify(errorToSend[`${userId}`])},"dataToSend": ${dataToReturn(dataToSend)}}`); });
//     python.on('end', (msg) => console.log(`Finish`));
// });






export = pyRouter;