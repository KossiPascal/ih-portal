import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from '@ih-services/auth.service';
import { HttpClient } from "@angular/common/http";
import { Configs } from '@ih-app/models/User';
import { Functions } from '@ih-app/shared/functions';
import { ConfigService } from '@ih-app/services/config.service';


@Component({
  selector: 'app-lockscreen',
  templateUrl: './lockscreen.component.html'
})
export class LockScreenComponent implements OnInit {
  authForm!: FormGroup;
  isLoginForm: boolean = true;
  message: string = 'Vous êtes déconnecté !';
  isLoading:boolean = false;
  LoadingMsg: string = "Loading...";
  showRegisterPage:boolean = false;

  constructor(private auth: AuthService, private router: Router, private http: HttpClient, private conf:ConfigService) { }

  ngOnInit(): void {
  }

}
