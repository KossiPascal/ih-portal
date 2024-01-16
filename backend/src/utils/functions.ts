import path from "path";
import https from "https";
import http from "http";
import { CouchDbFetchData, Dhis2Sync, MailConfig, Roles } from "./appInterface";
import { token, User, jwSecretKey, getUserRepository } from "../entity/User";
import moment from "moment";
import { getSiteSyncRepository, Sites, getChwsSyncRepository, Chws, Patients } from "../entity/Sync";
import { Consts } from "./constantes";
import { JsonDatabase } from "../json-data-source";
var fs = require('fs');
var JFile = require('jfile'); //  "npm install jfile --save" required


export function logNginx(message: any) {
    try {
        let nxFile = new JFile('/var/log/nginx/access.log'); // check path before if exist in your system . IF no , change it with the available path
        nxFile.text += `\n${message}`; //append new line in nginx log file
    } catch (error) {

    }
}

const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
var rootCas = require('ssl-root-cas').create();

require('dotenv').config({ path: sslFolder('.ih-env') });
const { CHT_USER, CHT_PASS, CHT_HOST, PROD_CHT_PORT, DEV_CHT_PORT, NODE_TLS_REJECT_UNAUTHORIZED } = process.env;

export function httpHeaders(Authorization?: string, withParams: boolean = true) {
    // NODE_TLS_REJECT_UNAUTHORIZED = '0';
    var p: any = {
        'Authorization': Authorization ?? 'Basic ' + Buffer.from(`${CHT_USER}:${CHT_PASS}`).toString('base64'),
        "Accept": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "X-API-KEY, Origin, X-Requested-With, Content-Type, Accept,Access-Control-Request-Method, Authorization,Access-Control-Allow-Headers",
    }

    if (withParams) {
        p["Content-Type"] = "application/json";
        // 'Accept-Charset': 'UTF-8',
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Max-Age": "86400",
        // 'ca': [fs.readFileSync(path.dirname(__dirname)+'/ssl/server.pem', {encoding: 'utf-8'})]
        // 'Accept-Encoding': '*',
    }

    return p;
}

export class Functions {

    // const interval = setInterval(function() {}, 5000);
    // clearInterval(interval); // thanks @Luca D'Amico
    // var minutes = 5, the_interval = minutes * 60 * 1000;
    // setInterval(function() {}, the_interval);

    // set it in an HTTP Only + Secure Cookie
    // res.cookie("SESSIONID", token, { httpOnly: true, secure: true });

    // import * as fs from "fs";
    // const RSA_PRIVATE_KEY = fs.readFileSync('./demos/private.key');
    // const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {algorithm: 'RS256', expiresIn: 120,subject: userId}

    static previousMonth(monthId: string): string {
        let cMonth: number = parseInt(monthId, 10);
        if (cMonth === 1) return '12';
        cMonth--;
        return cMonth < 10 ? `0${cMonth}` : cMonth.toString();
    }

    static date_to_milisecond = (stringDate: string, start: boolean = true): string => {
        if (stringDate != "") {
            let dt = start ? " 00:00:00.000001" : " 23:59:59.999999";
            let date = new Date(`${stringDate}` + dt);
            return `${date.getTime()}`;
        }
        return stringDate;
    }

    static milisecond_to_date = (timestamp: string | number, type = 'fulldate'): string => {
        // console.log(timestamp); //1642664853302
        const date = new Date(timestamp);
        // console.log(date); //Thu Jan 20 2022 09:48:00

        // console.log(date.toString()); // "Thu Jan 20 2022 09:48:00"

        // Format date and time using different locales
        // console.log(date.toLocaleString('en-US')); // "1/20/2022, 9:50:15 AM"
        // console.log(date.toLocaleString('en-GB')); // "20/01/2022 09:50:15"
        // console.log(date.toLocaleString('sv')); // "2022-01-20 09:50:15"

        // Display only date
        // console.log(date.toLocaleDateString('en-US')); // "1/20/2022"

        // Display only time
        // console.log(date.toLocaleTimeString('en-US')); // "9:50:15 AM"
        if (type === 'dateOnly') return date.toLocaleString('sv').split(' ')[0].trim();

        return date.toLocaleString('sv');

    }

    static getValue(obj: any, keys: any): any {
        return obj[keys.pop()]
    }

    static renameKeyIfFoundInObject(obj: any, oldKey: string, newKey: string) {
        try {
            let allKeys = Object.keys(obj).includes(oldKey);
            if (allKeys) {
                obj[newKey] = obj[oldKey];
                delete obj[oldKey];
            }
        } catch (error) {

        }
        return obj;
    }

    static getKeyPath(parent: string, attributename: string) {
        return parent != '' ? parent + "." + attributename : attributename;
    }

    static listatts(parent: string, currentJson: any) {
        var attList: any[] = []
        currentJson = this.renameKeyIfFoundInObject(currentJson, 'length', '_length')
        if (typeof currentJson !== 'object' || currentJson == undefined || currentJson.length > 0) return;
        for (var attributename in currentJson) {
            const attrKey = this.getKeyPath(parent, attributename);
            if (Object.prototype.hasOwnProperty.call(currentJson, attributename)) {
                let childAtts = this.listatts(attrKey, currentJson[attributename])
                if (childAtts != undefined && childAtts.length > 0) {
                    attList = [...attList, ...childAtts]
                } else {
                    let keys = attrKey.split('.') as string[];
                    let val = this.getValue(currentJson, keys);
                    if (Array.isArray(val)) {
                        var list: any[] = []
                        val.forEach((element: any) => {
                            if (typeof element == 'string') {
                                list.push(`"${element}"`);
                            } else {
                                let childAtts2 = this.listatts(attrKey, element);
                                if (childAtts2 != undefined && childAtts2.length > 0) {
                                    attList = [...attList, ...childAtts2]
                                }
                            }
                        });
                        if (list.length > 0) attList.push(`"${attrKey}" : ["${list}"]`)
                    } else attList.push(`"${attrKey}" : "${val}"`)
                }
            }
        }
        return attList
    }

    static getJsonFieldsAsKeyValue(parent: string, currentJson: any) {
        const data = this.listatts(parent, currentJson);
        return JSON.parse(`{${data}}`.replace(/\n/g, '').replace(/\\n/g, '').trim().replace(/\s\s+/g, ' '));
    }

    static getHttpsOptions(data: any): Object {
        var options: Object = {
            host: data.host,
            port: data.port,
            path: data.path,
            url: data.url,
            rejectUnauthorized: data.use_SSL_verification === true,
            requestCert: data.use_SSL_verification === true,
            strictSSL: data.use_SSL_verification === true,
            agent: false,
            headers: httpHeaders('Basic ' + Buffer.from(data.user + ':' + data.pass).toString('base64')),
            ca: data.use_SSL_verification === true ? rootCas.addFile(`${sslFolder('server.pem')}`) : []
        }
        return options;
    }

    static normalizePort(val: any) {
        var port = parseInt(val, 10);
        if (isNaN(port)) return val;
        if (port >= 0) return port;
        return false;
    }

    static onError(error: any, port: any) {
        if (error.syscall !== 'listen') throw error;
        var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    static onListening(server: https.Server | http.Server, hostnames: any[], protocole: string = 'http') {
        var addr = server.address();
        var bind = typeof addr === 'string' ? addr : addr!.port;
        for (let i = 0; i < hostnames.length; i++) {
            console.log(`🚀 ${protocole.toLocaleUpperCase()} Server is available at ${protocole}://${hostnames[i]}:${bind}`);
            logNginx(`🚀 ${protocole.toLocaleUpperCase()} Server is available at ${protocole}://${hostnames[i]}:${bind}`);
        }
        console.log('\n');
        logNginx('\n');
    }

    static onProcess() {
        process.on('unhandledRejection', (error, promise) => {
            console.log('Alert! ERROR : ', error)
            logNginx(`Alert! ERROR : ${error}`);
        });
        process.on('uncaughtException', err => {
            console.error(err && err.stack);
            logNginx(`${err && err.stack}`)
        });
        process.on('ERR_HTTP_HEADERS_SENT', err => {
            console.error(err && err.stack);
            logNginx(`${err && err.stack}`)
        });
    }

    static ServerStart(data: {
        isSecure: boolean, credential?: {
            key: string;
            ca: string;
            cert: string;
        }, app: any, access_ports: boolean, port: any, hostnames: any[]
    }) {
        const server = data.isSecure == true ? https.createServer(data.credential!, data.app) : http.createServer(data.app);
        // var io = require('socket.io')(server, {});
        // server.listen(data.port, '0.0.0.0', () => Functions.onProcess)
        if (data.access_ports) server.listen(data.port, '0.0.0.0', () => Functions.onProcess);
        if (!data.access_ports) server.listen(data.port, data.hostnames[0], () => Functions.onProcess);
        server.on('error', (err) => Functions.onError(err, data.port));
        server.on('listening', () => Functions.onListening(server, data.hostnames, 'https'));
        server.on('connection', (stream) => console.log('someone connected!'));
    }

    static getIPAddress(accessAllAvailablePort: boolean = true): string[] {
        var ips: any[] = [];
        //   return require("ip").address();
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4') ips.push(alias.address);
                if (!accessAllAvailablePort && alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) return [alias.address];
                // if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) return alias.address;
            }
        }
        return ips.length > 0 ? ips : ['0.0.0.0'];
    }

    // static isDistDir(): boolean {
    //     return path.basename(path.dirname(path.dirname(__dirname))) === 'dist';
    // }


    // static appDirectory(): string {
    //     const rootdirname = path.dirname(path.dirname(__dirname));
    //     return path.basename(rootdirname) === 'dist' ? path.dirname(path.dirname(rootdirname)) : path.dirname(rootdirname);
    // }

    static appVersion() {
        return require('../../package.json').version;
    }

    public versionAsInt(version: string): number {
        const v = version.split('.');
        var res = '';
        for (let i = 0; i < v.length; i++) {
            const e = v[i];
            res += e
        }
        return parseInt(res);
    }

}

export function utilsFolder(): string {
    return __dirname; // utils
}
export function srcFolder(): string {
    return path.dirname(utilsFolder());//  src
}
export function backendFolder(): string {
    return path.dirname(srcFolder())//  backend
}
export function projectFolder(): string {
    return path.dirname(backendFolder())//  ih-portal
}
export function projectFolderParent(): string {
    return path.dirname(projectFolder())//  ih-portal parent
}
export function sslFolder(file_Name_with_extension: string): string {
    const dir = `${projectFolderParent()}/ssl`;
    createDirectories(dir, (e: any) => { });
    return `${dir}/${file_Name_with_extension}`;
    // return `${path.dirname(path.dirname(path.dirname(path.dirname(__dirname))))}/ssl/${file_Name_with_extension}`
}
export function extractFolder(file_Name_with_extension: string, withPythonFolder: boolean = false): string {
    const folder = withPythonFolder == true ? 'python' : Consts.isProdEnv ? 'prod' : 'dev';
    const dir = `${projectFolderParent()}/storage/extracts/${folder}`;
    createDirectories(dir, (e: any) => { });
    return `${dir}/${file_Name_with_extension}`;
}

export function JsonDbFolder(file_Name_without_extension: string, withPythonFolder: boolean = false): string {
    const fileName: string = file_Name_without_extension.trim().replace(' ', '-').split('.')[0];
    // return `${path.dirname(path.dirname(path.dirname(path.dirname(__dirname))))}/storage/Json/${folder}/${fileName}.json`
    const folder = withPythonFolder == true ? 'python' : Consts.isProdEnv ? 'prod' : 'dev';
    const dir = `${projectFolderParent()}/storage/Json/${folder}`;
    createDirectories(dir, (e: any) => { });
    return `${dir}/${fileName}.json`
}


export function createDirectories(path: string, cb: any) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true }, function (err: any) {
            if (err) {
                if (err.code == 'EEXIST') cb(null); // Ignore the error if the folder already exists
                else cb(err); // Something else went wrong
            } else cb(null); // Successfully created folder
        });
    } else {
        cb(null);
    }
}


export function patientAgeDetails(patient: Patients): {
    is_in_cible: boolean,
    is_child_in_cible: boolean,
    is_female_in_cible: boolean
    age_in_year: number | null,
    age_in_month: number | null,
    age_in_day: number | null,
} {
    const is_child_in_cible = DateUtils.isChildUnder5(patient.date_of_birth!);
    const is_female_in_cible = DateUtils.isFemaleInCible({ birth_date: patient.date_of_birth!, sex: patient.sex! });
    const is_in_cible = is_child_in_cible || is_female_in_cible;
    const age_in_year = DateUtils.getAgeInYear(patient.date_of_birth!);
    const age_in_month = DateUtils.getAgeInMonths(patient.date_of_birth!);
    const age_in_day = DateUtils.getAgeInDays(patient.date_of_birth!);

    return { is_in_cible: is_in_cible, is_child_in_cible: is_child_in_cible, is_female_in_cible: is_female_in_cible, age_in_year: age_in_year, age_in_month: age_in_month, age_in_day: age_in_day }

}

export function delay(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}



// #########################################################################################################################################



export class DateUtils {


    static getAgeInMilliseconds(birth_date?: string): Date | null {
        if (birth_date != null) {
            return new Date(Date.now() - (new Date(birth_date)).getTime());
        }
        return null;
    }

    static getAgeInYear(birth_date: string, withUtc: boolean = true): number | null {
        var ageInMs = DateUtils.getAgeInMilliseconds(birth_date);
        if (ageInMs != null) {
            const year = withUtc ? ageInMs.getUTCFullYear() : ageInMs.getFullYear();
            return Math.abs(year - 1970);
            // return Math.round(ageInMs.getTime() / (1000 * 60 * 60 * 24 *365));
        }
        return null;
    }

    static getAgeInMonths(birth_date: string, round: boolean = false): number | null {
        var ageInMs = DateUtils.getAgeInMilliseconds(birth_date);
        if (ageInMs != null) {
            const ageInMonth = ageInMs.getTime() / (1000 * 60 * 60 * 24 * 30);
            return round ? Math.round(ageInMonth) : ageInMonth;
        }
        return null;
    }
    static getAgeInDays(birth_date: string): number | null {
        var ageInMs = DateUtils.getAgeInMilliseconds(birth_date);
        if (ageInMs != null) {
            return ageInMs.getTime() / (1000 * 60 * 60 * 24);
        }
        return null;
    }

    static isChildUnder5(birth_date: string): boolean {
        var childAge = DateUtils.getAgeInMonths(birth_date);
        if (childAge != null) {
            return childAge < 60;
        }
        return false;
    }

    static isFemaleInCible(data: { birth_date: string, sex: string }) {
        const year = DateUtils.getAgeInYear(data.birth_date!);
        if (year != null) return year >= 5 && year < 60 && data.sex == 'F';
        return false;
    }

    static isInCible(data: { birth_date: string, sex: string }): boolean {
        return DateUtils.isChildUnder5(data.birth_date) || DateUtils.isFemaleInCible(data);
    }






    static isGreater(d1: any, d2: any): boolean {
        try {
            let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
            let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
            if (date1 > date2) return true;
        } catch (error) {

        }
        return false;
    }
    static isGreaterOrEqual(d1: any, d2: any): boolean {
        try {
            let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
            let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
            if (date1 >= date2) return true;
        } catch (error) {

        }
        return false;
    }

    static isLess(d1: any, d2: any): boolean {
        try {
            let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
            let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
            if (date1 < date2) return true;
        } catch (error) {

        }
        return false;
    }

    static isLessOrEqual(d1: any, d2: any): boolean {
        try {
            let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
            let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
            if (date1 <= date2) return true;
        } catch (error) {

        }
        return false;
    }

    static isEqual(d1: any, d2: any): boolean {
        try {
            let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
            let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
            if (date1 == date2) return true;
        } catch (error) {

        }
        return false;
    }

    static isBetween(start: string, dateToCompare: string, end: string): boolean {
        if (DateUtils.isGreaterOrEqual(dateToCompare, start) && DateUtils.isLessOrEqual(dateToCompare, end)) return true;
        return false;
    }

    static getDateInFormat(dateObj: any, day: number = 0, format: string = `en`, withHour: boolean = false): string {
        var now: Date = dateObj instanceof Date ? dateObj : new Date(dateObj);

        var m = String(now.getMonth() + 1).padStart(2, '0');
        var d = String(day !== 0 ? day : now.getDate()).padStart(2, '0');
        var y = now.getFullYear();
        var h = now.getHours();
        var mm = String(now.getMinutes()).padStart(2, '0');
        var s = String(now.getSeconds()).padStart(2, '0');
        if (withHour === true) {
            if (format === `fr`) return `${d}/${m}/${y} ${h}:${mm}:${s}`;
            return `${y}-${m}-${d} ${h}:${mm}:${s}`;
        } else {
            if (format === `fr`) return `${d}/${m}/${y}`;
            return `${y}-${m}-${d}`;
        }
    }

    static previousDate(dateObj: any): Date {
        var now: Date = dateObj instanceof Date ? dateObj : new Date(dateObj);

        var y = now.getFullYear();
        var m = String(now.getMonth()).padStart(2, '0');
        var d = String(now.getDate()).padStart(2, '0');
        var h = String(now.getHours()).padStart(2, '0');
        var mm = String(now.getMinutes()).padStart(2, '0');
        var s = String(now.getSeconds()).padStart(2, '0');

        if (m == '00') {
            return new Date(`${y - 1}-12-${d} ${h}:${mm}:${s}`);
        } else {
            return new Date(`${y}-${m}-${d} ${h}:${mm}:${s}`);
        }

    }

    static startEnd21and20Date(): { start_date: string, end_date: string } {
        const now = new Date();

        var prev: string, end: string;
        if (now.getDate() < 21) {
            prev = DateUtils.getDateInFormat(DateUtils.previousDate(now), 21);
            end = DateUtils.getDateInFormat(now, 20);
        } else {
            prev = DateUtils.getDateInFormat(now, 21);
            end = DateUtils.getDateInFormat(now, parseInt(DateUtils.lastDayOfMonth(now)));
        }
        return { start_date: prev, end_date: end };
    }

    static lastDayOfMonth(dateObj: any): string {
        var date: Date = dateObj instanceof Date ? dateObj : new Date(dateObj);
        var d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return String(d.getDate()).padStart(2, '0');
    }


    static daysDiff(d1: any, d2: any): number {
        try {
            let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
            let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
            let difference = date1 - date2;
            let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
            return TotalDays < 0 ? -1 * TotalDays : TotalDays;
        } catch (error) {

        }
        return 0;
    }

    static isDayInDate(date: any, day: any): boolean {
        var d: string = String((date instanceof Date ? date : new Date(date)).getDate()).padStart(2, '0');

        return d == `${day}`;
    }

    static isBetween21and20(date: string): boolean {
        var betweenDate = DateUtils.startEnd21and20Date();
        return DateUtils.isGreaterOrEqual(date, betweenDate.start_date) && DateUtils.isLessOrEqual(date, betweenDate.end_date)
    }

    static getMondays(dateObj: any, format: string = `en`, withHour: boolean = false): string[] {
        var d = dateObj instanceof Date ? dateObj : new Date(dateObj);
        var month = d.getMonth();
        var mondays = [];
        d.setDate(1);
        // Get the first Monday in the month
        while (d.getDay() !== 1) {
            d.setDate(d.getDate() + 1);
        }
        // Get all the other Mondays in the month
        while (d.getMonth() === month) {
            const dt: Date = new Date(d.getTime());
            mondays.push(DateUtils.getDateInFormat(dt, 0, format, withHour));
            d.setDate(d.getDate() + 7);
        }
        return mondays;
    }
}

export function CouchDbFetchDataOptions(params: CouchDbFetchData,) {
    var dbCibleUrl = `/medic/_design/medic-client/_view/${params.viewName}`;
    if (dbCibleUrl[0] != '/') dbCibleUrl = `/${dbCibleUrl}`;
    if (dbCibleUrl[dbCibleUrl.length - 1] == '/') dbCibleUrl.slice(0, -1);

    var couchArg = ['include_docs=true', 'returnDocs=true', 'attachments=false', 'binary=false', 'reduce=false'];
    couchArg.push(`descending=${params.descending == true}`);
    if (notEmpty(params.startKey)) couchArg.push(`key=[${params.startKey}]`);
    if (notEmpty(params.endKey)) couchArg.push(`endkey=[${params.endKey}]`);
    const port = parseInt((Consts.isProdEnv ? PROD_CHT_PORT : DEV_CHT_PORT) ?? '443');
    var options = {
        host: CHT_HOST ?? '',
        port: port,
        path: `${dbCibleUrl}?${couchArg.join('&')}`,
        url: `${CHT_HOST}:${port}${dbCibleUrl}?${couchArg.join('&')}`,
        use_SSL_verification: true,
        user: CHT_USER ?? '',
        pass: CHT_PASS ?? '',
    };
    return Functions.getHttpsOptions(options);
}

// export class OldCouchDbSyncConfig {
//     constructor(sync: Sync, viewName: string) {
//         this.host = sync.medic_host;
//         user = sync.medic_username,
//             this.pass = sync.medic_password,
//             this.port = sync.port ?? 443,
//             this.dbCibleUrl = `/medic/_design/medic-client/_view/${viewName}`,
//             this.start_date = Functions.getkeysElements(viewName, sync.start_date),
//             this.end_date = Functions.getkeysElements(viewName, sync.end_date, false),
//             this.use_SSL_verification = sync.ssl_verification,
//             this.descending = false
//     }

//     host: string;
//     user: string;
//     pass: string;
//     port: number;
//     dbCibleUrl: string;
//     start_date: string;
//     end_date: string;
//     descending: boolean;
//     use_SSL_verification: boolean;

//     headerOptions(): Object {
//         const rootCas = require('ssl-root-cas').create();
//         let couchArg = ['include_docs=true', 'returnDocs=true', 'attachments=false', 'binary=false', 'reduce=false'];
//         if (this.descending == true) couchArg.push('descending=false');
//         if (this.start_date !== '' && this.start_date !== null && typeof this.start_date !== undefined) couchArg.push(`key=[${this.start_date}]`);
//         if (this.end_date !== '' && this.end_date !== null && typeof this.end_date !== undefined) couchArg.push(`endkey=[${this.end_date}]`);
//         if (this.dbCibleUrl[0] != '/') this.dbCibleUrl = `/${this.dbCibleUrl}`;
//         if (this.dbCibleUrl[this.dbCibleUrl.length - 1] == '/') this.dbCibleUrl.slice(0, -1);
//         var options = {
//             host: this.host,
//             port: this.port,
//             path: `${this.dbCibleUrl}?${couchArg.join('&')}`,
//             use_SSL_verification: this.use_SSL_verification,
//             user: user,
//             pass: this.pass
//         };
//         return Functions.getHttpsOptions(options);
//     }
// };

export function notEmpty(data: any): boolean {
    return data != '' && data != null && data != undefined && data.length != 0 && JSON.stringify(data) != JSON.stringify({}) && `${data}` != `{}`;
}


export class Dhis2SyncConfig {
    constructor(param: Dhis2Sync) {
        const host: string = param.host[param.host.length - 1] == '/' ? param.host.slice(0, -1) : param.host;
        const cibleName: string = param.cibleName.replace('/', '').replace('.json', '');
        var link: string = `/api/${cibleName}.json?paging=false`;
        if (param.program != null && param.program != '') link += `&program=${param.program}`;

        if (notEmpty(param.orgUnit)) link += `&orgUnit=${param.orgUnit}`;
        if (notEmpty(param.filter)) link += `&filter=${param.filter?.join('&filter=')}`;
        if (notEmpty(param.fields)) link += `&fields=${param.fields?.join(',')}`;

        link += `&order=created:${param.order ?? 'desc'}`;
        this.host = host;
        this.port = param.port ?? 443;
        this.dhisusersession = param.dhisusersession,
            this.url = 'https://' + host + link,
            this.cibleName = cibleName,
            this.headers = httpHeaders('Basic ' + this.dhisusersession)
    }
    url: string;
    host: string;
    port: number;
    dhisusersession: string;
    cibleName: string;
    headers: any;

    headerOptions(): any {
        var options = {
            url: this.url,
            cache: 'no-cache',
            mode: "cors",
            credentials: "include",
            referrerPolicy: 'no-referrer',
            headers: this.headers
        };
        return options;
    }

    fecthOptions(data?: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'): any {
        var option = {
            cache: 'no-cache',
            mode: "cors",
            credentials: "include",
            referrerPolicy: 'no-referrer',
            method: method,
            body: notEmpty(data) ? JSON.stringify(data) : undefined,
            headers: this.headers
        };
        return option;
    }
}

export async function generateUserMapData(user: User, dhisusersession: string): Promise<User> {
    const role = UserRole(user);
    const _repoUser = await getUserRepository();
    const userFound = await _repoUser.findOneBy({ id: user.id });
    user.dhisusersession = dhisusersession;
    user.defaultRedirectUrl = DefaultPage(role);
    user.token = await token(user);
    const secret = await jwSecretKey({ user: user });
    user.expiresIn = JSON.stringify((moment().add(secret.expiredIn, 'seconds')).valueOf());
    if(userFound) {
        user.email = userFound.email;
        if(role.isReportViewer) user.meeting_report = userFound.meeting_report;
    }
    
    return user;
}

export function UserRole(user: User): Roles {
    var data:Roles = new Roles();
    const userRoles: string[] = user && notEmpty(user) ? user.roles : [];
    const userGroups: string[] = user && notEmpty(user) ? user.groups : [];

    if (notEmpty(userRoles)) {
        data.isSuperUser = userRoles.includes('yrB6vc5Ip3r');
        data.isUserManager = (userRoles.includes('kMykXLnMsfF'));
        data.isAdmin = (userRoles.includes('FJXxMdr1gIB'));
        data.isDataManager = (userRoles.includes('KWH2Gl2atF8'));
        data.isOnlySupervisorMentor = userRoles.includes('Vjhs5PHK4lb');
        data.isSupervisorMentor = data.isOnlySupervisorMentor || data.isDataManager;
        data.isChws = userRoles.includes('c3WyuK3ibsN') || notEmpty(userGroups) && userGroups.includes('enIOT8b8taV');
        data.isReportViewer = userRoles.includes('xpG5HJa5Fmf') || notEmpty(userGroups) && userGroups.includes('dtVEW0CoCPl');
    }
    return data;
}

export function DefaultPage(role: Roles): string {
    if (role.isChws) {
        return 'dashboards/dash2';
    } else if(role.isReportViewer){
        return 'meetings/reports';
    }
    return 'dashboards'
}





// export function generateAuthSuccessData(userFound:User): UserValue {
//     var user: UserValue = {
//         token: userFound.token(),
//         id: userFound.id,
//         username: userFound.username,
//         fullname: userFound.fullname,
//         roles: ConversionUtils.stringToBase64(userFound.roles),
//         isActive: userFound.isActive,
//         expiresIn: JSON.stringify((moment().add(Utils().expiredIn, 'seconds')).valueOf())
//       }
//       return user;
// }

export function mailService(data: MailConfig) {
    var mailTransporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587, //465,
        secure: false,
        requireTLS: false,
        auth: {
            user: data.admin.from,
            pass: data.admin.pass
        }
    }));

    // setting credentials
    let mailDetails = {
        from: data.admin.from,
        to: data.user.to,
        subject: data.user.subject,
        text: data.user.text,
    };

    // sending email
    mailTransporter.sendMail(mailDetails, function (err: any, data: any) {
        if (err) {
            console.log("error occurred", err.message);
        } else {
            console.log("---------------------");
            console.log("email sent successfully");
        }
    });
}


// function formatDataId(host: any, id: any, port: any): string {
//     const val = `${host}`.replace('.org', '').replace('.', '').replace('-', '').replace('/', '').trim();
//     return `${id}_${val}.${port}`;
// }

export async function getSiteByDhis2Uid(uid: string): Promise<string | undefined> {
    var res: string | undefined = undefined;
    try {
        const _repoSite = await getSiteSyncRepository();
        const site: Sites = await _repoSite.findOneByOrFail({ external_id: uid })
        return site.id;
    } catch (error) {

    }
    return res;
}

export async function getChwsByDhis2Uid(id: string): Promise<string | undefined> {
    var res: string | undefined = undefined;
    try {
        const _repoChws = await getChwsSyncRepository();
        const asc: Chws = await _repoChws.findOneByOrFail({ external_id: id })
        return asc.id;
    } catch (error) {

    }
    return res;
}

export function getValue(dataValues: { dataElement: string, value: any }[], elementId: string): string {
    for (let i = 0; i < dataValues.length; i++) {
        const data = dataValues[i];
        if (data.dataElement == elementId) {
            return data.value;
        }
    }
    return '';
}

export function getDataValuesAsMap(dataValues: { dataElement: string, value: any }[], excludeDataElement?: string[]) {
    var finalData: any = {};

    for (let i = 0; i < dataValues.length; i++) {
        const data = dataValues[i];
        if (notEmpty(excludeDataElement)) {
            if (!excludeDataElement!.includes(data.dataElement)) {
                finalData[data.dataElement] = data.value;
            }
        } else {
            finalData[data.dataElement] = data.value;
        }
    }
    return finalData;
}
// set it in an HTTP Only + Secure Cookie
// res.cookie("SESSIONID", token, { httpOnly: true, secure: true });


// import * as fs from "fs";
// const RSA_PRIVATE_KEY = fs.readFileSync('./demos/private.key');
// const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {algorithm: 'RS256', expiresIn: 120,subject: userId}