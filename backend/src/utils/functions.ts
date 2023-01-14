import path from "path";
import https from "https";
import http from "http";
import { Dhis2Sync, MailConfig, Sync, UserValue } from "./appInterface";
import { Utils } from "./utils";
import * as jwt from 'jsonwebtoken';
import { User } from "../entity/User";
import { ConversionUtils } from "turbocommons-ts";
import moment from "moment";
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');

var rootCas = require('ssl-root-cas').create();


export class Functions {
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

    static getkeysElements(viewName: string, key: any, start: boolean = true) {
        if (viewName === 'reports_by_date') {
            return Functions.date_to_milisecond(key, start);
        } else {
            return key;
        }
    }

    static getHttpsOptions(data: any): Object {
        var options: Object = {
            host: data.host,
            port: data.port,
            path: data.path,
            rejectUnauthorized: data.use_SSL_verification === true,
            requestCert: data.use_SSL_verification === true,
            strictSSL: data.use_SSL_verification === true,
            agent: false,
            headers: {
                'Authorization': 'Basic ' + Buffer.from(data.user + ':' + data.pass).toString('base64'),
                'Content-Type': 'application/json',
                'Accept-Charset': 'UTF-8',
                'Accept': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PUT, POST, GET, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept",
                "Access-Control-Max-Age": "86400",
                // 'ca': [fs.readFileSync(path.dirname(__dirname)+'/ssl/server.pem', {encoding: 'utf-8'})]
            },
            ca: data.use_SSL_verification === true ? rootCas.addFile(`${this.sslFolder('server.pem')}`) : []
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
            console.log(`🚀 ${protocole.toLocaleUpperCase()} Server is available at ${protocole}://${hostnames[i]}:${bind}`)
        }
        console.log('\n');
    }

    static onProcess() {
        process.on('unhandledRejection', (error, promise) => console.log('Alert! ERROR : ', error));
        process.on('uncaughtException', err => console.error(err && err.stack));
        process.on('ERR_HTTP_HEADERS_SENT', err => console.error(err && err.stack));
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


    static utilsFolder(): string {
        return __dirname; // utils
    }
    static srcFolder(): string {
        return path.dirname(this.utilsFolder());//  src
    }
    static backendFolder(): string {
        return path.dirname(this.srcFolder())//  backend
    }
    static projectFolder(): string {
        return path.dirname(this.backendFolder())//  ih-portal
    }
    static projectFolderParent(): string {
        return path.dirname(this.projectFolder())//  ih-portal
    }
    static sslFolder(file_Name_with_extension: string): string {
        return `${this.projectFolderParent()}/ssl/${file_Name_with_extension}`
    }

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




export class CouchDbSyncConfig {

    constructor(sync: Sync, viewName: string) {
        this.host = sync.medic_host;
        this.user = sync.medic_username,
            this.pass = sync.medic_password,
            this.port = sync.port ?? 443,
            this.dbCibleUrl = `/medic/_design/medic-client/_view/${viewName}`,
            this.start_date = Functions.getkeysElements(viewName, sync.start_date),
            this.end_date = Functions.getkeysElements(viewName, sync.end_date, false),
            this.use_SSL_verification = sync.ssl_verification,
            this.descending = false
    }

    host: string;
    user: string;
    pass: string;
    port: number;
    dbCibleUrl: string;
    start_date: string;
    end_date: string;
    descending: boolean;
    use_SSL_verification: boolean;

    headerOptions(): Object {
        const rootCas = require('ssl-root-cas').create();
        let couchArg = ['include_docs=true', 'returnDocs=true', 'attachments=false', 'binary=false', 'reduce=false'];
        if (this.descending == true) couchArg.push('descending=false');
        if (this.start_date !== '' && this.start_date !== null && typeof this.start_date !== undefined) couchArg.push(`key=[${this.start_date}]`);
        if (this.end_date !== '' && this.end_date !== null && typeof this.end_date !== undefined) couchArg.push(`endkey=[${this.end_date}]`);
        if (this.dbCibleUrl[0] != '/') this.dbCibleUrl = `/${this.dbCibleUrl}`;
        if (this.dbCibleUrl[this.dbCibleUrl.length - 1] == '/') this.dbCibleUrl.slice(0, -1);
        var options = {
            host: this.host,
            port: this.port,
            path: `${this.dbCibleUrl}?${couchArg.join('&')}`,
            use_SSL_verification: this.use_SSL_verification,
            user: this.user,
            pass: this.pass
        };
        return Functions.getHttpsOptions(options);
    }
};


export function isNotNull(data: any): boolean {
    return data != '' && data != null && data != undefined && data.length != 0;
}



export class Dhis2SyncConfig {
    constructor(param: Dhis2Sync) {
        const host: string = param.host[param.host.length - 1] == '/' ? param.host.slice(0, -1) : param.host;
        const cibleName: string = param.cibleName.replace('/', '').replace('.json', '');
        var link: string = `/api/${cibleName}.json?paging=false`;
        if (param.program != null && param.program != '') link += `&program=${param.program}`;
        if (isNotNull(param.orgUnitFilter)) link += `&orgUnit=${param.orgUnitFilter}`;
        if (param.filter != null && param.filter.length != 0) link += `&filter=${param.filter.join('&filter=')}`;
        if (param.fields != null && param.fields.length != 0) link += `&fields=${param.fields.join(',')}`;

        const order: string = param.order ?? 'desc';
        link += `&order=created:${order}`;
        this.host = host;
        this.port = param.port ?? 443;
        this.user = param.username,
        this.pass = param.password,
        this.url = 'https://' + host + link,
        this.cibleName = cibleName,
        this.headers = {
            'Authorization': 'Basic ' + Buffer.from(this.user + ':' + this.pass).toString('base64'),
            "Accept": "application/json",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "DELETE, POST, GET, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "X-API-KEY, Origin, X-Requested-With, Content-Type, Accept,Access-Control-Request-Method, Authorization,Access-Control-Allow-Headers",
            "Content-Type": "application/json",
        }
    }
    url: string;
    host: string;
    port: number;
    user: string;
    pass: string;
    cibleName: string;
    headers:any;

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

    fecthOptions(data?:any, method:'GET'|'POST'|'PUT'|'DELETE' = 'GET'): any {
        var option = {
            cache: 'no-cache',
            mode: "cors",
            credentials: "include",
            referrerPolicy: 'no-referrer',
            method: method,
            body: isNotNull(data) ? JSON.stringify(data) : undefined,
            headers: this.headers
        };
        return option;
    }

}



export function genarateToken(data:{id:any, name:string, role:any, isActive:any}) {
    return jwt.sign({ id: `${data.id}`, name: data.name, role:`${data.role}`, isActive:`${data.isActive}`}, Utils().secretOrPrivateKey, { expiresIn: `${Utils().expiredIn}s` });
}

export function generateAuthSuccessData(userFound:User): UserValue {
    var user: UserValue = {
        token: userFound.token(),
        id: userFound.id,
        username: userFound.username,
        fullname: userFound.fullname,
        roles: ConversionUtils.stringToBase64(userFound.roles),
        isActive: userFound.isActive,
        expiresIn: JSON.stringify((moment().add(Utils().expiredIn, 'seconds')).valueOf())
      }
      return user;
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



// set it in an HTTP Only + Secure Cookie
// res.cookie("SESSIONID", token, { httpOnly: true, secure: true });


// import * as fs from "fs";
// const RSA_PRIVATE_KEY = fs.readFileSync('./demos/private.key');
// const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {algorithm: 'RS256', expiresIn: 120,subject: userId}