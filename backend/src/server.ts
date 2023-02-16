import "reflect-metadata"
import express from 'express';
import { json, urlencoded } from 'body-parser';
import { Functions, projectFolder, sslFolder } from './utils/functions';
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
const path = require('path');
const cron = require("node-cron");
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

// Backup a database at 11:59 PM every day.
cron.schedule('59 23 * * *', function () {
  // console.log('---------------------');
  // console.log('Running Cron Job');
  // if (shell.exec('sqlite3 database.sqlite .dump > data_dump.sql').code !== 0) {
  //   shell.exit(1);
  // }
  // else {
  //   shell.echo('Database backup complete');
  // }
});


//  ┌────────────── second (0 - 59) (optional)
//  │ ┌──────────── minute (0 - 59) 
//  │ │ ┌────────── hour (0 - 23)
//  │ │ │ ┌──────── day of the month (1 - 31)
//  │ │ │ │ ┌────── month (1 - 12)
//  │ │ │ │ │ ┌──── day of the week (0 - 6) (0 and 7 both represent Sunday)
//  │ │ │ │ │ │
//  │ │ │ │ │ │
//  * * * * * * 

cron.schedule("0 59 */23 * * *", function () {
  console.log("running a task every 23h 59 min 0 seconds");

  // const data: MailConfig = {
  //   admin: {
  //     from: "kossi.tsolegnagbo@aiesec.net",
  //     pass: "PasKos@2631989"
  //   },
  //   user: {
  //     to: "kossi.tsolegnagbo@gmail.com",
  //     subject: 'test nodejs mailler',
  //     text: 'Hi Kossi \n Juste te dire que ca marche !'
  //   }
  // }
  // mailService(data)
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
