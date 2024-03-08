import express, { Request, Response, NextFunction } from 'express';
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
import path from 'path';
import fs from 'fs';
import { getIhDrugArrayDataPerChw } from './controllers/dataFromDB';
import { ApiTokenAccess, Chws, Districts, Sites, Zones, getApiTokenAccessRepository, getChwsSyncRepository, getDistrictSyncRepository, getSiteSyncRepository, getZoneSyncRepository } from './entity/Sync';
import { ChwsDrugDataWithChws } from './utils/appInterface';
import { AppDataSource } from './data_source';
import { ServerStart, appVersion, getIPAddress, logNginx, normalizePort, notEmpty, sslFolder } from './utils/functions';
import cors from 'cors';
import bearerToken from 'express-bearer-token';
// import { IncomingMessage } from 'http';
// const { createProxyMiddleware } = require('http-proxy-middleware');

const session = require('express-session');
const compression = require("compression");
const responseTime = require('response-time')
const fetch = require('node-fetch');

require('dotenv').config({ path: sslFolder('.ih-env') });
const { ACCESS_ALL_AVAILABE_PORT, SERVER_2_API_PORT } = process.env;

const hostnames = getIPAddress(ACCESS_ALL_AVAILABE_PORT == 'true');
const PORT_FOR_GET_API = normalizePort(SERVER_2_API_PORT || 9998);

const parseInQuery = (input: string): string[] => {
  const data = [];
  try {
    const regex1 = /['\[\]\s"]/g;
    const regex2 = /%27/g;
    if (input && notEmpty(input)) {
      const dts = input.split(',');
      for (let i = 0; i < dts.length; i++) {
        var res = dts[i].replace(regex1, '');
        res = res.replace(regex2, '');
        data.push(res);
      }
    }
  } catch (error) { }
  return data;
};

AppDataSource
  .initialize()
  .then(async () => {
    console.log("initialize success !");
    logNginx("initialize success !");
    console.log(`App Version: ${appVersion()}`);
    logNginx(`App Version: ${appVersion()}`);
  })
  .catch(error => { console.log(`${error}`); logNginx(`${error}`) });


async function getDistrictsSitesZonesChws(req: Request, res: Response, dataType: 'districts' | 'sites' | 'zones' | 'chws') {
  try {
    if (dataType == 'districts') {
      const repoDistrict = await getDistrictSyncRepository();
      const districts: Districts[] = await repoDistrict.find();
      if (districts) {
        return res.status(200).json({ length: districts.length, districts: districts });
      }
    }
    if (dataType == 'sites') {
      const repoSite = await getSiteSyncRepository();
      const sites: Sites[] = await repoSite.find();
      if (sites) {
        return res.status(200).json({ length: sites.length, sites: sites });
      }
    }
    if (dataType == 'zones') {
      const repoZone = await getZoneSyncRepository();
      const zones: Zones[] = await repoZone.find();
      if (zones) {
        return res.status(200).json({ length: zones.length, zones: zones });
      }
    }
    if (dataType == 'chws') {
      const repoChw = await getChwsSyncRepository();
      const chws: Chws[] = await repoChw.find();
      if (chws) {
        return res.status(200).json({ length: chws.length, chws: chws });
      }
    }
  } catch (e: any) { }
  return res.status(500).json({ error: 'Internal Server Error' });

}
async function chwsMegJson(req: Request, res: Response, next: NextFunction): Promise<ChwsDrugDataWithChws[]> {
  const { year, month, districts, sites, zones, chws } = req.body ?? req.query ?? req.params;

  const districtsArray = parseInQuery(districts);
  const sitesArray = parseInQuery(sites);
  const zonesArray = parseInQuery(zones);
  const chwsArray = parseInQuery(chws);

  if (!notEmpty(year) || !notEmpty(month)) {
    res.status(401).json({ error: "L'année `year` et le mois `month` sont obligatoires." });
    return [];
  }

  if (!notEmpty(districtsArray) || !notEmpty(sitesArray)) {
    res.status(401).json({ error: "`districts` et `sites` sont obligatoire" });
    return [];
  }

  // if (!notEmpty(districtsArray) && !notEmpty(sitesArray) && !notEmpty(chwsArray)) {
  //   res.status(401).json({ error: "[zones, chws] L'un des paramettre dans ce tableau est obligatoire" });
  //   return [];
  // }
  
  
  req.body = {
    year: parseInt(year),
    month: String(parseInt(month)).padStart(2, '0'),
    districts: districtsArray,
    sites: sitesArray,
    zones: zonesArray,
    chws: chwsArray
  };

  const outPut = await getIhDrugArrayDataPerChw(req, res, next);

  if (outPut && outPut.status == 200) {
    const jsonData = outPut.data;
    if (jsonData && typeof jsonData != 'string') {
      const formatedJsonData = jsonData.map(meg => {
        const data = meg.drugData as ChwsDrugDataWithChws;
        data.chw = meg.chw;
        return data;
      });
      return formatedJsonData;
    }
  }
  return [];
}
async function uidsJson(req: Request, res: Response, next: NextFunction): Promise<any> {
  const { number } = req.body ?? req.query ?? req.params;
  if (number && number != '') {
    const numIds = parseInt(number, 10);
    if (isNaN(numIds) || numIds <= 0) {
      return 'A';
    }
    const csvData = Array.from({ length: numIds }, () => ({
      id: uuidv4(),
    }));
    return csvData.length <= 0 ? 'D' : csvData;
  } else {
    return 'B';
  }
}


const app = express();

const validPaths = [
  '/api/documentations',
  '/api/chws-meg',
  '/api/chws-meg.json',
  // '/api/chws-meg.csv',
  // '/api/uids',
  // '/api/uids.json',
  // '/api/uids.csv',
  '/api/districts',
  '/api/districts.json',
  '/api/sites',
  '/api/sites.json',
  '/api/zones',
  '/api/zones.json',
  '/api/chws',
  '/api/chws.json'
];

app.use(helmet());

// const apiTarget = 'https://localhost:9998/api';
// app.use(
//   createProxyMiddleware({
//     target: apiTarget,
//     changeOrigin: false,
//     secure: false,
//     // pathRewrite: {
//     //   '^/api': '',
//     // },
//     onProxyRes: (proxyRes:IncomingMessage, req:Request, res:Response, ) => {
//       res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
//     },
//   })
// );

app.enable('trust proxy')
app.set('trust proxy', 1)
app.set('content-type', 'application/json; charset=utf-8')
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors({
  origin: true,//['http://127.0.0.1:5501', 'http://127.0.0.1:5502'],
  credentials: true
}));
app.use(responseTime())
app.use(compression())
app.set('json spaces', 0);
app.use(session({
  secret: 'session',
  cookie: {
    secure: true,
    maxAge: 60000
  },
  saveUninitialized: true,
  resave: true
}));
app.use(bearerToken())
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response
});

app.use(async (req: Request, res: Response, next: NextFunction) => {
  const { api_access_key } = req.body ?? req.query ?? req.params;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed', allowedMethods: ['GET'] });
  if (!req.secure) return res.redirect(`https://${req.headers.host}${req.url}`);
  const apiRepo = await getApiTokenAccessRepository();

  // if (!api_access_key || api_access_key == '') return res.status(405).json({ error: 'You must provide a valid `api_access_key`' });
  const validApiKeysElement: ApiTokenAccess[] = await apiRepo.findBy({ isActive: true });
  const validApiKeys = validApiKeysElement.map(api => api.token);
  // if (!validApiKeys.includes(api_access_key) || !validPaths.includes(req.path)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.secure) next();
});

app.get('/api/documentations', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 0);
  const { date } = req.body ?? req.query ?? req.params;
  const params = {
    host: 'https://portal-integratehealth.org:9998/api/chws-meg?',
    api_access_key: 'api_access_key = your_valid_api_access_key',
    year: '& year = 2023',
    month: '& month = 12',
    districts: '& districts = x8f4IKAC7TO',
    sites: '& sites = [552aafc3-11a9-4209-8f17-d1ea13bab8d5]',
    chws: '& chws = [eafabdf9-c16a-44d5-83e4-a619d5478919]',
    full_url: 'https://portal-integratehealth.org:9998/api/chws-meg?api_access_key=your_valid_api_access_key&year=2023&month=12&districts=x8f4IKAC7TO&sites=[552aafc3-11a9-4209-8f17-d1ea13bab8d5]&chws=[eafabdf9-c16a-44d5-83e4-a619d5478919]',
  };
  return res.render('documentations', params);
});

app.get('/api/districts', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 0);
  return await getDistrictsSitesZonesChws(req, res, 'districts');
});
app.get('/api/sites', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 0);
  return await getDistrictsSitesZonesChws(req, res, 'sites');
});
app.get('/api/zones', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 0);
  return await getDistrictsSitesZonesChws(req, res, 'zones');
});
app.get('/api/chws', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 0);
  return await getDistrictsSitesZonesChws(req, res, 'chws');
});

// app.get('/api/chws-meg', async (req, res) => {
//   try {
//     const response = await fetch('https://localhost:9998/api/chws-meg?api_access_key=afrikDigitalAZ-FGHJ@04jdkj2024&year=2023&month=12&districts=x8f4IKAC7TO&sites=[552aafc3-11a9-4209-8f17-d1ea13bab8d5]&chws=[eafabdf9-c16a-44d5-83e4-a619d5478919]', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       credentials: 'include'
//     });
//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
app.get('/api/chws-meg', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 0);
  const chwsMegJsonData: ChwsDrugDataWithChws[] = await chwsMegJson(req, res, next);
  if (chwsMegJsonData.length > 0) {
    const objectLength = Object.keys(chwsMegJsonData[0]).length;
    return res.status(200).json({ length: objectLength, CHWS_MEG: chwsMegJsonData });
  }
});
app.get('/api/chws-meg.csv', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 0);
  const csvData: ChwsDrugDataWithChws[] = await chwsMegJson(req, res, next);
  if (csvData.length > 0) {
    const fileName = `chws-meg-${Date.now()}.csv`;
    const downloadPath = path.resolve(`${__dirname}/downloads`, fileName);
    const allKeys = new Set(csvData.flatMap(item => Object.keys(item)));
    const header = Array.from(allKeys).filter(key => key !== 'id' && key !== 'name');
    const csvWriter = createCsvWriter({
      path: 'output.csv',
      header: [
        { id: 'id', title: 'id' },
        { id: 'name', title: 'name' },
        ...header.map(key => ({ id: key, title: key })),
      ],
    });
    const records = csvData.map(item0 => {
      const item = item0 as any;
      const record = { id: 'item.id', name: 'item.name' } as any;
      header.forEach(key => {
        record[key] = item[key] ? item[key].momo : '';
        record[key + '_value'] = item[key] ? item[key].value : '';
      });
      return record;
    });
    csvWriter.writeRecords(records)
      .then(() => {
        res.attachment('output.csv');
        res.status(200).sendFile('output.csv');
      })
      .catch((err: any) => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  }
});

app.get('/api/uids', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 0);
  const uidsJsonData = await uidsJson(req, res, next);
  if (uidsJsonData === 'A') {
    return res.json({ error: 'Provide valid number' });
  } else if (uidsJsonData === 'B') {
    return res.status(401).json({ error: 'Provide number of IDs' });
  } else if (uidsJsonData === 'C') {
    return res.status(401).json({ error: 'Unauthorized' });
  } else if (uidsJsonData == 'D') {
    return res.status(404).json({ error: 'No data found in db' });
  } else {
    return res.json(uidsJsonData);
  }
});
app.get('/api/uids.csv', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 0);
  const csvData: any = await uidsJson(req, res, next);
  if (csvData === 'A') {
    return res.json({ error: 'Provide valid number' });
  } else if (csvData === 'B') {
    return res.status(401).json({ error: 'Provide number of IDs' });
  } else if (csvData === 'C') {
    return res.status(401).json({ error: 'Unauthorized' });
  } else if (csvData == 'D') {
    return res.status(404).json({ error: 'No data found in db' });
  } else {
    const fileName = `uids-${Date.now()}.csv`;
    const downloadPath = path.resolve(`${__dirname}/downloads`, fileName);
    const csvWriter = createCsvWriter({
      path: 'output.csv',
      header: [
        { id: 'id', title: 'id' },
      ],
    });
    csvWriter.writeRecords(csvData)
      .then(() => {
        res.attachment('output.csv');
        res.status(200).sendFile('output.csv');
      })
      .catch((err: any) => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  }
});

app.get('/api/districts.json', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 2);
  return await getDistrictsSitesZonesChws(req, res, 'districts');
});
app.get('/api/sites.json', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 2);
  return await getDistrictsSitesZonesChws(req, res, 'sites');
});
app.get('/api/zones.json', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 2);
  return await getDistrictsSitesZonesChws(req, res, 'zones');
});
app.get('/api/chws.json', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 2);
  return await getDistrictsSitesZonesChws(req, res, 'chws');
});

app.get('/api/chws-meg.json', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 2);
  const chwsMegJsonData: ChwsDrugDataWithChws[] = await chwsMegJson(req, res, next);
  if (chwsMegJsonData.length > 0) {
    const objectLength = Object.keys(chwsMegJsonData[0]).length;
    return res.status(200).json({ length: objectLength, CHWS_MEG: chwsMegJsonData });
  }
});

app.get('/api/uids.json', async (req: Request, res: Response, next: NextFunction) => {
  app.set('json spaces', 2);
  const uidsJsonData = await uidsJson(req, res, next);
  if (uidsJsonData === 'A') {
    return res.json({ error: 'Provide valid number' });
  } else if (uidsJsonData === 'B') {
    return res.status(401).json({ error: 'Provide number of IDs' });
  } else if (uidsJsonData === 'C') {
    return res.status(401).json({ error: 'Unauthorized' });
  } else if (uidsJsonData == 'D') {
    return res.status(404).json({ error: 'No data found in db' });
  } else {
    return res.json(uidsJsonData);
  }
});

const credentials = {
  key: fs.readFileSync(`${sslFolder('server.key')}`, 'utf8'),
  ca: fs.readFileSync(`${sslFolder('server-ca.crt')}`, 'utf8'),
  cert: fs.readFileSync(`${sslFolder('server.crt')}`, 'utf8')
};
app.set('port', PORT_FOR_GET_API);

const server = ServerStart({ isSecure: true, credential: credentials, app: app, access_ports: ACCESS_ALL_AVAILABE_PORT == 'true', port: PORT_FOR_GET_API, hostnames: hostnames })


// process.on('SIGTERM', () => {
//   console.info('SIGTERM signal received.');
//   console.log('Closing http server.');
//   server.close(async () => {
//     console.log('Http server closed.');
//     // await AppDataSource.closeConnection();
//   });
// });

