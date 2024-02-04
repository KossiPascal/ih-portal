import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { User } from "@ih-models/User";
import { CustomHttpHeaders, backenUrl, notNull, saveCurrentUrl } from "@ih-app/shared/functions";
import { GetRolesIdsOrNames, UserRoles } from "../models/Roles";
import { AppStorageService } from "./local-storage.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private objectStoreName: string = 'userData';

  constructor(private router: Router, private http: HttpClient, private store: AppStorageService) { }

  setUser(user: User): void {
    const uLogo = user.userLogo;
    user.userLogo = uLogo && uLogo != '' ? uLogo : 'assets/images/default_icon.png';
    this.store.set(this.objectStoreName, JSON.stringify(user), user.useLocalStorage);
  }

  currentUser(): User | null {
    try {
      return JSON.parse(this.store.get(this.objectStoreName)) || null;
    } catch (error) {
      return null;
    }
  }

  getToken(): string | null | undefined {
    return this.currentUser()?.token;
  }

  getExpiresIn(): number | null | undefined {
    return this.currentUser()?.expiresIn;
  }

  getUserId(): string | null | undefined {
    return this.currentUser()?.id;
  }

  getDefaultPage(): string | null | undefined {
    const user = this.currentUser();
    if (user) {
      const defaultPages = GetRolesIdsOrNames(user?.roles as UserRoles[], 'default_page');
      return defaultPages ? (defaultPages as string[])[0] : '';
    }
    return;
  }

  public isLoggedIn(): boolean {
    const expiresIn = this.currentUser()?.expiresIn;
    return expiresIn ? Date.now() < expiresIn : false;
  }

  getAllUsers(): any {
    const userId = this.getUserId();
    const sendParams = { userId: userId, dhisusername: undefined, dhispassword: undefined };
    return this.http.post(`${backenUrl()}/auth-user/users-list`, sendParams, CustomHttpHeaders(this.store));
  }

  getUserBy(id: string): any {
    const userId = this.getUserId();
    const sendParams = { userId: userId, dhisusername: undefined, dhispassword: undefined };
    return this.http.post(`${backenUrl()}/auth-user/${id}`, sendParams, CustomHttpHeaders(this.store));
  }

  updateUser(user: User): any {
    const userId = this.getUserId();
    user.dhisusername = undefined;
    user.dhispassword = undefined;
    const sendParams = { userId: userId, user: user };
    return this.http.post(`${backenUrl()}/auth-user/update-user`, sendParams, CustomHttpHeaders(this.store));
  }

  deleteUser(user: User): any {
    const userId = this.getUserId();
    user.dhisusername = undefined;
    user.dhispassword = undefined;
    const sendParams = { userId: userId, user: user };
    return this.http.post(`${backenUrl()}/auth-user/delete-user`, sendParams, CustomHttpHeaders(this.store));
  }

  public AlreadyLogin() {
    if (this.isLoggedIn()) {
      return this.GoToDefaultPage();
    }
  }

  public GoToDefaultPage() {
    const default_page = this.getDefaultPage();
    if (default_page && default_page!='') {
      // location.href = dpUrl;
      this.router.navigate([default_page]);
      return;
    }
    this.logout();
    return;
  }

  register(user: User, forceRegister: boolean = false): any {
    return this.http.post(`${backenUrl()}/auth-user/register`, user, CustomHttpHeaders(this.store));
  }

  login(params: { credential: string, password: string }): any {
    return this.http.post(`${backenUrl()}/auth-user/login`, params, CustomHttpHeaders(this.store));
  }

  NewUserToken(updateReload:boolean = false): any {
    const userId = this.getUserId();
    return this.http.post(`${backenUrl()}/auth-user/newToken`, { userId: userId, updateReload:updateReload, dhisusername: undefined, dhispassword: undefined }, CustomHttpHeaders(this.store));
  }

  CheckReloadUser(): any {
    const userId = this.getUserId();
    return this.http.post(`${backenUrl()}/auth-user/check-reload-user`, { userId: userId, dhisusername: undefined, dhispassword: undefined }, CustomHttpHeaders(this.store));
  }

  GetAllRoles(): any {
    return this.http.post(`${backenUrl()}/auth-user/roles-list`, CustomHttpHeaders(this.store));
  }

  CreateRole(params: UserRoles): any {
    return this.http.post(`${backenUrl()}/auth-user/create-role`, params, CustomHttpHeaders(this.store));
  }

  UpdateRole(params: UserRoles): any {
    return this.http.post(`${backenUrl()}/auth-user/update-role`, params, CustomHttpHeaders(this.store));
  }

  DeleteRole(params: UserRoles): any {
    return this.http.post(`${backenUrl()}/auth-user/delete-role`, params, CustomHttpHeaders(this.store));
  }

  UserActionsList(): any {
    return this.http.post(`${backenUrl()}/auth-user/actions-list`, CustomHttpHeaders(this.store));
  }

  UserPagesList(): any {
    return this.http.post(`${backenUrl()}/auth-user/pages-list`, CustomHttpHeaders(this.store));
  }

  logout() {
    saveCurrentUrl(this.router);
    this.store.delete(this.objectStoreName);
    localStorage.removeItem("IFrame");
    // location.href = 'auths/login';
    this.router.navigate(["auths/login"]);
  }

}
