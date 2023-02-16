import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from '@ih-services/auth.service';
import { HttpClient } from "@angular/common/http";
import { Configs, User } from '@ih-app/models/User';
import { Functions } from '@ih-app/shared/functions';
import { ConfigService } from '@ih-app/services/config.service';
import { AppStorageService } from '@ih-app/services/cookie.service';


@Component({
  selector: 'app-login',
  templateUrl: './auth.component.html'
})
export class LoginComponent implements OnInit {
  authForm!: FormGroup;
  isLoginForm: boolean = true;
  message: any = 'Vous êtes déconnecté !';
  isLoading:boolean = false;
  LoadingMsg: string = "Loading...";
  showRegisterPage:boolean = false;

  constructor(private store:AppStorageService, private auth: AuthService, private router: Router, private http: HttpClient, private conf:ConfigService) { }

  ngOnInit(): void {
    this.getConfigs;
    this.auth.alreadyAuthenticate();
    this.authForm = this.createFormGroup();
  }

  getConfigs(){
    return this.conf.getConfigs()
    .subscribe((res: Configs) => {
      this.showRegisterPage = res.showRegisterPage ?? false;
    }, (err: any) => {
      this.showRegisterPage = false;
    });
  }

  setMessage(msg: string) {
      this.message = msg ? msg : 'Une Erreur est survenue';
    // this.message = this.auth.isLoggedIn$ ?
    // 'Vous êtes connecté.' : 'Identifiant ou mot de passe incorrect.';
  }


  // redirectTo: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  //   return ['topics', route.data.topics[0]];
  // }

  createFormGroup(): FormGroup {
    return new FormGroup({
      username: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(7),
      ]),
      agreeTermsOrRemenberMe: new FormControl(false, []),
    });
  }



  login(): any {
    if (!this.auth.isLoggedIn()) {
      this.isLoading = true;
      return this.auth.login(this.authForm.value.username, this.authForm.value.password)
        .subscribe((res: {status:number, data:User|string}) => {
          if (res.status === 200) {
            this.message = 'Login successfully !';
            this.store.set("user", JSON.stringify(res.data));
            const redirectUrl = Functions.getSavedUrl();
            // this.router.navigate([redirectUrl || this.auth.defaultRedirectUrl]);
            location.href = redirectUrl || this.auth.defaultRedirectUrl;
          } else {
            this.message = res.data;
            this.isLoading = false;
          }

        }, (err: any) => {
          this.isLoading = false;
          this.message = err;
          console.log(this.message);
        });
    } else {
      this.auth.alreadyAuthenticate();
    }
  }

  authenticate(): void {
    this.login();
  }

  passwordMatchError() {
    return false;
  }
}
