import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from '@ih-services/auth.service';
import { User } from '@ih-app/models/User';
import { getSavedUrl, notNull } from '@ih-app/shared/functions';
import { Roles } from '@ih-app/models/Roles';
import { Consts } from '@ih-app/shared/constantes';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  authForm!: FormGroup;
  message: any = '';
  isLoading: boolean = false;
  LoadingMsg: string = "Loading...";
  passwordType: 'password' | 'text' = 'password';
  showRegisterPage: boolean = true;


  APP_LOGO: string = Consts.APP_LOGO;


  constructor(private auth: AuthService, private router: Router) { }

  public roles = new Roles(this.auth);

  ngOnInit(): void {
    this.auth.AlreadyLogin();
    this.authForm = this.createFormGroup();
  }


  showHidePassword() {
    this.passwordType = this.passwordType == 'password' ? 'text' : 'password';
  }

  // setMessage(msg: string) {
  //     this.message = msg ? msg : 'Une Erreur est survenue';
  // }

  createFormGroup(): FormGroup {
    return new FormGroup({
      credential: new FormControl("ktsolegnagbo", [
        Validators.required,
        Validators.minLength(3),
      ]),
      password: new FormControl("PaKo@263", [
        Validators.required,
        Validators.minLength(7),
      ]),
      remenber_me: new FormControl(false, []),
    });
  }

  login(): any {
    if (!this.auth.isLoggedIn()) {
      this.isLoading = true;
      return this.auth.login({ credential: this.authForm.value.credential, password: this.authForm.value.password })
        .subscribe((res: { status: number, data: User | string }) => {
          if (res.status === 200) {
            this.message = 'Login successfully !';
            this.auth.setUser(res.data as User);
            var default_page = this.auth.getDefaultPage();
            if (!this.roles.isChws()) {
              const savedUrl = getSavedUrl();
              default_page = savedUrl && savedUrl != 'auths/login' && savedUrl != '' ? savedUrl : default_page;
              // location.href = default_page;
            }
            this.router.navigate([default_page]);
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
      this.auth.GoToDefaultPage();
    }
  }


  passwordMatchError() {
    return false;
  }
}
