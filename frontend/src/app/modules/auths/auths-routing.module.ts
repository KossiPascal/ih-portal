import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockScreenComponent } from './lockscreen/lockscreen.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CacheComponent } from './cache/cache.component';
import { ErrorComponent } from './error/error.component';
import { LoginAccessGuard } from '@ih-src/app/guards/login-access-guard';
import { ChangePasswordComponent } from './change-password./change-password.component';
import { LogoutAccessGuard } from '@ih-src/app/guards/logout-access-guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent, data: {"title": "Login"}, canActivate:[LogoutAccessGuard] },
  { path: 'register', component: RegisterComponent, data: {title: 'Register'}, canActivate:[LogoutAccessGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, data: {title: 'Forgot Password'}, canActivate:[LogoutAccessGuard] },
  
  { path: 'lock-screen', component: LockScreenComponent, data: {title: 'Lock Screen'}, canActivate:[LoginAccessGuard] },
  { path: 'change-password', component: ChangePasswordComponent, data: {title: 'Recover Password'}, canActivate:[LoginAccessGuard] },
  { path: 'cache-list', component: CacheComponent, data: {title: 'Error'}, canActivate:[LoginAccessGuard]},
  { path: 'error', redirectTo: 'error/404', pathMatch: 'full'},
  { path: 'error/:code', component: ErrorComponent, data: {title: 'Error'}, canActivate:[LoginAccessGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthsRoutingModule { }