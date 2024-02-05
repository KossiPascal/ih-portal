// Import necessary modules
import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Roles } from '../models/Roles';
import { AuthService } from '../services/auth.service';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root',
})
export class LoginAccessGuard implements CanActivate, OnDestroy {

    private destroy$ = new Subject<void>();
    private defaultTitle = 'Ih-portal';

    constructor(private titleService: Title, private activatedRoute: ActivatedRoute, private router: Router, private auth: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const roles = new Roles(this.auth);
        if (!this.auth.isLoggedIn()) {
            this.auth.logout();
            return false;
        }

        const value = route.data?.['title'] || this.defaultTitle;
        this.setRouteTitle(value);
        const requestedRoute = state.url.substring(1);

        if (!roles.pages().includes(requestedRoute)) {
            this.auth.GoToDefaultPage();
            return false;
        }
        return true;
    }

    setRouteTitle(title: string): void {
        this.titleService.setTitle(title);
    }

    subscribeToNavigationEnd(): void {
        this.router.events.pipe(
            takeUntil(this.destroy$),
            filter(event => event instanceof NavigationEnd),
            map(() => {
                const child = this.activatedRoute.firstChild;
                if (child && child.snapshot.data['title']) {
                    return child.snapshot.data['title'];
                }
                return this.defaultTitle;
            })
        ).subscribe((ttl: string) => {
            this.setRouteTitle(ttl);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
