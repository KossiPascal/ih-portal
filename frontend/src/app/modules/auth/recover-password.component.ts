import { Component, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from '@ih-services/auth.service';
import { HttpClient } from "@angular/common/http";
import { ConfigService } from '@ih-app/services/config.service';
import { Consts } from '@ih-app/shared/constantes';


@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html'
})
export class RecoverPasswordComponent implements OnInit {
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
