import { Injectable } from "@angular/core";
import { environment } from "@ih-environments/environment";
import {  } from "module";

@Injectable({
  providedIn: "root",
})
export class AppVersionService {
  
  constructor(){}

  currentVersion = environment.appVersion;

}
