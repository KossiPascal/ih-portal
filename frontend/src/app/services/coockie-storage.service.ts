import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  getCookie(name: string): string | null {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());

    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }

    return null;
  }

  setCookie(name: string, value: string, expires: number | Date): void {
    let cookieString = `${name}=${value}`;

    if (expires) {
      if (expires instanceof Date) {
        cookieString += `; expires=${expires.toUTCString()}`;
      } else {
        const expirationDate = new Date(Date.now() + expires * 1000); // expires in seconds
        cookieString += `; expires=${expirationDate.toUTCString()}`;
      }
    }

    document.cookie = cookieString;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}
