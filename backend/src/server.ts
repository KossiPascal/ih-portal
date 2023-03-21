import "reflect-metadata"
import express from 'express';
import { json, urlencoded } from 'body-parser';
import { DateUtils, Functions, isChws, notNull, projectFolder, sslFolder } from './utils/functions';
require('dotenv').config({ path: sslFolder('.env') });
import { AppDataSource } from './data_source';
// import { JsonDatabase } from './json-data-source';

import cors from "cors";
import bearerToken from "express-bearer-token";
import { Errors } from "./routes/error";
import authRouter from "./routes/auth";
import configRouter from "./routes/config";
import pyRouter from "./routes/run_python";
import syncRouter from "./routes/sync";
import userRouter from "./routes/user";
import fs from "fs";
import https from "https";
import http from "http";
import databaseRouter from "./routes/database";
import { User } from "./entity/User";
import { JsonDatabase } from "./json-data-source";
import { In } from "typeorm";
import { getSiteSyncRepository, Sites } from "./entity/Sync";
const path = require('path');
const cron = require("node-cron");
const request = require('request');
// const shell = require('shelljs');
// const createError = require("http-errors");
// import { MailConfig } from "./utils/appInterface";

const accessAllAvailablePort = process.env.ACCESS_ALL_AVAILABE_PORT == 'true';
const hostnames = Functions.getIPAddress(accessAllAvailablePort);

const cookieParser = require('cookie-parser')
var session = require('express-session');
// var cookie = require('cookie-session');

// var os = require('os');
// var networkInterfaces = os.networkInterfaces();
// console.log(networkInterfaces);

const port = Functions.normalizePort(process.env.PORT || '3000');
const portSecured = Functions.normalizePort(process.env.PORT_SECURED || '8000'); // defining port secured
// var appdirname = path.dirname(process.cwd());


AppDataSource
.initialize()
.then(async () => {
  console.log("initialize success !");
  console.log(`App Version: ${Functions.appVersion()}`)
})
.catch(error => console.log(`${error}`));


const app = express()
  .use(cors())
  .use(json())
  .use(urlencoded({ extended: false }))
  .enable('trust proxy')
  .set('trust proxy', 1)
  .set("view engine", "ejs")
  .set('json spaces', 2)
  .set('content-type', 'application/json; charset=utf-8')
  .use(session({
    secret: 'session',
    cookie: {
      secure: true,
      maxAge: 60000
    },
    // store: new RedisStore(),
    saveUninitialized: true,
    resave: true
  }))
  // .use((req, res) => {
  //   console.log("kookkokoko: Your IP Addresss is: " + req.socket.localAddress);
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Content-Type', 'application/json');
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Custom-Header, Authorization,X-Requested-With');
  // res.writeHead(200, {'Content-Type': 'application/json'});
  // res.writeHead(200, {'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'});
  // res.writeHead(200, {'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Custom-Header, Authorization,X-Requested-With'});
  // })
  .use(bearerToken())
  .use('/api/auth', authRouter)
  .use('/api/sync', syncRouter)
  .use('/api/python', pyRouter)
  .use('/api/user', userRouter)
  .use('/api/configs', configRouter)
  .use('/api/database', databaseRouter)

  .use('/api/assets', express.static(__dirname + '/assets'))
  // .use(express.static(`${Functions.projectFolder()}/views`, {maxAge: `1y`}))
  // .use('/', (req,res) => res.sendFile(`${Functions.projectFolder()}/views/index.html`))
  .use(express.static(path.join(projectFolder(), "views")))
  .use("/", (req, res) => res.sendFile(path.join(projectFolder(), "views/index.html")))
  .all('*', (req, res) => res.status(200).redirect("/"))
  // .use((req, res, next) => next(createError(404, "Not found")))
  .use(Errors.get404)
  .use(Errors.get500);



const appSecured = app;
const credentials = {
  key: fs.readFileSync(`${sslFolder('server.key')}`, 'utf8'),
  ca: fs.readFileSync(`${sslFolder('server-ca.crt')}`, 'utf8'),
  cert: fs.readFileSync(`${sslFolder('server.crt')}`, 'utf8')
};

app.set('port', port);
appSecured.set('port', portSecured); // appSecured listen to 8000 port

/* Redirect http to https */
appSecured.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.secure) next();
  if (!req.secure) res.redirect(`https://${req.headers.host}${req.url}`);
})


//  ┌────────────── second (0 - 59) (optional)
//  │ ┌──────────── minute (0 - 59) 
//  │ │ ┌────────── hour (0 - 23)
//  │ │ │ ┌──────── day of the month (1 - 31)
//  │ │ │ │ ┌────── month (1 - 12)
//  │ │ │ │ │ ┌──── day of the week (0 - 6) (0 and 7 both represent Sunday)
//  │ │ │ │ │ │
//  │ │ │ │ │ │
//  * * * * * * 

cron.schedule("0 05 */23 * * *", function () {
  const startAt = (new Date()).getTime();
  console.log(`running this task every 22h 30 min 0 seconds.`);
  const defaultUserId = process.env.DEFAULT_DHIS2_USER_ID;
  if(defaultUserId!=null && defaultUserId!=undefined && defaultUserId!=""){
    const _repoUser = new JsonDatabase('users');
    const user = _repoUser.getBy(defaultUserId) as User;
    if (notNull(user)) {
      const initDate = DateUtils.startEnd21and20Date()
      const start_date = initDate.start_date;
      const end_date = initDate.end_date;
      const api_host = `https://${process.env.LOCALHOST || process.env.CHT_HOST}:${portSecured}/api`;
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
              const seconds = ((new Date()).getTime() - startAt) / 1000;
              const display = seconds <= 60 ? `${seconds} sec` : `${(seconds/60).toFixed(2)} min`
              if (_resp.length == sites.length) console.log(`\n\nDurée de l'action: ${display}\n`);
              
            });

          }
        });
      });
    }
  }
});




if (process.env.CAN_ACCESS_INSECURE == 'true') {
  /**
  * Create HTTP server.
  */
  const server = http.createServer(app);
  // var io = require('socket.io')(server, {});
  // server.listen(port, '0.0.0.0', () => Functions.onProcess)
  if (accessAllAvailablePort) server.listen(port, '0.0.0.0', () => Functions.onProcess);
  if (!accessAllAvailablePort) server.listen(port, hostnames[0], () => Functions.onProcess);
  server.on('error', (err) => Functions.onError(err, port));
  server.on('listening', () => Functions.onListening(server, hostnames));
  server.on('connection', (stream) => console.log('someone connected!'));

}


/**
* Create HTTPS server.
*/
const serverSecured = https.createServer(credentials, appSecured);
// var io = require('socket.io')(serverSecured, {});
// serverSecured.listen(portSecured, '0.0.0.0', () => Functions.onProcess)
if (accessAllAvailablePort) serverSecured.listen(portSecured, '0.0.0.0', () => Functions.onProcess);
if (!accessAllAvailablePort) serverSecured.listen(portSecured, hostnames[0], () => Functions.onProcess);
serverSecured.on('error', (err) => Functions.onError(err, portSecured));
serverSecured.on('listening', () => Functions.onListening(serverSecured, hostnames, 'https'));
serverSecured.on('connection', (stream) => console.log('someone connected!'));



  
// // Backup a database at 11:59 PM every day.
// cron.schedule('59 23 * * *', function () {
//   // if (shell.exec('sqlite3 database.sqlite .dump > data_dump.sql').code !== 0) { .exit(1); }
//   // else { shell.echo('Database backup complete'); }
  
//   // const data: MailConfig = {
//   //   admin: { from: "kossi.tsolegnagbo@aiesec.net", pass: "PasKos@2631989" },
//   //   user: { to: "kossi.tsolegnagbo@gmail.com", subject: 'test nodejs mailler', text: 'Hi Kossi \n Juste te dire que ca marche !' }
//   // }
//   // mailService(data)
// });
