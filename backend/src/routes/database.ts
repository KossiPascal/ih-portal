import { deleteFromCouchDb, getChwDataToBeDeleteFromCouchDb, truncatePostgresMysqlJsonDatabase, updateUserFacilityIdAndContactPlace } from "../controllers/databaseUtils";
import { Middelware } from "../middleware/auth";

const express = require('express');
const databaseRouter = express.Router();


databaseRouter.post('/postgres/truncate', Middelware.authMiddleware,truncatePostgresMysqlJsonDatabase);

databaseRouter.post('/couchdb/update_user_facility_contact_place', Middelware.authMiddleware,updateUserFacilityIdAndContactPlace);

databaseRouter.post('/couchdb/list_data_to_delete', Middelware.authMiddleware,getChwDataToBeDeleteFromCouchDb);

databaseRouter.post('/couchdb/detele_data', Middelware.authMiddleware,deleteFromCouchDb);



export = databaseRouter;


