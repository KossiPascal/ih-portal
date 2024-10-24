import "reflect-metadata"
import express, { Request, Response, NextFunction } from 'express';
import { json, urlencoded } from 'body-parser';
import { ServerStart, appVersion, getIPAddress, logNginx, normalizePort, projectFolder, sslFolder } from './utils/functions';
import { AppDataSource } from './data_source';
import cors from "cors";
//const cors = require('cors');
import bearerToken from "express-bearer-token";
import { Errors } from "./routes/error";
import authRouter from "./routes/auth-user";
import configRouter from "./routes/config";
import pyRouter from "./routes/run_python";
import syncRouter from "./routes/sync";
import fs from "fs";
import databaseRouter from "./routes/database";
import { AutoSyncDataFromCloud } from "./controllers/auto_server_sync";
import { Consts } from "./utils/constantes";
import { AuthUserController } from "./controllers/auth-user";


const helmet = require('helmet');
// const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cron = require("node-cron");
const compression = require("compression");
const responseTime = require('response-time')
require('dotenv').config({ path: sslFolder('.ih-env') });

const { ACCESS_ALL_AVAILABE_PORT, CAN_ACCESS_INSECURE, PROD_PORT, PROD_PORT_SECURED, DEV_PORT, DEV_PORT_SECURED, USE_LOCALHOST } = process.env

const hostnames = getIPAddress(ACCESS_ALL_AVAILABE_PORT == 'true');
const port = normalizePort((Consts.isProdEnv ? PROD_PORT : DEV_PORT) || Consts.defaultPort);
const portSecured = normalizePort((Consts.isProdEnv ? PROD_PORT_SECURED : DEV_PORT_SECURED) || Consts.defaultSecurePort);

// const cookieParser = require('cookie-parser')
var session = require('express-session');

AppDataSource
  .initialize()
  .then(async () => {
    logNginx("Server 1 -> initialize success !");
    logNginx(`Server 1 -> App Version: ${appVersion()}`);
    await AuthUserController.DefaultAdminCreation()
  })
  .catch(error => { 
    logNginx(`Server 1 -> ${error}`) 
  });

// const corsOptions = {
//   origin: '*',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: 'Content-Type,Authorization',
//   optionsSuccessStatus: 200,
// };

const app = express()
  .enable('trust proxy')
  .set('trust proxy', 1)
  .set("view engine", "ejs")
  .set('json spaces', 2)
  .set('content-type', 'application/json; charset=utf-8')
  .use(helmet({ contentSecurityPolicy: false }))
  .use(cors()) //.use(cors(corsOptions))
  .use(json())
  .use(responseTime())
  .use(compression())
  .use(urlencoded({ extended: false }))
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
  .use('/api/auth-user', authRouter)
  .use('/api/sync', syncRouter)
  .use('/api/python', pyRouter)
  .use('/api/configs', configRouter)
  .use('/api/database', databaseRouter)
  .use('/api/assets', express.static(__dirname + '/assets'))
  .use(express.static(path.join(projectFolder(), "views")))
  .use("/", (req: Request, res: Response) => res.sendFile(path.join(projectFolder(), "views/index.html")))
  .all('*', (req: Request, res: Response) => res.status(200).redirect("/"))
  .use(Errors.get404)
  .use(Errors.get500);

// app.get('/api/assets/i18n/en-lang.json', (req:Request, res:Response, next:NextFunction) => {
//   res.json({ message: 'Hello, this is your JSON response!' });
// });

const appSecured = app;
const credentials = {
  // key: fs.readFileSync(`${sslFolder('localhost/key.pem')}`, 'utf8'),
  // ca: fs.readFileSync(`${sslFolder('localhost/ca.pem')}`, 'utf8'),
  // cert: fs.readFileSync(`${sslFolder('localhost/cert.pem')}`, 'utf8'),
  key: fs.readFileSync(`${sslFolder('server.key')}`, 'utf8'),
  ca: fs.readFileSync(`${sslFolder('server-ca.crt')}`, 'utf8'),
  cert: fs.readFileSync(`${sslFolder('server.crt')}`, 'utf8'),
};

app.set('port', port);
appSecured.set('port', portSecured);

/* Redirect http to https */
appSecured.use((req: Request, res: Response, next: NextFunction) => {
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
cron.schedule("00 59 23 * * *", function () {
  const msg = `running this task every 23h 59 min 0 seconds.`;
  logNginx(msg);
  AutoSyncDataFromCloud();
});

// uploadData();

if (CAN_ACCESS_INSECURE == 'true') {
  ServerStart(1, { 
    isSecure: false, 
    app: app, 
    access_ports: ACCESS_ALL_AVAILABE_PORT == 'true', 
    port: port, 
    hostnames: hostnames, 
    useLocalhost: USE_LOCALHOST === 'true' 
  })
}
ServerStart(1, { 
  isSecure: true, 
  credential: credentials, 
  app: appSecured, 
  access_ports: ACCESS_ALL_AVAILABE_PORT == 'true', 
  port: portSecured, 
  hostnames: hostnames,
      useLocalhost: USE_LOCALHOST === 'true'
})



  // .use(helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
  //       // scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://localhost'],
  //       styleSrc: ["'self'", "'unsafe-inline'", '*'],
  //       // styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  //       fontSrc: ["'self'", '*'],
  //       // fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  //       imgSrc: ["'self'", 'data:', '*'],
  //       // imgSrc: ["'self'", 'data:'],
  //       connectSrc: ["'self'", '*'],
  //       // connectSrc: ["'self'", 'https://localhost'],
  //     },
  //   }
  // }))
  //.options('*', cors(corsOptions))