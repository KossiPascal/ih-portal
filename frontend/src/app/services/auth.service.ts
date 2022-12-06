import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { User, UserValueData } from "@ih-models/User";
import moment from "moment";
import { Functions } from "@ih-app/shared/functions";
import { BehaviorSubject, map, Observable } from "rxjs";
import { ConversionUtils } from 'turbocommons-ts';

Functions
@Injectable({
  providedIn: "root",
})
export class AuthService {

  public defaultRedirectUrl = 'dashboards';

  constructor(private router: Router, private http: HttpClient,) { 

  }

  public userValue(): UserValueData|null {
    if (Functions.isNotNull(localStorage.getItem('user'))) return JSON.parse(localStorage.getItem('user')??'');
    return null;
  }

  public tokenIsNotEmpty(): boolean {
    if (this.userValue()!=null) {
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

  private getRoles(): string[] {
    if (this.userValue()!=null) return ConversionUtils.base64ToString(this.userValue()?.roles) as any;
    return [];
  }

  public isSuperAdminn(): boolean {
    if (Functions.isNotNull(this.getRoles())) {
      return this.getRoles().includes('super_admin');
    }
    return false;
  }

  public canManageUser(): boolean {
    if (Functions.isNotNull(this.getRoles())) {
      // return this.getRoles().includes('super_admin');
      return this.getRoles().includes('can_manage_user');
    }
    return false;
  }

  public isAdmin(): boolean {
    if (Functions.isNotNull(this.getRoles())) {
      return this.getRoles().includes('admin') || this.getRoles().includes('super_admin');
    }
    return false;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }
  
  public clientSession(user: UserValueData) :void{
      localStorage.setItem("user", JSON.stringify(user));
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
      return this.http.post(`${Functions.backenUrl()}/user/${user.id}`, user, Functions.customHttpHeaders(this));
    } else {
      this.logout();
    }
  }

  deleteUser(id: string): any {
    if (this.isLoggedIn()) {
      return this.http.delete(`${Functions.backenUrl()}/user/${id}`, Functions.customHttpHeaders(this));
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
    if (!this.isLoggedIn() || this.canManageUser()) {
      return this.http.post(`${Functions.backenUrl()}/auth/register`, user, Functions.customHttpHeaders(this));
    } else {
      this.alreadyAuthenticate();
    }
  }

  login(credential: string, password: string): any {
    if (!this.isLoggedIn()) {
      return this.http.post(`${Functions.backenUrl()}/auth/login`, { credential, password }, Functions.customHttpHeaders(this));
        // .pipe(map((user) => {
          // // store user details and jwt token in local storage to keep user logged in between page refreshes
          // localStorage.setItem('user', JSON.stringify(user));
          // this.userSubject.next(user as User);
          // return user;
        // }));
    } else {
      this.alreadyAuthenticate();
    }
  }

  logout() {
    localStorage.removeItem("user");
    // this.router.navigate(["auths/login"]);
    location.href = 'auths/login';
  }







  getConfigs(): any {
    return this.http.get(`${Functions.backenUrl()}/configs`, Functions.customHttpHeaders(this));
  }
}
