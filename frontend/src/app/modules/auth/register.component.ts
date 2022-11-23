import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "@ih-services/auth.service";


@Component({
  selector: "app-register",
  templateUrl: "./auth.component.html",
})
export class RegisterComponent implements OnInit {
  authForm!: FormGroup;
  isLoginForm: boolean = false;
  message: string = 'Vous voulez vous enrégistrer';
  isLoading:boolean = false;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.authService.alreadyAuthenticate();
    this.authForm = this.createFormGroup();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      username: new FormControl("", [Validators.required, Validators.minLength(2)]),
      fullname: new FormControl("", [Validators.required, Validators.minLength(2)]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(7),
      ]),
      passwordConfirm: new FormControl("", [
        Validators.required,
        Validators.minLength(7),
        
      ]),
      agreeTermsOrRemenberMe: new FormControl(false, [
        Validators.required
      ]),

      
    },[this.MatchValidator('password', 'passwordConfirm'),this.AcceptThermeValidator('agreeTermsOrRemenberMe') ]);
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
    return (
      this.authForm.getError('password') &&this.authForm.get('passwordConfirm')?.touched
    );
  }



  register(): any {
    if (!this.authService.isLoggedIn()) {
      this.isLoading = true;
      return this.authService.register(this.authForm.value)
        .subscribe((res: any) => {
          this.message = 'Registed successfully !'
          console.log(`Registed successfully !`);
          this.isLoading = false;
          this.router.navigate(["auths/login"]);
          // location.href = 'auths/login'
          // console.log(val);
        }, (err: any) => {
          this.isLoading = false;
          this.message = err.error;
          console.log(this.message);
        });
      // console.log('Register User ' + JSON.stringify(user));
      // await custumRequest('post', this.http, this, `/auth/register`, user).then((res) => res).catch((err) => err);
    } else {
      this.authService.alreadyAuthenticate();
    }
  }

  authenticate(): void {
    this.register();
  }
}
