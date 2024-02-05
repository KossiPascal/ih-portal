import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { Patients } from "@ih-app/models/Sync";
import { AuthService } from "@ih-services/auth.service";
import { Consts } from "./constantes";
import { isChildUnder5, isFemaleInCible, getAgeInYear, getAgeInMonths, getAgeInDays } from "./dates-utils";
import { AppStorageService } from "../services/local-storage.service";
// import { envs } from '@ih-backendEnv/env';
// const httpOptions: { headers: HttpHeaders } = {headers: new HttpHeaders({ "Content-Type": "application/json" }),};

export function notNull(data: any): boolean {
  return data != '' && data != null && data != undefined && typeof data != undefined && data.length != 0; // && Object.keys(data).length != 0;
}


export async function Wait(time: number = 2000): Promise<void> {
  setTimeout(() => {

  }, time);
}

export function months(): { labelEN: string; labelFR: string; id: string; uid: number }[] {
  return [
    { labelEN: "January", labelFR: "Janvier", id: "01", uid: 1 },
    { labelEN: "February", labelFR: "Février", id: "02", uid: 2 },
    { labelEN: "March", labelFR: "Mars", id: "03", uid: 3 },
    { labelEN: "April", labelFR: "Avril", id: "04", uid: 4 },
    { labelEN: "May", labelFR: "Mai", id: "05", uid: 5 },
    { labelEN: "June", labelFR: "Juin", id: "06", uid: 6 },
    { labelEN: "July", labelFR: "Juillet", id: "07", uid: 7 },
    { labelEN: "August", labelFR: "Août", id: "08", uid: 8 },
    { labelEN: "September", labelFR: "Septembre", id: "09", uid: 9 },
    { labelEN: "October", labelFR: "Octobre", id: "10", uid: 10 },
    { labelEN: "November", labelFR: "Novembre", id: "11", uid: 11 },
    { labelEN: "December", labelFR: "Décembre", id: "12", uid: 12 },
  ];
}

export function monthByArg(arg: any): { labelEN: string; labelFR: string; id: string; uid: number } {
  for (let i = 0; i < months().length; i++) {
    const m = months()[i];
    if (arg == m.labelFR || arg == m.labelEN || arg == m.id || arg == m.uid) {
      return m;
    }
  }
  return { labelEN: '', labelFR: '', id: '', uid: 0 };
}

export function previousMonth(monthId: string): string {
  let cMonth: number = parseInt(monthId, 10);
  if (cMonth === 1) return '12';
  cMonth--;
  return cMonth < 10 ? `0${cMonth}` : cMonth.toString();
}


export function getMonthLabelById(id: string, lang: 'fr' | 'en' = 'fr'): string {
  for (var i = 0; i < months().length; i++) {
    var m = months()[i];
    if (m.id == id) return lang == 'fr' ? m.labelFR : m.labelEN;
  }
  return '';
}

export function getMonthIdByLabel(label: string): string {
  for (var i = 0; i < months().length; i++) {
    var m = months()[i];
    if (m.labelFR == label || m.labelEN == label) return m.id;
  }
  return '';
}

export function getYearsList(biginYear: number = 2022): number[] {
  var cYear: number = currentYear();
  if (biginYear == cYear) return [cYear];
  if (biginYear < cYear) {
    var ys: number[] = [];
    for (var i = 0; i <= cYear - biginYear; i++) {
      ys.push(cYear - i);
    }
    return ys.sort((a, b) => a - b);
  }
  return [biginYear]
}



export function currentYear(date?: string): number {
  try {
    const formattedDate = date ? formatDate(new Date(date)) : formatDate(new Date());
    return parseInt(formattedDate, 10);
  } catch (e) {
    return parseInt(formatDate(new Date()), 10);
  }
}

function formatDate(date: Date): string {
  return date.getFullYear().toString();
}

export function currentMonth(date?: string): { labelEN: string; labelFR: string; id: string; uid: number } {
  let month: number;
  try {
    month = date ? new Date(date).getMonth() + 1 : new Date().getMonth() + 1;
  } catch (e) {
    month = new Date().getMonth() + 1;
  }
  const mth = month < 10 ? `0${month}` : `${month}`;

  for (var i = 0; i < months().length; i++) {
    var m = months()[i];
    if (m.id == mth) return m;
  }
  return { labelEN: '', labelFR: '', id: '', uid: 0 };
}

export function currentMonthString(date?: string): string {
  let month: number;
  try {
    month = date ? new Date(date).getMonth() + 1 : new Date().getMonth() + 1;
  } catch (e) {
    month = new Date().getMonth() + 1;
  }

  const formattedMonth = month < 10 ? `0${month}` : `${month}`;
  return formattedMonth;
}


export function LatLonToMercator(lat: number, lon: number): { x: number, y: number } {
  var rMajor = 6378137; //Equatorial Radius, WGS84
  var shift = Math.PI * rMajor;
  var x = lon * shift / 180;
  var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  y = y * shift / 180;
  return { x: x, y: y };
}

export function getXYforLatLng(lat: number, lon: number, zoom?: number): { x: number, y: number } {
  //max zoom = 22 
  var zooom = notNull(zoom) ? zoom! : 22;
  var x = Math.floor((lon + 180) / 360 * Math.pow(2, zooom));
  var y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zooom));
  return { x: x, y: y };
}

export function MercatorToLatLon(x: number, y: number): { lat: number, lon: number } {

  var rMajor = 6378137; //Equatorial Radius, WGS84
  var shift = Math.PI * rMajor;
  var lon = x / shift * 180.0;
  var lat = y / shift * 180.0;
  lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0);

  return { lat: lat, lon: lon };
}

export function degrees2meters(lat: number, lon: number): { x: number, y: number } {
  var x = lon * 20037508.34 / 180;
  var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  y = y * 20037508.34 / 180;
  return { x: x, y: y };
}


export function meters2degress(x: number, y: number): { lat: number, lon: number } {
  var lon = x * 180 / 20037508.34;
  //thanks magichim @ github for the correction
  var lat = Math.atan(Math.exp(y * Math.PI / 20037508.34)) * 360 / Math.PI - 90;
  return { lat: lat, lon: lon };
}



export function convertLatLonToXY(data: { lat: number, lon: number, map_width?: number, map_height?: number }): { x: number, y: number } {

  var MAP_WIDTH = notNull(data.map_width) ? data.map_width! : 1000;
  var MAP_HEIGHT = notNull(data.map_height) ? data.map_height! : 446;

  var y = ((-1 * data.lat) + 90) * (MAP_HEIGHT / 180);
  var x = (data.lon + 180) * (MAP_WIDTH / 360);
  return { x: x, y: y };
}

export function range(size: number, startAt: number = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}

export function returnEmptyArrayIfNul(data: any): string[] {
  return notNull(data) ? data : [];
}

export function returnDataAsArray(data: any): string[] {
  return notNull(data) ? [data] : [];
}

export function convertToArray(data: any): string[] {
  return notNull(data) ? [data] : [];
}

export function saveCurrentUrl(router: Router): void {
  const link = router.url.split(backenUrl(''))[0];
  // const link = location.href;
  // const link = window.location.href;

  if (!link.includes('/error') && !link.includes('/login')) {
    sessionStorage.setItem("redirect_url", link);
    return;
  }
  sessionStorage.removeItem("redirect_url");
  return;
}

export function getSavedUrl(): string | null {
  const link = sessionStorage.getItem('redirect_url');
  sessionStorage.removeItem("redirect_url");
  return link;
}

export function loadCssScripts(dynamicCssScripts: string[]) {
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




export function capitaliseDataGiven(str: any, inputSeparator: string = ' ', outPutSeparator: string = ' '): string {
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

export function backenUrl(cible: string = 'api'): string {
  const portInfo = Consts.getPort();
  if (portInfo.isLocal == true) {
    return `${location.protocol}//${location.hostname}:${portInfo.port}/${cible}`;
  }
  return `${location.origin}/${cible}`;
  // return 'https://portal-integratehealth.org:9999/api'
}

export function custumRequest(method: string, http: HttpClient, store: AppStorageService, url: string, data?: any, responseType?: any) {
  const token = store.get('expiresIn');
  const result = http.request(method, url, {
    body: data,
    responseType: responseType || 'json',
    observe: 'body',
    headers: {
      Authorization: token && token!='' ? `Bearer ${token}` : '',
      "Content-Type": "application/json"
    }
  });

  return new Promise<any>((resolve, reject) => {
    result.subscribe(resolve, reject);
  });
}

export function CustomHttpHeaders(store: AppStorageService): { headers: HttpHeaders } {
  const token = store.get('expiresIn');
  return {
    headers: new HttpHeaders({
      Authorization: token && token!='' ? `Bearer ${token}` : ''
      // "Content-Type": "application/json" 
    }),
  };
}

export function isNumber(n: any): boolean {
  return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
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


