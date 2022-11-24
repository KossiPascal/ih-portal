import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { User } from "@ih-models/User";
import moment from "moment";
import { Functions } from "@ih-app/shared/functions";

Functions
@Injectable({
  providedIn: "root",
})
export class AuthService {

  public defaultRedirectUrl = 'dashboards';

  constructor(private router: Router, private http: HttpClient,) { }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public tokenIsNotEmpty(): boolean {
    const token = this.getToken();
    return token != null && token != undefined && token != "" && token.length > 0;
  }

  public isLoggedIn(): boolean {
    if (this.getExpiration()) {
      return moment().isBefore(this.getExpiration());
    }
    return false;
  }

  private getRoles(): string[] {
    let roles:any = sessionStorage.getItem("roles");
    return roles as string[];
  }

  public isSuperAdmin(): boolean {
    if (Functions.isNotNull(this.getRoles())) {
      return this.getRoles().includes('super_admin');
    }
    return false;
  }

  public isAdmin(): boolean {
    if (Functions.isNotNull(this.getRoles())) {
      return this.getRoles().includes('admin') || this.getRoles().includes('super_admin');
    }
    return false;
  }

  public userId(): string {
    const user = localStorage.getItem('user');
    if (!Functions.isNotNull(user)) this.logout();
    return `${localStorage.getItem('user')}`;
  }

  public userName(fullname=false): string {
    return `${localStorage.getItem(fullname ? "user_fullname" : "username")}`;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  private setSession(authResult: any) {
    const expiresAt = moment().add(authResult.expiresIn, 'seconds');
    // const expiresAt = moment(moment(), "DD-MM-YYYY hh:mm:ss").add(authResult.expiresIn, 'seconds');
    localStorage.setItem("token", authResult.token);
    localStorage.setItem("user", '' + authResult.userId);
    localStorage.setItem("username", '' + authResult.userName);
    localStorage.setItem("user_fullname", '' + authResult.userFullName);
    sessionStorage.setItem("token", authResult.token + authResult.userId);
    sessionStorage.setItem("roles", authResult.roles);
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
  }

  public setClientSession(authResult: any) {
    this.setSession(authResult);
  }

  getExpiration(): moment.Moment | null {
    const expiration = localStorage.getItem("expires_at");
    if (expiration) {
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt);
    }
    return null;
  }

  getAllUsers(): any {
    if (this.isLoggedIn()) {
      console.log(`${Functions.backenUrl()}/user/all`)
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

  alreadyAuthenticate(redirecUrl:string = this.defaultRedirectUrl) {
    if (this.isLoggedIn()) {
      console.log(`You are already authenticated !`);
      // this.router.navigate([this.defaultRedirectUrl]);
      location.href = redirecUrl;
      // window.location.replace(document.referrer);
    }
  }

  // window.location.pathname

  register(user: User): any {
    if (!this.isLoggedIn()) {
      return this.http.post(`${Functions.backenUrl()}/auth/register`, user, Functions.customHttpHeaders(this));
    } else {
      this.alreadyAuthenticate();
    }
  }

  login(credential: string, password: string): any {
    if (!this.isLoggedIn()) {
      return this.http.post(`${Functions.backenUrl()}/auth/login`, { credential, password }, Functions.customHttpHeaders(this))
    } else {
      this.alreadyAuthenticate();
    }
  }

  logout() {
    // sessionStorage.clear();
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("roles");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem("user_fullname");
    localStorage.removeItem("expires_at");
    // this.router.navigate(["auths/login"]);
    location.href = 'auths/login';
  }
}
  