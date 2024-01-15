import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';
import { LockScreenComponent } from './lockscreen.component';
import { LoginComponent } from './login.component';
import { RecoverPasswordComponent } from './recover-password.component';
import { RegisterComponent } from './register.component';
import { SetMetaTags } from '@ih-app/services/set-meta-tags.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent, data: {"title": "Login"}, canActivate:[SetMetaTags] },
  // { path: 'register', component: RegisterComponent, data: {title: 'Register'}, canActivate:[SetMetaTags] },
  { path: 'lock-screen', component: LockScreenComponent, data: {title: 'Lock Screen'}, canActivate:[SetMetaTags] },
  // { path: 'recover-password', component: RecoverPasswordComponent, data: {title: 'Recover Password'}, canActivate:[SetMetaTags] },
  // { path: 'forgot-password', component: ForgotPasswordComponent, data: {title: 'Forgot Password'}, canActivate:[SetMetaTags] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthsRoutingModule { }
