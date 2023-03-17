import { JsonDbFolder } from "./utils/functions";
const JSONFileStorage = require('node-json-file-storage');
import path from "path";

// require('dotenv').config({ path: sslFolder('.env') });
require('dotenv').config({ path: `${path.dirname(path.dirname(path.dirname(__dirname)))}/ssl/.env` });
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = process.env

// const districts_uri = 
// const sites_uri = `${Functions.JsonDbFolder('sites')}`;
// const zones_uri = `${Functions.JsonDbFolder('zones')}`;
// const chws_uri = `${Functions.JsonDbFolder('chws')}`;

export class JsonDatabase {
    storage: any;

    constructor(file_Name: 'users' | 'districts' | 'sites' | 'zones' | 'chws' | 'families' | 'patients' | 'configs') {
        this.storage = new JSONFileStorage(`${JsonDbFolder(file_Name)}`);
    }

    //get from file
    get = (keys: string[]): any => this.storage.getBulk(keys);
    getBy = (key: string): any => this.storage.get(key);
    all = (): any => this.storage.all();

    // put to file 
    saveBulk = (objs: any[]) => this.storage.putBulk(objs);
    save = (obj: any) => this.storage.put(obj);

    //Remove from file
    remove = (keys: string[]): boolean => this.storage.removeBulk(keys);
    removeOne = (key: string): boolean => this.storage.remove(key);
    clear = (): boolean => this.storage.empty();


}


