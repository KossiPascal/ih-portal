import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthService } from "@ih-services/auth.service";
// import { envs } from '@ih-backendEnv/env';
// const httpOptions: { headers: HttpHeaders } = {headers: new HttpHeaders({ "Content-Type": "application/json" }),};


export class Functions {

  static returnEmptyArrayIfNul(data: any): string[] {
    return Functions.notNull(data) ? data : [];
  }

  static returnDataAsArray(data: any): string[] {
    return Functions.notNull(data) ? [data] : [];
  }

  static convertToArray(data: any): string[] {
    return Functions.notNull(data) ? [data] : [];
  }

  static saveCurrentUrl(router: Router):void{
    const link = router.url.split(Functions.backenUrl(''))[0];
    // const link = location.href;
    // const link = window.location.href;
      sessionStorage.setItem("redirect_url", link);
  }

  static getSavedUrl():string{
    const link = sessionStorage.getItem('redirect_url') ?? '';
    sessionStorage.removeItem("redirect_url");
    return link;
  }
 
  static loadCssScripts(dynamicCssScripts: string[]) {
    for (let i = 0; i < dynamicCssScripts.length; i++) {
      const src = dynamicCssScripts[i];
      const ext = src.slice(src.length - 3);

      if (ext === 'css') {
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.id = "theme";
        link.href = src;
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      if (ext === '.js') {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.async = true;
        script.charset = 'utf-8';
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    }
  }


  static notNull(data: any): boolean {
    return data != '' && data != null && data != undefined && typeof data != undefined && data.length != 0; // && Object.keys(data).length != 0;
  }

  static capitaliseDataGiven(str: any, inputSeparator: string = ' ', outPutSeparator: string = ' '): string {
    const arr = str.toString().split(inputSeparator);
    //loop through each element of the array and capitalize the first letter.
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    //Join all the elements of the array back into a string 
    //using a blankspace as a separator 
    const str2 = arr.join(" ");
    return str2;

  }

  static backenUrl(cible:string = 'api'): string {
    // const port = location.protocol === 'https:' ? envs.PORT_SECURED : envs.PORT;
    const port = location.protocol === 'https:' ? 9999 : 7777;

    return `${location.protocol}//${location.hostname}:${port}/${cible}`;
    // return environment.apiURL;

  }

  static custumRequest(method: string, http: HttpClient, auth: AuthService, url: string, data?: any, responseType?: any) {
    // console.log(`${baseUrl}/${url}`);
    // console.log('request ' + JSON.stringify(data));
    const result = http.request(method, url, {
      body: data,
      responseType: responseType || 'json',
      observe: 'body',
      headers: {
        Authorization: auth.userValue()!=null ? `Bearer ${auth.userValue()!.token}` : '',
        "Content-Type": "application/json"
      }
    });

    return new Promise<any>((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }


  static customHttpHeaders(auth: AuthService): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        Authorization: auth.userValue()!=null ? `Bearer ${auth.userValue()!.token}` : ''
        // "Content-Type": "application/json" 
      }),
    };
  }

  static isNumber(n:any):boolean { 
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n); 
  }
}





export class DateUtils {
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

  static lastDayOfMonth(dateObj: any):string{
    var date: Date = dateObj instanceof Date ? dateObj : new Date(dateObj);
    var d = new Date(date.getFullYear(), date.getMonth()+1, 0);
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
