import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from '@ih-services/auth.service';
import { HttpClient } from "@angular/common/http";


@Component({
  selector: 'app-login',
  templateUrl: './auth.component.html'
})
export class LoginComponent implements OnInit {
  authForm!: FormGroup;
  isLoginForm: boolean = true;
  message: string = 'Vous êtes déconnecté !';
  isLoading:boolean = false;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.authService.alreadyAuthenticate();
    this.authForm = this.createFormGroup();
  }

  setMessage(msg: string) {
      this.message = msg ? msg : 'Une Erreur est survenue';
    // this.message = this.authService.isLoggedIn$ ?
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
    if (!this.authService.isLoggedIn()) {
      this.isLoading = true;
      return this.authService.login(this.authForm.value.username, this.authForm.value.password)
        .subscribe((res: any) => {
          this.authService.setClientSession(res);
          this.message = 'Login successfully !'
          console.log(`Login successfully !`);
          this.isLoading = false;
          const redirectUrl = sessionStorage.getItem("redirect_url");
          // this.router.navigate([redirectUrl || this.authService.defaultRedirectUrl]);
          location.href = redirectUrl || this.authService.defaultRedirectUrl;
          sessionStorage.removeItem("redirect_url");
        }, (err: any) => {
          this.isLoading = false;
          this.message = err.error;
          console.log(this.message);
        });
    } else {
      this.authService.alreadyAuthenticate();
    }
  }

  authenticate(): void {
    this.login();
  }

  passwordMatchError() {
    return false;
  }
}
