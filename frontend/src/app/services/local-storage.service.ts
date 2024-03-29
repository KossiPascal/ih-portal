import { Injectable } from '@angular/core';


@Injectable({
    providedIn: "root",
})
export class AppStorageService {

    constructor() { }

    get = (name: string): string => {
        return sessionStorage.getItem(name) ?? localStorage.getItem(name) ?? '';
    }

    set = (name: string, value: string, useLocalStorage:boolean) => {
        if (useLocalStorage) {
            sessionStorage.removeItem(name);
            localStorage.setItem(name, value);
        }
        if (!useLocalStorage) {
            localStorage.removeItem(name);
            sessionStorage.setItem(name, value);
        }
    } 

    delete = (name: string) => {
        localStorage.removeItem(name);
        sessionStorage.removeItem(name);
    };

    deleteAll = () => {
        localStorage.clear();
        sessionStorage.clear();
    }

    // check = (name: string): boolean => this.cookieService.check(name);
    // get = (name: string): string => this.cookieService.get(name);
    // getAll = (): { [key: string]: string } => this.cookieService.getAll();
    // set(name: string, value: string, expires?: number | Date | undefined, path?: string | undefined, domain?: string | undefined, secure?: boolean | undefined, sameSite?: SameSite | undefined) {
    //     this.cookieService.set(name, value, expires, path, domain, secure, sameSite);
    // }
    // delete(name: string, path?: string | undefined, domain?: string | undefined, secure?: boolean | undefined, sameSite?: SameSite | undefined) {
    //     this.cookieService.delete(name, path, domain, secure, sameSite);
    // }
    // deleteAll(path?: string | undefined, domain?: string | undefined, secure?: boolean | undefined, sameSite?: SameSite | undefined) {
    //     this.cookieService.deleteAll(path, domain, secure, sameSite);
    // }
}