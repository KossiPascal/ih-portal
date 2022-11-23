import { DataFromDbController } from "../controllers/dataFromDB";
import { SyncFromCouchDbController } from "../controllers/syncFormCouchDb";
import { Middelware } from "../middleware/auth";

const express = require('express');
const { body } = require('express-validator');
const syncRouter = express.Router();
 

syncRouter.post(
  '/data',
  [
    body('medic_host').trim().isLength({ min: 5 }).not().isEmpty(),
    body('medic_username').trim().isLength({ min: 3 }).not().isEmpty(),
    body('medic_password').trim().isLength({ min: 8 }).not().isEmpty(),
    body('start_date').trim().isDate().not().isEmpty(),
    body('end_date').trim().isDate().not().isEmpty()
  ],
  SyncFromCouchDbController.fetchChwsDataByReportsDateViewFromCouchDb
);

syncRouter.post('/dhis2_data', Middelware.authMiddleware,SyncFromCouchDbController.fetchChwsDataFromDhis2);

syncRouter.post(
  '/site_family_person',
  [
    body('medic_host').trim().isLength({ min: 5 }).not().isEmpty(),
    body('medic_username').trim().isLength({ min: 3 }).not().isEmpty(),
    body('medic_password').trim().isLength({ min: 8 }).not().isEmpty(),
  ],
  SyncFromCouchDbController.fetchAllSitesFamiliesPersonsRegisteredFromCouchDb
);

syncRouter.get('/alls', Middelware.authMiddleware,DataFromDbController.getAllData);

syncRouter.post('/all', Middelware.authMiddleware,DataFromDbController.getAllDataWithParams);
syncRouter.get('/by/:id', Middelware.authMiddleware,DataFromDbController.getDataByParams);
syncRouter.post('/chws', Middelware.authMiddleware,DataFromDbController.getChws);
syncRouter.post('/districts', Middelware.authMiddleware,DataFromDbController.getDistricts);
syncRouter.post('/sites', Middelware.authMiddleware,DataFromDbController.getSites);
syncRouter.post('/zones', Middelware.authMiddleware,DataFromDbController.getZones);
syncRouter.post('/families', Middelware.authMiddleware,DataFromDbController.getFamilies);
syncRouter.post('/patients', Middelware.authMiddleware,DataFromDbController.getPatients);
syncRouter.delete('/delete/:id', Middelware.authMiddleware,DataFromDbController.deleteSyncData);
syncRouter.delete('/delete/all', Middelware.authMiddleware,DataFromDbController.deleteAllSyncData);

export = syncRouter;


// const interval = setInterval(function() {}, 5000);
// clearInterval(interval); // thanks @Luca D'Amico

// var minutes = 5, the_interval = minutes * 60 * 1000;
// setInterval(function() {}, the_interval);

// fetchMedicData('hth-togo.app.medicmobile.org', 'admin', 'password');
// fetchMedicData('portal-integratehealth.org','medic','IntHea2004',port=444);

// var obj = {"Roles" : [
//     {"code": "cmm", "fullname": "commentator"},
//     {"code": "cmp", "fullname": "composer"},
//     ]}
//     var arr = ["cmm", "com", "cng"];
//     var mappedArray = obj["Roles"].filter(d => arr.includes(d.code))
//     console.log('Filtered Array', mappedArray)
//     console.log('Result', mappedArray.map(({fullname}) => fullname))

// let result1 = obj["Roles"].filter(function(item) { return arr.includes(item.code)}).map(filteredObj => filteredObj.fullname);


