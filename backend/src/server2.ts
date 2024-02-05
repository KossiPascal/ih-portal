import express, { Request, Response, NextFunction } from 'express';
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
import * as path from 'path';
import fs from 'fs';
import { getIhDrugArrayData } from './controllers/dataFromDB';
import { Chws } from './entity/Sync';
import { ChwsDrugData, ChwsDrugDataWithChws, ChwsDrugQantityInfo } from './utils/appInterface';
import { AppDataSource } from './data_source';
import { ServerStart, appVersion, getIPAddress, logNginx, normalizePort, sslFolder } from './utils/functions';


require('dotenv').config({ path: sslFolder('.ih-env') });
const { ACCESS_ALL_AVAILABE_PORT, SERVER_2_API_PORT } = process.env

const hostnames = getIPAddress(ACCESS_ALL_AVAILABE_PORT == 'true');
const PORT_FOR_GET_API = normalizePort(SERVER_2_API_PORT || 9998);



AppDataSource
  .initialize()
  .then(async () => {
    console.log("initialize success !");
    logNginx("initialize success !");
    console.log(`App Version: ${appVersion()}`);
    logNginx(`App Version: ${appVersion()}`);
  })
  .catch(error => { console.log(`${error}`); logNginx(`${error}`) });

const app = express();

const validApiKeys = ['api_key'];
const validPaths = ['/api/chws-meg/doc', '/api/chws-meg', '/api/chws-meg.json', '/api/chws-meg.csv', '/api/uids/doc', '/api/uids', '/api/uids.json', '/api/uids.csv'];

app.use(helmet());

app.use((req: Request, res: Response, next: NextFunction) => {
  // if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') {
    if (validPaths.includes(req.path)) {
      if (req.secure) next();
      if (!req.secure) res.redirect(`https://${req.headers.host}${req.url}`);
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed', allowedMethods: ['GET'] });
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// #####################################################################

async function chwsMegJson(req: Request, res: Response, next: NextFunction): Promise<ChwsDrugDataWithChws[] | null> {
  const { api_key, date } = req.body ?? req.query ?? req.params;
  if (validApiKeys.includes(api_key)) {
    req.body = {
      start_date: `2023-11-21`,
      end_date: `2023-12-20`,
      districts: ['x8f4IKAC7TO'],
      sites: ['552aafc3-11a9-4209-8f17-d1ea13bab8d5'],
      // zones: ['8e18af53-1021-4486-8945-522f6e54f959'],
      chws: ['eafabdf9-c16a-44d5-83e4-a619d5478919']
    };

    const outPut = await getIhDrugArrayData(req, res, next);

    // const jsonData = [
    //   { id: 1, name: 'John Doe', age: 30, city: 'New York' },
    //   { id: 2, name: 'Jane Smith', age: 25, city: 'San Francisco' },
    //   { id: 3, name: 'John Doe', age: 30, city: 'New York' },
    //   { id: 4, name: 'Jane Smith', age: 25, city: 'San Francisco' },
    // ];
    if (outPut && outPut.status == 200) {
      const jsonData = outPut.data;
      if (jsonData && typeof jsonData != 'string') {
        if (jsonData.length <= 0) {
          return null;
        } else {
          const formatedJsonData = jsonData.map(meg => {
            const data = meg.data as ChwsDrugDataWithChws;
            data.chwId = meg.chw.id;
            data.chwName = meg.chw.name;
            return data;
          });
          return formatedJsonData;
        }
      }
    }
  }
  return null;
}
app.get('/api/chws-meg/doc', (req: Request, res: Response, next: NextFunction) => {
  const { api_key, date } = req.body ?? req.query ?? req.params;
  if (validApiKeys.includes(api_key)) {
    const params = {
      date: 'your-date',
      chwsMeg: ['chws-meg-code-1', 'chws-meg-code-2', 'chws-meg-code-2'],
      site: ['Adabawere', 'Djamdè', 'Kpindi', 'Sarakawa']
    };
    return res.render('chws-meg', params);
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/chws-meg', async (req: Request, res: Response, next: NextFunction) => {
  const chwsMegJsonData: ChwsDrugDataWithChws[] | null = await chwsMegJson(req, res, next);
  if (chwsMegJsonData) {
    return res.json({ CHWS_MEG: chwsMegJsonData });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/chws-meg.json', async (req: Request, res: Response, next: NextFunction) => {
  const chwsMegJsonData: ChwsDrugDataWithChws[] | null = await chwsMegJson(req, res, next);
  if (chwsMegJsonData) {
    return res.json({ CHWS_MEG: chwsMegJsonData });
  } else {
    return res.status(401).json({ error: chwsMegJsonData });
  }
});

app.get('/api/chws-meg.csv', async (req: Request, res: Response, next: NextFunction) => {
  const csvData: ChwsDrugDataWithChws[] | null = await chwsMegJson(req, res, next);
  if (csvData) {
    const fileName = `chws-meg-${Date.now()}.csv`;
    const downloadPath = path.resolve(`${__dirname}/downloads`, fileName);

     // Extract unique keys from data
  const allKeys = new Set(csvData.flatMap(item => Object.keys(item)));

  // Filter out common keys like 'id' and 'name'
  const header = Array.from(allKeys).filter(key => key !== 'id' && key !== 'name');

  // Define CSV writer
  const csvWriter = createCsvWriter({
    path: 'output.csv',
    header: [
      { id: 'id', title: 'id' },
      { id: 'name', title: 'name' },
      ...header.map(key => ({ id: key, title: key })),
    ],
  });

  // Flatten the data for CSV records
  const records = csvData.map(item0 => {
    const item = item0 as any;
    const record = { id: 'item.id', name: 'item.name' } as any;
    header.forEach(key => {
      record[key] = item[key] ? item[key].momo : '';
      record[key + '_value'] = item[key] ? item[key].value : '';
    });
    return record;
  });

  // Write CSV to response
  csvWriter.writeRecords(records)
    .then(() => {
      res.attachment('output.csv');
      res.status(200).sendFile('output.csv');
    })
    .catch((err:any) => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });



  //   // const csvDataHeader = Object.keys(csvData[0]).map((key) => ({
  //   //   id: key,
  //   //   title: key.charAt(0).toUpperCase() + key.slice(1),
  //   // }));

  //   // const csvDataHeader:{ id: string, title: string }[] = [];

  //   // const flattenObject = (obj:any, parentKey = '') => {
  //   //   for (const key in obj) {
  //   //     const currentKey = parentKey ? `${parentKey}_${key}` : key;
  //   //     if (typeof obj[key] === 'object') {
  //   //       flattenObject(obj[key], currentKey);
  //   //     } else {
  //   //       csvDataHeader.push({ id: currentKey, title: currentKey });
  //   //     }
  //   //   }
  //   // };
  //   // flattenObject(csvData[0]);

  //   // const flattenedData = csvData.reduce((result:any[], item:any) => {
  //   //   for (const key in item) {
  //   //     if (typeof item[key] === 'object') {
  //   //       const rowData = Object.values(item[key]);
  //   //       result.push(rowData);
  //   //     }
  //   //   }
  //   //   return result;
  //   // }, []);

  //   const megList = Object.keys(csvData[0]).map((key) => key);
  //   const columnList = Object.keys(csvData[0].SRO_10).map((key) => key);

  //   for (let i = 0; i < megList.length; i++) {
  //     const m = megList[i];
  //     for (let j = 0; j < csvData.length; j++) {
  //       const c = csvData[j] as any;
  //       const d = c[m] as any;
        
  //       for (let k = 0; k < columnList.length; k++) {
  //         const e = columnList[k] as any;
  //         const f = d[e]
          
          
  //       }
  //     }

      
  //   }

  //   const csvWriter = createCsvWriter({
  //     path: downloadPath,
  //     header: csvDataHeader,
  //   });

  //   const finalRowData:any[] = [];

  //   csvData.forEach((item1:any )=> {
  //   });

  //   for (let i = 0; i < csvData.length; i++) {
  //     const item1 = csvData[i] as any;
  //     const rowData = [];
  //     for (const k1 in item1) {
  //       if (typeof item1[k1] === 'object') {
  //         rowData.push(k1);
  //         const item2 = item1[k1];
  //         for (const k2 in item2) {
  //           if (typeof item2[k2] !== 'object') {
  //             rowData.push(item2[k2]);
  //           }
  //         }
  //       }
  //     }
  //     finalRowData.push(rowData)
      
  //   }

  //   csvWriter.writeRecords(finalRowData).then(() => {
  //     res.attachment(fileName);
  //     return res.status(200).sendFile(downloadPath, () => {
  //       // After sending the file, delete it
  //       fs.unlink(downloadPath, (err) => {
  //         if (err) {
  //           console.error('Error deleting file:', err);
  //         } else {
  //           console.log('File deleted successfully:', downloadPath);
  //         }
  //       });
  //     });
  //   }).catch((err: any) => {
  //     console.error(err);
  //     return res.status(500).json({ error: 'Internal Server Error' });
  //   });
  } else {
    return res.status(404).json({ error: 'No data found in db' });
  }
});

// #####################################################################

async function uidsJson(req: Request, res: Response, next: NextFunction): Promise<any> {
  const { api_key, number } = req.body ?? req.query ?? req.params;
  if (validApiKeys.includes(api_key)) {
    if (number && number != '') {
      const numIds = parseInt(number, 10);
      if (isNaN(numIds) || numIds <= 0) {
        return 'A';
      }
      // const csvData = Array.from({ length: numIds }, () => uuidv4());
      const csvData = Array.from({ length: numIds }, () => ({
        id: uuidv4(),
      }));
      return csvData.length <= 0 ? 'D' : csvData;
    } else {
      return 'B';
    }
  } else {
    return 'C';
  }
}
app.get('/api/uids/doc', (req: Request, res: Response, next: NextFunction) => {
  const { api_key, date } = req.body ?? req.query ?? req.params;
  if (validApiKeys.includes(api_key)) {
    return res.render('uids', { uids: 'uids' });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});
app.get('/api/uids', async (req: Request, res: Response, next: NextFunction) => {
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
app.get('/api/uids.json', async (req: Request, res: Response, next: NextFunction) => {
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
  const uidsJsonData: any[] | string = await uidsJson(req, res, next);
  if (uidsJsonData === 'A') {
    return res.json({ error: 'Provide valid number' });
  } else if (uidsJsonData === 'B') {
    return res.status(401).json({ error: 'Provide number of IDs' });
  } else if (uidsJsonData === 'C') {
    return res.status(401).json({ error: 'Unauthorized' });
  } else if (uidsJsonData == 'D') {
    return res.status(404).json({ error: 'No data found in db' });
  } else {
    const fileName = `uuids-${Date.now()}.csv`;
    const downloadPath = path.resolve(`${__dirname}/downloads`, fileName);
    const csvWriter = createCsvWriter({
      path: downloadPath,
      header: [{ id: 'id', title: 'IDs' }],
    });
    csvWriter.writeRecords(uidsJsonData as any[])
      .then(() => {
        res.attachment(fileName);
        return res.status(200).sendFile(downloadPath);
      })
      .catch((err: any) => {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      });
  }
});

// #####################################################################

const credentials = {
  key: fs.readFileSync(`${sslFolder('server.key')}`, 'utf8'),
  ca: fs.readFileSync(`${sslFolder('server-ca.crt')}`, 'utf8'),
  cert: fs.readFileSync(`${sslFolder('server.crt')}`, 'utf8')
};
app.set('port', PORT_FOR_GET_API);


ServerStart({ isSecure: true, credential: credentials, app: app, access_ports: ACCESS_ALL_AVAILABE_PORT == 'true', port: PORT_FOR_GET_API, hostnames: hostnames })
