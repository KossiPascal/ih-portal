import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthsRoutingModule } from './auths-routing.module';
import { LoginComponent } from './login.component';
import { RegisterRequestComponent } from './register-request.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthsRoutingModule
  ],
  declarations: [LoginComponent, RegisterRequestComponent]
})
export class AuthsModule { }

