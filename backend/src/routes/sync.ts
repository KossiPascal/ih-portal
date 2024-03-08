import { getChwsDataWithParams, getDataInformations, deleteChwsData, updateDrugPerChw, updateDrugYearCmmPerChw, fetchIhChtDataPerChw, fetchIhDrugDataPerChw, fetchIhDrugDataPerSelected, SaveOrUpdateMeetingPerson, SaveOrUpdateMeetingTeam, FetchMeetingPersons, FetchMeetingTeams, SaveOrUpdateMeetingReports, FetchMeetingReports, DeleteMeetingReport, DeleteMeetingPerson, DeleteMeetingTeams } from "../controllers/dataFromDB";
import { getChws, getDistricts, getFamilies, getPatients, getSites, getZones } from "../controllers/orgUnitsFromDB ";
import { fetchChwsDataFromCouchDb, fetchChwsDataFromDhis2, fetchCouchDbUsersFromCouchDb, fetchOrgUnitsFromCouchDb, getChtUsersFromDb, getDhis2Chws, insertOrUpdateDataToDhis2 } from "../controllers/fetchFormCloud";
import { Middelware } from "../middleware/auth";
import { Request, Response } from "express";
import { DataIndicators } from "../entity/DataAggragate";
import { srcFolder } from "../utils/functions";
import { SyncAllCloudAppDataToDB } from "../controllers/auto_server_sync";

const fs = require("fs");

const express = require('express');
const { body } = require('express-validator');
const syncRouter = express.Router();

syncRouter.post(
  '/fetch/data',
  [
    // body('medic_host').trim().isLength({ min: 5 }).not().isEmpty(),
    // body('medic_username').trim().isLength({ min: 3 }).not().isEmpty(),
    // body('medic_password').trim().isLength({ min: 8 }).not().isEmpty(),
    body('start_date').trim().isDate().not().isEmpty(),
    body('end_date').trim().isDate().not().isEmpty()
  ],
  Middelware.authMiddleware,
  fetchChwsDataFromCouchDb
);

syncRouter.post('/get/data', Middelware.authMiddleware, getChwsDataWithParams);

syncRouter.post('/get/datainfos', Middelware.authMiddleware, getDataInformations);

syncRouter.post('/delete/data', Middelware.authMiddleware, deleteChwsData);

syncRouter.post('/update_drug_per_chw', Middelware.authMiddleware, updateDrugPerChw);

syncRouter.post('/update_drug_year_cmm_per_chw', Middelware.authMiddleware, updateDrugYearCmmPerChw);

syncRouter.post(
  '/fetch/all',
  [
    body('start_date').trim().isLength({ min: 7, max: 7 }).not().isEmpty(),
    body('end_date').trim().isLength({ min: 7, max: 7 }).not().isEmpty(),
  ],
  Middelware.authMiddleware, SyncAllCloudAppDataToDB);

syncRouter.post(
  '/dhis2/data',
  [
    body('fields').not().isEmpty(),
    body('filter').not().isEmpty(),
    body('orgUnit').not().isEmpty(),
  ],
  Middelware.authMiddleware, fetchChwsDataFromDhis2);

syncRouter.post(
  '/fetch/orgunits',
  // [
  //   body('medic_host').trim().isLength({ min: 5 }).not().isEmpty(),
  //   body('medic_username').trim().isLength({ min: 3 }).not().isEmpty(),
  //   body('medic_password').trim().isLength({ min: 8 }).not().isEmpty(),
  // ],
  Middelware.authMiddleware,
  fetchOrgUnitsFromCouchDb
);

syncRouter.post(
  '/ih_cht_data_per_chw',
  Middelware.authMiddleware,
  fetchIhChtDataPerChw
);

syncRouter.post(
  '/ih_drug_data_per_chw',
  Middelware.authMiddleware,
  fetchIhDrugDataPerChw
);

syncRouter.post(
  '/ih_drug_data_per_selected',
  Middelware.authMiddleware,
  fetchIhDrugDataPerSelected
);

syncRouter.post(
  '/flush_meeting_reports',
  Middelware.authMiddleware,
  SaveOrUpdateMeetingReports
);

syncRouter.post(
  '/get_meeting_reports',
  Middelware.authMiddleware,
  FetchMeetingReports
);

syncRouter.post(
  '/flush_meeting_person',
  Middelware.authMiddleware,
  SaveOrUpdateMeetingPerson
);

syncRouter.post(
  '/get_meeting_person',
  Middelware.authMiddleware,
  FetchMeetingPersons
);

syncRouter.post(
  '/flush_meeting_team',
  Middelware.authMiddleware,
  SaveOrUpdateMeetingTeam
);

syncRouter.post(
  '/get_meeting_team',
  Middelware.authMiddleware,
  FetchMeetingTeams
);

syncRouter.post(
  '/delete_meeting_report',
  Middelware.authMiddleware,
  DeleteMeetingReport
);

syncRouter.post(
  '/delete_meeting_person',
  Middelware.authMiddleware,
  DeleteMeetingPerson
);

syncRouter.post(
  '/delete_meeting_team',
  Middelware.authMiddleware,
  DeleteMeetingTeams
);


syncRouter.post('/save-couchdb-users', Middelware.authMiddleware, fetchCouchDbUsersFromCouchDb);
syncRouter.post('/get-cht-users', Middelware.authMiddleware, getChtUsersFromDb);


syncRouter.post('/dhis2/chws', Middelware.authMiddleware, getDhis2Chws);
syncRouter.post('/app/chws', Middelware.authMiddleware, getChws);
syncRouter.post('/districts', Middelware.authMiddleware, getDistricts);
syncRouter.post('/sites', Middelware.authMiddleware, getSites);
syncRouter.post('/zones', Middelware.authMiddleware, getZones);
syncRouter.post('/families', Middelware.authMiddleware, getFamilies);
syncRouter.post('/patients', Middelware.authMiddleware, getPatients);

syncRouter.post('/dhis2/insert_or_update', Middelware.authMiddleware, insertOrUpdateDataToDhis2);


syncRouter.post('/geojson', Middelware.authMiddleware, async (req: Request, res: Response) => {
  try {
    const geojsonFile = `${srcFolder()}/assets/aires_sanitaires.geo.json`;
    const jsonFile = `${srcFolder()}/assets/data.json`;

    let geojsondata = fs.readFileSync(geojsonFile);
    let jsondata = fs.readFileSync(jsonFile);
    return res.jsonp({ status: 200, map: JSON.parse(geojsondata), data: JSON.parse(jsondata) });
  } catch (error) {
    return res.jsonp({ status: 201 });
  }

});




export = syncRouter;
