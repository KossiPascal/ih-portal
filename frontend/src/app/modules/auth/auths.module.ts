import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthsRoutingModule } from './auths-routing.module';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './forgot-password.component';
import { LockScreenComponent } from './lockscreen.component';
import { RecoverPasswordComponent } from './recover-password.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthsRoutingModule
  ],
  declarations: [LoginComponent, RegisterComponent, LockScreenComponent, RecoverPasswordComponent, ForgotPasswordComponent]
})
export class AuthsModule { }

