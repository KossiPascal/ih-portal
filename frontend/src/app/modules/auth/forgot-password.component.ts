import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from '@ih-services/auth.service';
import { HttpClient } from "@angular/common/http";
import { Configs } from '@ih-app/models/User';
import { Functions } from '@ih-app/shared/functions';
import { ConfigService } from '@ih-app/services/config.service';
import { Consts } from '@ih-app/shared/constantes';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {
  authForm!: FormGroup;
  isLoginForm: boolean = true;
  message: string = 'Vous êtes déconnecté !';
  isLoading:boolean = false;
  LoadingMsg: string = "Loading...";
  showRegisterPage:boolean = false;

  APP_LOGO: string = Consts.APP_LOGO;

  constructor(private auth: AuthService, private router: Router, private http: HttpClient, private conf:ConfigService) { }

  ngOnInit(): void {
  }

}
