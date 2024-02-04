import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthsRoutingModule } from './auths-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockScreenComponent } from './lockscreen/lockscreen.component';
import { CacheComponent } from './cache/cache.component';
import { ErrorComponent } from './error/error.component';
import { ChangePasswordComponent } from './change-password./change-password.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthsRoutingModule
  ],
  declarations: [LoginComponent, RegisterComponent, LockScreenComponent, ChangePasswordComponent, ForgotPasswordComponent, CacheComponent, ErrorComponent]
})
export class AuthsModule { }

