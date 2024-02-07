import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { User } from "@ih-models/User";
import { CustomHttpHeaders, backenUrl, notNull, saveCurrentUrl } from "@ih-app/shared/functions";
import { GetRolesIdsOrNames, UserRoles } from "../models/Roles";
import { AppStorageService } from "./local-storage.service";
import { Chws } from "../models/Sync";

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

  ChwLogged(): Chws | null | undefined {
    try {
      return JSON.parse(this.store.get('chw_found')) || null;
    } catch (error) {
      return null;
    }
  }

  setChwLogged(chws: Chws): void {
    this.store.set('chw_found', JSON.stringify(chws), true);
  }

  getToken(): string | null | undefined {
    return this.currentUser()?.token;
  }

  getAppLoadToken(): string | null | undefined {
    return 'Kossi TSOLEGNAGBO';
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

  RolePagesActions(cible: 'roles' | 'pages' | 'actions'): string[] | null | undefined {
    const user = this.currentUser();
    if (user) {
      var data;
      if (cible == 'roles') data = GetRolesIdsOrNames(user?.roles as UserRoles[], 'idsString');
      if (cible == 'pages') data = GetRolesIdsOrNames(user?.roles as UserRoles[], 'pages');
      if (cible == 'actions') data = GetRolesIdsOrNames(user?.roles as UserRoles[], 'actions');
      if (data) {
        return data as string[];
      }
    }
    return;
  }


  public isLoggedIn(): boolean {
    const expiresIn = this.currentUser()?.expiresIn;
    return expiresIn ? Date.now() < expiresIn : false;
  }

  public AlreadyLogin() {
    if (this.isLoggedIn()) {
      return this.GoToDefaultPage();
    }
  }

  public GoToDefaultPage(forcelogout: boolean = false) {
    if (forcelogout) {
      this.logout();
      return;
    }
    const default_page = this.getDefaultPage();
    if (default_page && default_page != '') {
      // location.href = dpUrl;
      this.router.navigate([default_page]);
      return;
    }
    const roles = this.RolePagesActions('roles');
    if (roles && roles.length <= 0) {
      const msg = "Vous n'avez aucun role attribué, Contacter votre administrateur!";
      this.router.navigate([`auths/error/500/${msg}`]);
      return;
    }
    this.logout();
    return;
  }

  private ApiParams(params?: any, mustLoggedIn: boolean = true) {
    if (mustLoggedIn && !this.isLoggedIn()) {
      return this.logout();
    }
    const fparams: any = notNull(params) ? params : {};
    fparams['userId'] = this.getUserId();
    fparams['appLoadToken'] = this.getAppLoadToken();
    fparams['accessRoles'] = this.RolePagesActions('roles');
    fparams['accessPages'] = this.RolePagesActions('pages');
    fparams['accessActions'] = this.RolePagesActions('actions');
    fparams['dhisusername'] = undefined;
    fparams['dhispassword'] = undefined;
    return fparams;
  }

  getAllUsers(): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/auth-user/users-list`, fparams, CustomHttpHeaders(this.store));
  }

  getUserBy(id: string): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/auth-user/${id}`, fparams, CustomHttpHeaders(this.store));
  }

  updateUser(user: any): any {
    const fparams = this.ApiParams({ user: user });
    return this.http.post(`${backenUrl()}/auth-user/update-user`, fparams, CustomHttpHeaders(this.store));
  }

  updateMyPassword(user: { old_password: string, new_password: string }): any {
    const fparams = this.ApiParams({ user: user });
    return this.http.post(`${backenUrl()}/auth-user/update-user-password`, fparams, CustomHttpHeaders(this.store));
  }

  deleteUser(user: User, permanentDelete: boolean = false): any {
    const fparams = this.ApiParams({ user: user, permanentDelete: permanentDelete });
    return this.http.post(`${backenUrl()}/auth-user/delete-user`, fparams, CustomHttpHeaders(this.store));
  }

  register(user: User): any {
    const fparams = this.ApiParams({ user: user });
    return this.http.post(`${backenUrl()}/auth-user/register`, fparams, CustomHttpHeaders(this.store));
  }

  login(params: { credential: string, password: string }): any {
    const fparams = this.ApiParams(params, false);
    if (this.isLoggedIn()) {
      this.GoToDefaultPage();
    }
    return this.http.post(`${backenUrl()}/auth-user/login`, fparams, CustomHttpHeaders(this.store));
  }

  NewUserToken(updateReload: boolean = false): any {
    const fparams = this.ApiParams({ updateReload: updateReload });
    return this.http.post(`${backenUrl()}/auth-user/newToken`, fparams, CustomHttpHeaders(this.store));
  }

  CheckReloadUser(): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/auth-user/check-reload-user`, fparams, CustomHttpHeaders(this.store));
  }

  GetAllRoles(): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/auth-user/roles-list`, fparams, CustomHttpHeaders(this.store));
  }

  CreateRole(params: UserRoles): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/auth-user/create-role`, fparams, CustomHttpHeaders(this.store));
  }

  UpdateRole(params: UserRoles): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/auth-user/update-role`, fparams, CustomHttpHeaders(this.store));
  }

  DeleteRole(params: UserRoles): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/auth-user/delete-role`, fparams, CustomHttpHeaders(this.store));
  }

  UserActionsList(): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/auth-user/actions-list`, fparams, CustomHttpHeaders(this.store));
  }

  UserPagesList(): any {
    const fparams = this.ApiParams();
    return this.http.post(`${backenUrl()}/auth-user/pages-list`, fparams, CustomHttpHeaders(this.store));
  }

  ApiTokenAccessAction(params:{ action: string, id?: number, token?: string, isActive?: boolean }): any {
    const fparams = this.ApiParams(params);
    return this.http.post(`${backenUrl()}/auth-user/api-access-key`, fparams, CustomHttpHeaders(this.store));
  }

  

  logout() {
    saveCurrentUrl(this.router);
    this.store.delete(this.objectStoreName);
    this.store.delete('chw_found');
    this.store.delete('appVersion');
    this.store.delete('IFrame');
    // location.href = 'auths/login';
    this.router.navigate(["auths/login"]);
  }

}
