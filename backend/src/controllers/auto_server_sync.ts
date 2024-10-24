import { Request, Response, NextFunction } from "express";
import { getSiteSyncRepository, Sites } from "../entity/Sync";
import { getUsersRepository } from "../entity/User";
import { JsonDatabase } from "../json-data-source";
import { notEmpty, sslFolder, logNginx, normalizePort } from "../utils/functions";
import { Consts } from "../utils/constantes";
import { startEnd21and20Date, getDateInFormat } from "../utils/date-utils";
const request = require('request');

require('dotenv').config({ path: sslFolder('.ih-env') });

const { DEFAULT_DHIS2_USER_ID, LOCALHOST, USE_LOCALHOST, CHT_PROD_HOST, CHT_DEV_HOST, PROD_PORT_SECURED, DEV_PORT_SECURED, DHIS_USER, DHIS_PASS } = process.env

const portSecured = normalizePort((Consts.isProdEnv ? PROD_PORT_SECURED : DEV_PORT_SECURED) || Consts.defaultSecurePort);


export async function AutoSyncDataFromCloud(data?: { wait: boolean, customDate: { start_date: string, end_date: string }, createOutputFile: boolean }, req?: Request, res?: Response, next?: NextFunction) {
  var output: { orgunit: any, tonoudayo: any, dhis2: any[], globalError: any, successDetails: any } = { orgunit: null, tonoudayo: null, dhis2: [], globalError: null, successDetails: null };
  try {
    const createOutputFile = data != null && notEmpty(data.createOutputFile) && data.createOutputFile != null ? data.createOutputFile : true;
    // const wait = data!=null && notEmpty(data.wait) && data.wait != null ? data.wait : true;
    // if(data.wait == true) await delay(60000);
    const startDate = new Date();
    const startAt = (startDate).getTime();
    const customDate = data != null && notEmpty(data.customDate) && data.customDate != null ? data.customDate : null;

    if (DEFAULT_DHIS2_USER_ID != null && DEFAULT_DHIS2_USER_ID != undefined && DEFAULT_DHIS2_USER_ID != "") {
      const userRepo = await getUsersRepository();
      const _repoSync = new JsonDatabase('syncs');
      const user = await userRepo.findOneBy({ id: DEFAULT_DHIS2_USER_ID });
      if (user) {
        var initDate: { start_date: string, end_date: string };

        if (customDate) {
          initDate = customDate;
        } else {
          const initD = startEnd21and20Date();
          const str = initD.start_date.split('-');
          initDate = { start_date: `${str[0]}-${str[1]}-01`, end_date: initD.end_date };
        }

        const start_date = initDate.start_date;
        const end_date = initDate.end_date;
        const headers = { "Content-Type": "application/json" };

        //const api_host = `https://${LOCALHOST || Consts.isProdEnv ? CHT_PROD_HOST : CHT_DEV_HOST}:${portSecured}/api`;
        // const api_host = `https://${Consts.isProdEnv ? CHT_PROD_HOST : CHT_DEV_HOST}/api`;
        const api_host = `https://${LOCALHOST}:${portSecured}/api`;

        logNginx('\n\nstart fetching orgunits\n');

        const enable_strict_SSL_checking = false;

        request({
          url: `${api_host}/sync/fetch/orgunits`,
          method: 'POST',
          body: JSON.stringify({
            start_date: start_date,
            end_date: end_date,
            site: true,
            zone: true,
            family: true,
            patient: true,
            chw: true,
            dhisusername: DHIS_USER, // user.dhisusername
            dhispassword: DHIS_PASS, // user.dhispassword
            userId: user.id,
            privileges: true
          }),
          headers: headers,
          strictSSL: enable_strict_SSL_checking,
        }, async function (error1: any, response1: any, body1: any) {
          if (!error1 && notEmpty(body1)) output.orgunit = JSON.parse(`${body1}`);

          logNginx('\n\nstart fetching tonoudayo data\n');
          request({
            url: `${api_host}/sync/fetch/data`,
            method: 'POST',
            body: JSON.stringify({
              start_date: start_date,
              end_date: end_date,
              dhisusername:  DHIS_USER, //user.dhisusername,
              dhispassword:  DHIS_PASS, //user.dhispassword,
              userId: user.id,
              privileges: true
            }),
            headers: headers,
            strictSSL: enable_strict_SSL_checking,
          }, async function (error2: any, response2: any, body2: any) {
            if (!error2 && notEmpty(body2)) output.tonoudayo = JSON.parse(`${body2}`);

            const repository = await getSiteSyncRepository();
            var sites: Sites[] = await repository.find();
            var _resp = [];
            for (let ou = 0; ou < sites.length; ou++) {
              const orgUnit = sites[ou].external_id;

              logNginx(`\n\nstart fetching dhis2 data with orgUnit = ${orgUnit}\n`);
              request({
                url: `${api_host}/sync/dhis2/data`,
                method: 'POST',
                body: JSON.stringify({
                  orgUnit: orgUnit,
                  filter: [`RlquY86kI66:GE:${start_date}:LE:${end_date}`],
                  fields: ['event', 'orgUnit', 'orgUnitName', 'dataValues[dataElement,value]'],
                  dhisusername:  DHIS_USER, //user.dhisusername,
                  dhispassword:  DHIS_PASS, //user.dhispassword,
                  userId: user.id,
                  privileges: true
                }),
                headers: headers,
                strictSSL: enable_strict_SSL_checking,
              }, async function (error3: any, response3: any, body3: any) {
                if (!error3 && notEmpty(body3)) output.dhis2.push(JSON.parse(`${body3}`));
                _resp.push('Ok');
                if (_resp.length == sites.length) {

                  const now = new Date();
                  const seconds = (now.getTime() - startAt) / 1000;
                  const display = seconds <= 60 ? `${seconds} sec` : (seconds / 60) <= 60 ? `${(seconds / 60).toFixed(2)} min` : `${((seconds / 60) / 60).toFixed(2)} h`;

                  const starts = getDateInFormat(startDate, 0, `en`, true);
                  const ends = getDateInFormat(now, 0, `en`, true);
                  const details = {
                    start_at: starts.split(' ')[1],
                    start_at_timestamp: startAt,
                    end_at: ends.split(' ')[1],
                    end_at_timestamp: now.getTime(),
                    duration: display,
                    start_date_filter: initDate.start_date,
                    end_date_filter: initDate.end_date
                  };

                  if (createOutputFile == true) {
                    const syncFound = await _repoSync.getBy(getDateInFormat(now));
                    var sync: any;
                    if (!syncFound) {
                      sync = {
                        id: ends.split(' ')[0],
                        details: [
                          details
                        ]
                      }
                    } else {
                      syncFound.details.push(details);
                      sync = syncFound;
                    }
                    await _repoSync.save(sync);
                  }

                  logNginx(`\n\nDurée de l'action: ${display}\n`);
                  output.successDetails = {
                    date: ends.split(' ')[0],
                    start_at: starts.split(' ')[1],
                    start_at_timestamp: startAt,
                    end_at: ends.split(' ')[1],
                    end_at_timestamp: now.getTime(),
                    duration: display,
                    start_date_filter: initDate.start_date,
                    end_date_filter: initDate.end_date
                  }

                  if (res != null) return res.status(200).json({ status: 200, data: output });
                };
              });
            }
          });
        });
      
      } else {
        output.globalError = `No default user found with id = ${DEFAULT_DHIS2_USER_ID}`;
        if (res != null) return res.status(500).json({ status: 500, data: output });
      }
    } else {
      output.globalError = `No default user provide!`;
      if (res != null) return res.status(500).json({ status: 500, data: output });
    }
  } catch (err: any) {
    output.globalError = `${err}`;
    if (res != null) return res.status(500).json({ status: 500, data: output });
  }

}

export async function SyncAllCloudAppDataToDB(req: Request, res: Response, next: NextFunction) {
  const data = { wait: false, customDate: { start_date: req.body.start_date, end_date: req.body.end_date }, createOutputFile: false };
  await AutoSyncDataFromCloud(data, req, res, next);
}




