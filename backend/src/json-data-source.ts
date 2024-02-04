import { JsonDbFolder } from "./utils/functions";
const JSONFileStorage = require('node-json-file-storage');

// const chws_uri = `${JsonDbFolder('chws')}`;

export class JsonDatabase {
    storage: any;
    constructor(file_Name: 'districts' | 'sites' | 'zones' | 'chws' | 'families' | 'patients' | 'configs' | 'syncs') {
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


