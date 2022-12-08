import { spawn } from "child_process";
import { Request, Response } from "express";
import express = require("express");
import { Middelware } from "../middleware/auth";
import { Functions, isNotNull } from "../utils/functions";
var path = require('path');
const pyRouter = express.Router();
// const utf8 = require('utf8');

require('dotenv').config({ path: `${Functions.sslFolder('.env')}` });

 
var basename = path.dirname(__dirname)
const regex = /('(?=(,\s*')))|('(?=:))|((?<=([:,]\s*))')|((?<={)')|('(?=}))/g;

var errorToSend: any = {};


function formatData(data:any){
    // utf8.decode(utf8.encode(`${data}`));
    return `${data}`.replace(regex, '"')
                    .replace('======================','')
                    .replace('=====================','')
                    .replace('===================','')
                    .replace('==================','')
                    .replace('=================','')
                    .replace('================','')
                    .replace('===============','')
                    .replace('==============','')
                    .replace('=============','')
                    .replace('============','')
                    .replace('===========','')
                    .replace('==========','')
                    .replace('=========','')
                    .replace('========','')
                    .replace('=======','')
                    .replace('======','')
                    .replace('=====','')
                    .replace('====','')
                    .replace('===','')
                    .replace('==','')
                    .replace('=','')
                    .replace('           ','')
                    .replace('          ','')
                    .replace('         ','')
                    .replace('        ','')
                    .replace('       ','')
                    .replace('      ','')
                    .replace('     ','')
                    .replace('    ','')
                    .replace('   ','')
                    .replace('  ','')
                    .replace(' ','');
}

function dataToReturn(data:any){
    return isNotNull(data) ? data : {};
}


pyRouter.post('/thinkmdToDhis2', Middelware.authMiddleware, (req: Request, res: Response) => {
    var dataToSend: string = '{}';
    req.body['type'] = 'thinkMd_only'
    const user = `${req.body['user']}`;
    errorToSend[`${user}`] = { "ErrorCount": 0, "ErrorData": [], "ConsoleError": "" };

    if (req.body['thinkmd_password'] === '' || req.body['thinkmd_password'] === null) req.body['thinkmd_password'] = process.env.TSC_PASS;
    if (req.body['dhis2_password'] === '' || req.body['dhis2_password'] === null) req.body['dhis2_password'] = process.env.DHIS_PASS;
    const python = spawn('python3', [basename + '/pythons/fetch_thinkmd_data.py', JSON.stringify(req.body),]);

    python.stdout.on('data', (data) => { if (dataToSend === '{}') dataToSend = formatData(data); });
    python.stderr.on('data', (data) => { 
        errorToSend[`${user}`]['ErrorCount'] += 1; 
        errorToSend[`${user}`]['ErrorData'].push(formatData(data)); 
    });
    python.on('error', function (err) { errorToSend[`${user}`]['ConsoleError'] = err.message; });
    python.on('close', (code) => { res.jsonp(`{"errorToSend": ${JSON.stringify(errorToSend[`${user}`])},"dataToSend": ${dataToReturn(dataToSend)}}`); });
    python.on('end', (msg) => console.log(`Finish`));
});


pyRouter.post('/medicToDhis2', Middelware.authMiddleware, (req: Request, res: Response) => {
    var dataToSend: string = '{}';
    req.body['type'] = 'medic_only';
    const user = `${req.body['user']}`;
    errorToSend[`${user}`] = { "ErrorCount": 0, "ErrorData": [], "ConsoleError": "" };

    if (req.body['dhis2_password'] === '' || req.body['dhis2_password'] === null) req.body['dhis2_password'] = process.env.DHIS_PASS;
    if (req.body['medic_password'] === '' || req.body['medic_password'] === null) req.body['medic_password'] = process.env.COUCH_PASS;
    const python = spawn('python3', [basename + '/pythons/fetch_medic_data.py', JSON.stringify(req.body),]);

    python.stdout.on('data', (data) => { if (dataToSend === '{}') dataToSend = formatData(data) });
    python.stderr.on('data', (data) => { 
        errorToSend[`${user}`]['ErrorCount'] += 1; 
        errorToSend[`${user}`]['ErrorData'].push(formatData(data)); 
    });
    python.on('error', function (err) { errorToSend[`${user}`]['ConsoleError'] = err.message; });
    python.on('close', (code) => { res.jsonp(`{"errorToSend": ${JSON.stringify(errorToSend[`${user}`])},"dataToSend": ${dataToReturn(dataToSend)}}`); });
    python.on('end', (msg) => console.log(`Finish`));
});


pyRouter.post('/medicThinkmdWeekly', Middelware.authMiddleware, (req: Request, res: Response) => {
    var dataToSend: string = '{}';
    req.body['type'] = 'thinkMd_and_medic';
    const user = `${req.body['user']}`;
    errorToSend[`${user}`] = { "ErrorCount": 0, "ErrorData": [], "ConsoleError": "" };

    if (req.body['thinkmd_password'] === '' || req.body['thinkmd_password'] === null) req.body['thinkmd_password'] = process.env.TSC_PASS;
    if (req.body['dhis2_password'] === '' || req.body['dhis2_password'] === null) req.body['dhis2_password'] = process.env.DHIS_PASS;
    if (req.body['medic_password'] === '' || req.body['medic_password'] === null) req.body['medic_password'] = process.env.COUCH_PASS;
    const python = spawn('python3', [basename + '/pythons/thinkmd_medic_weekly_data.py', JSON.stringify(req.body),]);

    python.stdout.on('data', (data) => { if (dataToSend === '{}') dataToSend = formatData(data);});
    python.stderr.on('data', (data) => { 
        errorToSend[`${user}`]['ErrorCount'] += 1; 
        errorToSend[`${user}`]['ErrorData'].push(formatData(data)); 
    });
    python.on('error', function (err) { errorToSend[`${user}`]['ConsoleError'] = err.message; });
    python.on('close', (code) => res.jsonp(`{"errorToSend": ${JSON.stringify(errorToSend[`${user}`])},"dataToSend": ${dataToReturn(dataToSend)}}`));
    python.on('end', (msg) => console.log(`Finish`));
});



export = pyRouter;