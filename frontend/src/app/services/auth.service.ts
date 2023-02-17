import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { User } from "@ih-models/User";
import moment from "moment";
import { Functions } from "@ih-app/shared/functions";
import { Roles } from "../shared/roles";
import { AppStorageService } from "./cookie.service";

Functions
@Injectable({
  providedIn: "root",
})
export class AuthService {

  constructor(private store:AppStorageService, private router: Router, private http: HttpClient) { }

  private roles = new Roles(this.store);

  public userValue(): User | null {
      try {
        if (Functions.notNull(this.store.get('user'))) {
          var userData: User = JSON.parse(this.store.get('user') ?? '');
          userData.userLogo = 'assets/images/default_icon.png';
          // if( typeof(your_variable) === 'string' ) { ... }
          return userData;
        };
      } catch (error) {
        
      }
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


  deleteUser(user: User): any {
    if (this.isLoggedIn()) {
      return this.http.post(`${Functions.backenUrl()}/user/delete`, user, Functions.customHttpHeaders(this));
    } else {
      this.logout();
    }
  }

  alreadyAuthenticate(redirecUrl?: string) {
    if (this.isLoggedIn()) {
      console.log(`You are already authenticated !`);
      // this.router.navigate([this.defaultRedirectUrl]);
      location.href = redirecUrl??this.userValue()?.defaultRedirectUrl!;
      // window.location.replace(document.referrer);
    }
  }

  // window.location.pathname

  register(user: User): any {
    if (!this.isLoggedIn() || this.roles.isSuperUser()) {
      return this.http.post(`${Functions.backenUrl()}/auth/register`, user, Functions.customHttpHeaders(this));
    } else {
      this.alreadyAuthenticate();
    }
  }

  login(username: string, password: string): any {
    if (!this.isLoggedIn()) {
      return this.http.post(`${Functions.backenUrl()}/auth/login`, { username: username, password: password }, Functions.customHttpHeaders(this));
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
