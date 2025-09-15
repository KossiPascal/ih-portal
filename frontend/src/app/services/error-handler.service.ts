import { Injectable } from "@angular/core";

import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ErrorHandlerService {
  handleError<T>(operation = "operation", result?: T) {
    return (err: any): Observable<T> => {
      console.log(`${operation} failed: ${err?.message ?? err.toString()}`);
      return of(result as T);
    };
  }
}
