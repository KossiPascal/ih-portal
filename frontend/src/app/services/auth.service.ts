import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { User } from "@ih-models/User";
import moment from "moment";
import { Functions } from "@ih-app/shared/functions";
import { ConversionUtils } from 'turbocommons-ts';
import { Roles } from "../shared/roles";

Functions
@Injectable({
  providedIn: "root",
})
export class AuthService {

  public defaultRedirectUrl = 'dashboards';

  constructor(private router: Router, private http: HttpClient) {

  }

  public userValue(): User | null {
    if (Functions.notNull(localStorage.getItem('user'))) {
      var userData: User = JSON.parse(localStorage.getItem('user') ?? '');

      userData.userLogo = 'assets/images/kossi.png';

      return userData;
    };
    return null;
  }

  public tokenIsNotEmpty(): boolean {
    if (this.userValue() != null) {
      const token = this.userValue()!.token;
      return token != null && token != undefined && token != "" && token.length > 0;
    }

    return false;
  }

  public isLoggedIn(): boolean {
    if (this.getExpiration()) {
      return moment().isBefore(this.getExpiration());
    }
    return false;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  public clientSession(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  appLogoPath() {
    return 'assets/logo/logo1.png';
  }

  getExpiration(): moment.Moment | null {
    if (this.userValue()) {
      const expiration = this.userValue()!.expiresIn;
      if (expiration) {
        const expiresAt = JSON.parse(expiration);
        return moment(expiresAt);
      }
    }
    return null;
  }

  getAllUsers(): any {
    if (this.isLoggedIn()) {
      return this.http.get(`${Functions.backenUrl()}/user/all`, Functions.customHttpHeaders(this));
    } else {
      this.logout();
    }
  }

  getUserBy(id: string): any {
    if (this.isLoggedIn()) {
      return this.http.get(`${Functions.backenUrl()}/user/${id}`, Functions.customHttpHeaders(this));
    } else {
      this.logout();
    }
  }

  updateUser(user: User): any {
    if (this.isLoggedIn()) {
      return this.http.post(`${Functions.backenUrl()}/user/update`, user, Functions.customHttpHeaders(this));
    } else {
      this.logout();
    }
  }



  // à supprimer
  updateUserFacilityIdAndContactPlace(data: any): any {
    return this.http.post(`${Functions.backenUrl()}/sync/updateUserFacilityIdAndContactPlace`, data, Functions.customHttpHeaders(this));
  }
  // à supprimer



  deleteUser(user: User): any {
    if (this.isLoggedIn()) {
      return this.http.post(`${Functions.backenUrl()}/user/delete`, user, Functions.customHttpHeaders(this));
    } else {
      this.logout();
    }
  }

  alreadyAuthenticate(redirecUrl: string = this.defaultRedirectUrl) {
    if (this.isLoggedIn()) {
      console.log(`You are already authenticated !`);
      // this.router.navigate([this.defaultRedirectUrl]);
      location.href = redirecUrl;
      // window.location.replace(document.referrer);
    }
  }

  // window.location.pathname

  register(user: User): any {
    if (!this.isLoggedIn() || Roles.isSuperAdmin()) {
      return this.http.post(`${Functions.backenUrl()}/auth/register`, user, Functions.customHttpHeaders(this));
    } else {
      this.alreadyAuthenticate();
    }
  }

  login(credential: string, password: string): any {
    if (!this.isLoggedIn()) {
      return this.http.post(`${Functions.backenUrl()}/auth/login`, { credential: credential, password: password }, Functions.customHttpHeaders(this));
      // .pipe(map((user) => {
      //   return user;
      // }));
    } else {
      this.alreadyAuthenticate();
    }
  }

  logout() {
    Functions.saveCurrentUrl(this.router);

    localStorage.removeItem("user");
    // this.router.navigate(["auths/login"]);
    location.href = 'auths/login';
  }

}
