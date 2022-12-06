import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Functions } from "@ih-app/shared/functions";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})

export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    Functions.saveCurrentUrl(this.router)
    // sessionStorage.setItem("redirect_url", state.url);
    if (!this.auth.isLoggedIn()) this.auth.logout();
    return this.auth.isLoggedIn();
  }

}