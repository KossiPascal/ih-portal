import { notEmpty } from "./functions";

export function changeMonthOfDate(dateObj: any, newMonth: any, asString: boolean = true): string | Date | undefined {
    try {
        var date: Date = dateObj instanceof Date ? dateObj : new Date(dateObj);
        const month = notEmpty(newMonth) ? parseInt(`${newMonth}`) : 0;
        if (month >= 1 && month <=12) {
            date.setUTCMonth(month - 1);
        }
        return asString ? date.toISOString().slice(0, 10) : date;;
    } catch (error) {
        return undefined;
    }
}


export function getAgeInMilliseconds(birth_date?: string): Date | null {
    if (birth_date != null) {
        return new Date(Date.now() - (new Date(birth_date)).getTime());
    }
    return null;
}

export function getAgeInYear(birth_date: string, withUtc: boolean = true): number | null {
    var ageInMs = getAgeInMilliseconds(birth_date);
    if (ageInMs != null) {
        const year = withUtc ? ageInMs.getUTCFullYear() : ageInMs.getFullYear();
        return Math.abs(year - 1970);
        // return Math.round(ageInMs.getTime() / (1000 * 60 * 60 * 24 *365));
    }
    return null;
}

export function getAgeInMonths(birth_date: string, round: boolean = false): number | null {
    var ageInMs = getAgeInMilliseconds(birth_date);
    if (ageInMs != null) {
        const ageInMonth = ageInMs.getTime() / (1000 * 60 * 60 * 24 * 30);
        return round ? Math.round(ageInMonth) : ageInMonth;
    }
    return null;
}
export function getAgeInDays(birth_date: string): number | null {
    var ageInMs = getAgeInMilliseconds(birth_date);
    if (ageInMs != null) {
        return ageInMs.getTime() / (1000 * 60 * 60 * 24);
    }
    return null;
}

export function isChildUnder5(birth_date: string): boolean {
    var childAge = getAgeInMonths(birth_date);
    if (childAge != null) {
        return childAge < 60;
    }
    return false;
}

export function isFemaleInCible(data: { birth_date: string, sex: string }) {
    const year = getAgeInYear(data.birth_date!);
    if (year != null) return year >= 5 && year < 60 && data.sex == 'F';
    return false;
}

export function isInCible(data: { birth_date: string, sex: string }): boolean {
    return isChildUnder5(data.birth_date) || isFemaleInCible(data);
}

export function isGreater(d1: any, d2: any): boolean {
    try {
        let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
        let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
        if (date1 > date2) return true;
    } catch (error) {

    }
    return false;
}
export function isGreaterOrEqual(d1: any, d2: any): boolean {
    try {
        let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
        let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
        if (date1 >= date2) return true;
    } catch (error) {

    }
    return false;
}

export function isLess(d1: any, d2: any): boolean {
    try {
        let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
        let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
        if (date1 < date2) return true;
    } catch (error) {

    }
    return false;
}

export function isLessOrEqual(d1: any, d2: any): boolean {
    try {
        let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
        let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
        if (date1 <= date2) return true;
    } catch (error) {

    }
    return false;
}

export function isEqual(d1: any, d2: any): boolean {
    try {
        let date1 = d1 instanceof Date ? d1.getTime() : new Date(d1).getTime();
        let date2 = d2 instanceof Date ? d2.getTime() : new Date(d2).getTime()
        if (date1 == date2) return true;
    } catch (error) {

    }
    return false;
}

export function isBetween(start: string, dateToCompare: string, end: string): boolean {
    if (isGreaterOrEqual(dateToCompare, start) && isLessOrEqual(dateToCompare, end)) return true;
    return false;
}

export function getDateInFormat(dateObj: any, day: number = 0, format: string = `en`, withHour: boolean = false): string {
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

export function previousDate(dateObj: any): Date {
    var now: Date = dateObj instanceof Date ? dateObj : new Date(dateObj);

    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0'); // Add 1 to get the correct month number
    var d = String(now.getDate()).padStart(2, '0');
    var h = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');

    if (m == '01') {
        return new Date(`${y - 1}-12-${d} ${h}:${mm}:${s}`);
    } else {
        return new Date(`${y}-${m}-${d} ${h}:${mm}:${s}`);
    }
}

export function startEnd21and20Date(): { start_date: string, end_date: string } {
    const now = new Date();

    var prev: string, end: string;
    if (now.getDate() < 21) {
        prev = getDateInFormat(previousDate(now), 21);
        end = getDateInFormat(now, 20);
    } else {
        prev = getDateInFormat(now, 21);
        end = getDateInFormat(now, parseInt(lastDayOfMonth(now)));
    }
    return { start_date: prev, end_date: end };
}

export function lastDayOfMonth(dateObj: any): string {
    var date: Date = dateObj instanceof Date ? dateObj : new Date(dateObj);
    var d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return String(d.getDate()).padStart(2, '0');
}


export function daysDiff(d1: any, d2: any): number {
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

export function isDayInDate(date: any, day: any): boolean {
    var d: string = String((date instanceof Date ? date : new Date(date)).getDate()).padStart(2, '0');

    return d == `${day}`;
}

export function isBetween21and20(date: string): boolean {
    var betweenDate = startEnd21and20Date();
    return isGreaterOrEqual(date, betweenDate.start_date) && isLessOrEqual(date, betweenDate.end_date)
}

export function YearMonthBetween21And20(dateObj: any): { year: number, month: string } {
    const now: Date = (dateObj instanceof Date) ? dateObj : (new Date(dateObj));

    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();

    const month = d >= 21 && d <= 31 ? (m == 12 ? 1 : m + 1) : m;
    const year = d >= 21 && d <= 31 ? (m == 12 ? y + 1 : y) : y;

    return { year: year, month: String(month).padStart(2, '0') }
}

export function GetPreviousDate(dateObj: any): string | undefined {
    try {
        if (notEmpty(dateObj)) {
            const now: Date = (dateObj instanceof Date) ? dateObj : (new Date(dateObj));
            const y = now.getFullYear();
            const m = now.getMonth() + 1;
            const d = now.getDate();
            const month = m == 1 ? 12 : m - 1;
            const year = m == 1 ? y - 1 : y
            return `${year}-${String(month).padStart(2, '0')}-${d}`;
        }
    } catch (error) { }
    return undefined;
}

export function GetPreviousYearMonth(year: number, month: string): { year: number, month: string } {
    const m: number = parseInt(month);
    return { year: m == 1 ? year - 1 : year, month: String((m == 1 ? 12 : m - 1)).padStart(2, '0') }
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

export function getMondays(dateObj: any, format: string = `en`, withHour: boolean = false): string[] {
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
        mondays.push(getDateInFormat(dt, 0, format, withHour));
        d.setDate(d.getDate() + 7);
    }
    return mondays;
}

export function getDateRange(d:{month:string, year:number, startDay?:number, endDay?:number}): { start_date: string, end_date: string } {
    let month = parseInt(d.month, 10);
    let startDay = d.startDay ?? 26;
    let endDay = d.endDay ?? 25;
    let startMonth, endMonth, startYear, endYear;
    if (month === 1) {
        startMonth = 11;
        endMonth = 0;
        startYear = d.year - 1;
        endYear = d.year;
    } else {
        startMonth = month - 2;
        endMonth = month -1;
        startYear = d.year;
        endYear = d.year;
    }
    let startDate = new Date(startYear, startMonth, startDay);
    let endDate = new Date(endYear, endMonth, endDay);

    return {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
    };
}
