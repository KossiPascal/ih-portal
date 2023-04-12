import { getSiteSyncRepository, Sites } from "../entity/Sync";
import { User } from "../entity/User";
import { JsonDatabase } from "../json-data-source";
import { notNull, DateUtils, sslFolder } from "../utils/functions";
const request = require('request');

require('dotenv').config({ path: sslFolder('.env') });
const { DEFAULT_DHIS2_USER_ID, LOCALHOST, CHT_HOST } = process.env;

export function AutoSyncDataFromCloud(secure_port: any) {
  const startAt = (new Date()).getTime();
  const defaultUserId = DEFAULT_DHIS2_USER_ID;
  if(defaultUserId!=null && defaultUserId!=undefined && defaultUserId!=""){
    const _repoUser = new JsonDatabase('users');
    const user = _repoUser.getBy(defaultUserId) as User;
    if (notNull(user)) {
      const initDate = DateUtils.startEnd21and20Date()
      const start_date = initDate.start_date;
      const end_date = initDate.end_date;
      const api_host = `https://${LOCALHOST || CHT_HOST}:${secure_port}/api`;
      const headers = { "Content-Type": "application/json" };
      console.log('\n\nstart fetching orgunits\n');
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
          dhisusersession: user.dhisusersession,
          userId: user.id,
          privileges: true
        }),
        headers: headers
      }, async function (res: any) {
        console.log('\n\nstart fetching tonoudayo data\n');
        request({
          url: `${api_host}/sync/fetch/data`,
          method: 'POST',
          body: JSON.stringify({
            start_date: start_date,
            end_date: end_date,
            dhisusersession: user.dhisusersession,
            userId: user.id,
            privileges: true
          }),
          headers: headers
        }, async function (res: any) {
          const repository = await getSiteSyncRepository();
          var sites: Sites[] = await repository.find();
          var _resp = [];
          for (let ou = 0; ou < sites.length; ou++) {
            const orgUnit = sites[ou].id;
            console.log(`\n\nstart fetching dhis2 data with orgUnit = ${orgUnit}\n`);
            request({
              url: `${api_host}/sync/dhis2/data`,
              method: 'POST',
              body: JSON.stringify({
                orgUnit: orgUnit,
                filter: [`RlquY86kI66:GE:${start_date}:LE:${end_date}`],
                fields: ['event', 'orgUnit', 'orgUnitName', 'dataValues[dataElement,value]'],
                dhisusersession: user.dhisusersession,
                userId: user.id,
                privileges: true
              }),
              headers: headers
            }, async function (res: any) {
              _resp.push('Ok');
              if (_resp.length == sites.length) {
                const now = new Date();
                const seconds = (now.getTime() - startAt) / 1000;
                const display = seconds <= 60 ? `${seconds} sec` : (seconds/60) <= 60 ? `${(seconds/60).toFixed(2)} min` : `${((seconds/60)/60).toFixed(2)} h`; 
                const _repoSync = new JsonDatabase('syncs');
                const syncFound = await _repoSync.getBy(DateUtils.getDateInFormat(now));
                var sync:any;
                const details = {
                  start_at:startAt,
                  end_at:now.getTime(),
                  duration: display,
                };
                if (!syncFound) {
                  sync = {
                    id:DateUtils.getDateInFormat(now),
                    details:[
                      details
                    ]
                  }
                } else {
                  syncFound.details.push(details);
                  sync = syncFound;
                }
                await _repoSync.save(sync),
                console.log(`\n\nDurée de l'action: ${display}\n`);
              };
            });
          }
        });
      });
    }
  }
}


