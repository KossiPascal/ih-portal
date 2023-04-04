import "reflect-metadata"
import express from 'express';
import { json, urlencoded } from 'body-parser';
import { Functions, projectFolder, sslFolder } from './utils/functions';
import { AppDataSource } from './data_source';
import cors from "cors";
import bearerToken from "express-bearer-token";
import { Errors } from "./routes/error";
import authRouter from "./routes/auth";
import configRouter from "./routes/config";
import pyRouter from "./routes/run_python";
import syncRouter from "./routes/sync";
import userRouter from "./routes/user";
import fs from "fs";
import databaseRouter from "./routes/database";
import { AutoSyncDataFromCloud } from "./routes/auto_server_sync";
import { Consts } from "./utils/constantes";
const path = require('path');
const cron = require("node-cron");

require('dotenv').config({ path: sslFolder('.env') });
const { ACCESS_ALL_AVAILABE_PORT, PROD_PORT, PROD_PORT_SECURED, DEV_PORT, DEV_PORT_SECURED, CAN_ACCESS_INSECURE } = process.env

const hostnames = Functions.getIPAddress(ACCESS_ALL_AVAILABE_PORT == 'true');
// const cookieParser = require('cookie-parser')
var session = require('express-session');
const port = Functions.normalizePort((Consts.isProdEnv ? PROD_PORT : DEV_PORT) || '3000');
const portSecured = Functions.normalizePort((Consts.isProdEnv ? PROD_PORT_SECURED : DEV_PORT_SECURED) || '3003');

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
  .use(bearerToken())
  .use('/api/auth', authRouter)
  .use('/api/sync', syncRouter)
  .use('/api/python', pyRouter)
  .use('/api/user', userRouter)
  .use('/api/configs', configRouter)
  .use('/api/database', databaseRouter)

  .use('/api/assets', express.static(__dirname + '/assets'))
  .use(express.static(path.join(projectFolder(), "views")))
  .use("/", (req, res) => res.sendFile(path.join(projectFolder(), "views/index.html")))
  .all('*', (req, res) => res.status(200).redirect("/"))
  .use(Errors.get404)
  .use(Errors.get500);

const appSecured = app;
const credentials = {
  key: fs.readFileSync(`${sslFolder('server.key')}`, 'utf8'),
  ca: fs.readFileSync(`${sslFolder('server-ca.crt')}`, 'utf8'),
  cert: fs.readFileSync(`${sslFolder('server.crt')}`, 'utf8')
};

app.set('port', port);
appSecured.set('port', portSecured);

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
  console.log(`running this task every 23h 05 min 0 seconds.`);
  AutoSyncDataFromCloud(portSecured);
});

// uploadData();

if (CAN_ACCESS_INSECURE == 'true') {
  Functions.ServerStart({ isSecure: false, app: app, access_ports: ACCESS_ALL_AVAILABE_PORT == 'true', port: port, hostnames: hostnames })
}
Functions.ServerStart({ isSecure: true, credential: credentials, app: appSecured, access_ports: ACCESS_ALL_AVAILABE_PORT == 'true', port: portSecured, hostnames: hostnames })




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
// .use(express.static(`${Functions.projectFolder()}/views`, {maxAge: `1y`}))
// .use('/', (req,res) => res.sendFile(`${Functions.projectFolder()}/views/index.html`))
// .use((req, res, next) => next(createError(404, "Not found")))

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

// import { JsonDatabase } from './json-data-source';
// const shell = require('shelljs');
// const createError = require("http-errors");
// import { MailConfig } from "./utils/appInterface";
// var cookie = require('cookie-session');
// var os = require('os');
// var networkInterfaces = os.networkInterfaces();
// console.log(networkInterfaces);
// var appdirname = path.dirname(process.cwd());