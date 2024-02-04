import path from "path";
import https from "https";
import http from "http";
import { CouchDbFetchData, Dhis2Sync, MailConfig } from "./appInterface";
import { getSiteSyncRepository, Sites, getChwsSyncRepository, Chws, Patients } from "../entity/Sync";
import { Consts } from "./constantes";
import { getAgeInDays, getAgeInMonths, getAgeInYear, isChildUnder5, isFemaleInCible } from "./date-utils";
var fs = require('fs');
var JFile = require('jfile'); 
//  "npm install jfile --save" required


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

export function httpHeaders(Username?: string, Password?: string, WithParams: boolean = true) {
    // NODE_TLS_REJECT_UNAUTHORIZED = '0';
    var p: any = {
        'Authorization': 'Basic ' + Buffer.from(notEmpty(Username) && notEmpty(Password) ? `${Username}:${Password}` : `${CHT_USER}:${CHT_PASS}`).toString('base64'),
        "Accept": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "X-API-KEY, Origin, X-Requested-With, Content-Type, Accept,Access-Control-Request-Method, Authorization,Access-Control-Allow-Headers",
    }
    if (WithParams) {
        p["Content-Type"] = "application/json";
        // 'Accept-Charset': 'UTF-8',
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Max-Age": "86400",
        // 'ca': [fs.readFileSync(path.dirname(__dirname)+'/ssl/server.pem', {encoding: 'utf-8'})]
        // 'Accept-Encoding': '*',
    }
    return p;
}


export function previousMonth(monthId: string): string {
    let cMonth: number = parseInt(monthId, 10);
    if (cMonth === 1) return '12';
    cMonth--;
    return cMonth < 10 ? `0${cMonth}` : cMonth.toString();
}

export function date_to_milisecond(stringDate: string, start: boolean = true): string {
    if (stringDate != "") {
        let dt = start ? " 00:00:00.000001" : " 23:59:59.999999";
        let date = new Date(`${stringDate}` + dt);
        return `${date.getTime()}`;
    }
    return stringDate;
}

export function milisecond_to_date(timestamp: string | number, type = 'fulldate'): string {
    const date = new Date(timestamp);
    if (type === 'dateOnly') return date.toLocaleString('sv').split(' ')[0].trim();
    return date.toLocaleString('sv');
}

export function renameKeyIfFoundInObject(obj: any, oldKey: string, newKey: string) {
    try {
        let allKeys = Object.keys(obj).includes(oldKey);
        if (allKeys) {
            obj[newKey] = obj[oldKey];
            delete obj[oldKey];
        }
    } catch (error) { }
    return obj;
}

export function getKeyPath(parent: string, attributename: string) {
    return parent != '' ? parent + "." + attributename : attributename;
}

export function listatts(parent: string, currentJson: any) {
    var attList: any[] = []
    currentJson = renameKeyIfFoundInObject(currentJson, 'length', '_length')
    if (typeof currentJson !== 'object' || currentJson == undefined || currentJson.length > 0) return;
    for (var attributename in currentJson) {
        const attrKey = getKeyPath(parent, attributename);
        if (Object.prototype.hasOwnProperty.call(currentJson, attributename)) {
            let childAtts = listatts(attrKey, currentJson[attributename])
            if (childAtts != undefined && childAtts.length > 0) {
                attList = [...attList, ...childAtts]
            } else {
                let keys = attrKey.split('.') as string[];
                let val = getObjectValue(currentJson, keys);
                if (Array.isArray(val)) {
                    var list: any[] = []
                    val.forEach((element: any) => {
                        if (typeof element == 'string') {
                            list.push(`"${element}"`);
                        } else {
                            let childAtts2 = listatts(attrKey, element);
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

export function getJsonFieldsAsKeyValue(parent: string, currentJson: any) {
    const data = listatts(parent, currentJson);
    return JSON.parse(`{${data}}`.replace(/\n/g, '').replace(/\\n/g, '').trim().replace(/\s\s+/g, ' '));
}

export function getHttpsOptions(data: any): Object {
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

export function normalizePort(val: any) {
    var port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}

export function onError(error: any, port: any) {
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

export function onListening(server: https.Server | http.Server, hostnames: any[], protocole: string = 'http') {
    var addr = server.address();
    var bind = typeof addr === 'string' ? addr : addr!.port;
    for (let i = 0; i < hostnames.length; i++) {
        console.log(`🚀 ${protocole.toLocaleUpperCase()} Server is available at ${protocole}://${hostnames[i]}:${bind}`);
        logNginx(`🚀 ${protocole.toLocaleUpperCase()} Server is available at ${protocole}://${hostnames[i]}:${bind}`);
    }
    console.log('\n');
    logNginx('\n');
}

export function onProcess() {
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

export function ServerStart(data: {
    isSecure: boolean, credential?: {
        key: string;
        ca: string;
        cert: string;
    }, app: any, access_ports: boolean, port: any, hostnames: any[]
}) {
    const server = data.isSecure == true ? https.createServer(data.credential!, data.app) : http.createServer(data.app);
    // var io = require('socket.io')(server, {});
    // server.listen(data.port, '0.0.0.0', () => onProcess)
    if (data.access_ports) server.listen(data.port, '0.0.0.0', () => onProcess);
    if (!data.access_ports) server.listen(data.port, data.hostnames[0], () => onProcess);
    server.on('error', (err) => onError(err, data.port));
    server.on('listening', () => onListening(server, data.hostnames, 'https'));
    server.on('connection', (stream) => console.log('someone connected!'));
}

export function getIPAddress(accessAllAvailablePort: boolean = true): string[] {
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

// export function isDistDir(): boolean {
//     return path.basename(path.dirname(path.dirname(__dirname))) === 'dist';
// }


// export function appDirectory(): string {
//     const rootdirname = path.dirname(path.dirname(__dirname));
//     return path.basename(rootdirname) === 'dist' ? path.dirname(path.dirname(rootdirname)) : path.dirname(rootdirname);
// }

export function appVersion() {
    return require('../../package.json').version;
}

export function versionAsInt(version: string): number {
    const v = version.split('.');
    var res = '';
    for (let i = 0; i < v.length; i++) {
        const e = v[i];
        res += e
    }
    return parseInt(res);
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
    const is_child_in_cible = isChildUnder5(patient.date_of_birth!);
    const is_female_in_cible = isFemaleInCible({ birth_date: patient.date_of_birth!, sex: patient.sex! });
    const is_in_cible = is_child_in_cible || is_female_in_cible;
    const age_in_year = getAgeInYear(patient.date_of_birth!);
    const age_in_month = getAgeInMonths(patient.date_of_birth!);
    const age_in_day = getAgeInDays(patient.date_of_birth!);

    return { is_in_cible: is_in_cible, is_child_in_cible: is_child_in_cible, is_female_in_cible: is_female_in_cible, age_in_year: age_in_year, age_in_month: age_in_month, age_in_day: age_in_day }

}

export function delay(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
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
    return getHttpsOptions(options);
}

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
        this.dhisusername = param.dhisusername;
        this.dhispassword = param.dhispassword;
        this.url = 'https://' + host + link;
        this.cibleName = cibleName;
        this.headers = httpHeaders(this.dhisusername, this.dhispassword)
    }
    url: string;
    host: string;
    port: number;
    dhisusername?: string
    dhispassword?: string
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


export function getObjectValue(obj: any, keys: any): any {
    return obj[keys.pop()]
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