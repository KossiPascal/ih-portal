import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';
import { LockScreenComponent } from './lockscreen.component';
import { LoginComponent } from './login.component';
import { RecoverPasswordComponent } from './recover-password.component';
import { RegisterComponent } from './register.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent, data: {title: 'Login'} },
  // { path: 'register', component: RegisterComponent, data: {title: 'Register'} },
  { path: 'lock-screen', component: LockScreenComponent, data: {title: 'Lock Screen'} },
  // { path: 'recover-password', component: RecoverPasswordComponent, data: {title: 'Recover Password'} },
  // { path: 'forgot-password', component: ForgotPasswordComponent, data: {title: 'Forgot Password'} }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthsRoutingModule { }
