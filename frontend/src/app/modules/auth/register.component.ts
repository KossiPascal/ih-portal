import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Configs } from "@ih-app/models/User";
import { Functions } from "@ih-app/shared/functions";
import { AuthService } from "@ih-services/auth.service";


@Component({
  selector: "app-register",
  templateUrl: "./auth.component.html",
})
export class RegisterComponent implements OnInit {
  authForm!: FormGroup;
  isLoginForm: boolean = false;
  message: string = 'Vous voulez vous enrégistrer';
  isLoading: boolean = false;
  LoadingMsg: string = "Loading...";
  showRegisterPage:boolean = false;

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.showRegisterPage = this.auth.canManageUser() ?? false;
    this.getConfigs();
    if (!this.showRegisterPage) {
      this.auth.alreadyAuthenticate();
    }
    this.authForm = this.createFormGroup();
  }

  getConfigs(){
    if (!this.showRegisterPage) {
      return this.auth.getConfigs()
      .subscribe((res: Configs) => {
        if (res.showRegisterPage !== true) {
          const redirectUrl = Functions.getSavedUrl();
          if (redirectUrl!='') {
            location.href = redirectUrl
          } else {
            this.router.navigate(["auths/login"]);
            // location.href = 'auths/login'
          }
          console.log(`you don't have permission !`);
        }
      }, (err: any) => {
          const redirectUrl = Functions.getSavedUrl();
          if (redirectUrl!='') {
            location.href = redirectUrl
          } else {
            this.router.navigate(["auths/login"]);
          }
          console.log(`you don't have permission !`);
      });
    }
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      username: new FormControl("", [Validators.required, Validators.minLength(4)]),
      fullname: new FormControl("", [Validators.required, Validators.minLength(4)]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(8)]),
      passwordConfirm: new FormControl("", [Validators.required, Validators.minLength(8)]),
      agreeTermsOrRemenberMe: new FormControl(false, [Validators.required]),
      isActive: new FormControl(this.showRegisterPage)
    }, [this.MatchValidator('password', 'passwordConfirm'), this.AcceptThermeValidator('agreeTermsOrRemenberMe')]);
  }


  MatchValidator(source: string, target: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const targetCtrl = control.get(target);
      return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value
        ? { mismatch: true }
        : null;
    };
  }

  AcceptThermeValidator(source: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      return sourceCtrl && sourceCtrl.value !== true
        ? { mismatch: true }
        : null;
    };
  }

  passwordMatchError() {
    return this.authForm.getError('password') && this.authForm.get('passwordConfirm')?.touched;
  }

  register(): any {
    if (!this.auth.isLoggedIn() || this.showRegisterPage) {
      this.isLoading = true;
      return this.auth.register(this.authForm.value)
        .subscribe((res: {status:number, data:any}) => {

          if (res.status === 200) {
            this.message = 'Registed successfully !'
            const redirectUrl = Functions.getSavedUrl();
            if (redirectUrl!='') {
              location.href = redirectUrl
            } else {
              this.router.navigate(["auths/login"]);
              // location.href = 'auths/login'
            }
          } else {
            this.message = res.data;
          }
          console.log(this.message);
          this.isLoading = false;
        }, (err: any) => {
          this.message = err.error;
          this.isLoading = false;
          console.log(this.message);
        });
      // console.log('Register User ' + JSON.stringify(user));
      // await custumRequest('post', this.http, this, `/auth/register`, user).then((res) => res).catch((err) => err);
    } else {
      this.auth.alreadyAuthenticate();
    }
  }

  authenticate(): void {
    this.register();
  }
}
