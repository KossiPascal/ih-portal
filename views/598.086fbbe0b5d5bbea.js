"use strict";(self.webpackChunkih_portal=self.webpackChunkih_portal||[]).push([[598],{544:(W,f,l)=>{l.r(f),l.d(f,{AuthsModule:()=>B});var m=l(8692),a=l(4032),e=l(4537),c=l(7556),p=l(5732),d=l(946),s=l(92);let v=(()=>{class t{constructor(o,n,i,g){this.auth=o,this.router=n,this.http=i,this.conf=g,this.isLoginForm=!0,this.message="Vous \xeates d\xe9connect\xe9 !",this.isLoading=!1,this.LoadingMsg="Loading...",this.showRegisterPage=!1}ngOnInit(){}}return t.\u0275fac=function(o){return new(o||t)(e.Y36(c.e),e.Y36(a.F0),e.Y36(p.eN),e.Y36(d.E))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-forgot-password"]],decls:21,vars:0,consts:[[1,"login-page"],[1,"login-box"],[1,"card","card-outline","card-primary"],[1,"card-header","text-center"],["src","assets/logo/logo.png","alt","","srcset",""],[1,"card-body"],[1,"login-box-msg"],["action","recover-password.html","method","post"],[1,"input-group","mb-3"],["type","email","placeholder","Email",1,"form-control"],[1,"input-group-append"],[1,"input-group-text"],[1,"fas","fa-envelope"],[1,"row"],[1,"col-12"],["type","submit",1,"btn","btn-primary","btn-block"],[1,"mt-3","mb-1"],["routerLink","/auths/login"]],template:function(o,n){1&o&&(e.TgZ(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3),e._UZ(4,"img",4),e.qZA(),e.TgZ(5,"div",5)(6,"p",6),e._uU(7,"You forgot your password? Here you can easily retrieve a new password."),e.qZA(),e.TgZ(8,"form",7)(9,"div",8),e._UZ(10,"input",9),e.TgZ(11,"div",10)(12,"div",11),e._UZ(13,"span",12),e.qZA()()(),e.TgZ(14,"div",13)(15,"div",14)(16,"button",15),e._uU(17,"Request new password"),e.qZA()()()(),e.TgZ(18,"p",16)(19,"a",17),e._uU(20,"Login"),e.qZA()()()()()())},dependencies:[s._Y,s.JL,a.yS],encapsulation:2}),t})(),Z=(()=>{class t{constructor(o,n,i,g){this.auth=o,this.router=n,this.http=i,this.conf=g,this.isLoginForm=!0,this.message="Vous \xeates d\xe9connect\xe9 !",this.isLoading=!1,this.LoadingMsg="Loading...",this.showRegisterPage=!1}ngOnInit(){}}return t.\u0275fac=function(o){return new(o||t)(e.Y36(c.e),e.Y36(a.F0),e.Y36(p.eN),e.Y36(d.E))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-lockscreen"]],decls:21,vars:0,consts:[[1,"hold-transition","lockscreen","lockscreen-wrapper"],[1,"lockscreen-logo","card-header"],["height","70","src","assets/logo/logo.png","alt","","srcset",""],[1,"lockscreen-name"],[1,"lockscreen-item"],[1,"lockscreen-image"],["src","../../assets/img/user1-128x128.jpg","alt","User Image"],[1,"lockscreen-credentials"],[1,"input-group"],["type","password","placeholder","password",1,"form-control"],[1,"input-group-append"],["type","button",1,"btn"],[1,"fas","fa-arrow-right","text-muted"],[1,"help-block","text-center"],[1,"text-center"],["routerLink","/auths/login"],[1,"lockscreen-footer","text-center"]],template:function(o,n){1&o&&(e.TgZ(0,"div",0)(1,"div",1),e._UZ(2,"img",2),e.qZA(),e.TgZ(3,"div",3),e._uU(4,"John Doe"),e.qZA(),e.TgZ(5,"div",4)(6,"div",5),e._UZ(7,"img",6),e.qZA(),e.TgZ(8,"form",7)(9,"div",8),e._UZ(10,"input",9),e.TgZ(11,"div",10)(12,"button",11),e._UZ(13,"i",12),e.qZA()()()()(),e.TgZ(14,"div",13),e._uU(15," Enter your password to retrieve your session "),e.qZA(),e.TgZ(16,"div",14)(17,"a",15),e._uU(18,"Or sign in as a different user"),e.qZA()(),e.TgZ(19,"div",16),e._UZ(20,"br"),e.qZA()())},dependencies:[s._Y,s.JL,a.yS],encapsulation:2}),t})();var u=l(8629);function b(t,r){if(1&t&&(e.TgZ(0,"div",30),e._UZ(1,"i",31),e.TgZ(2,"div",32),e._uU(3),e.qZA()()),2&t){const o=e.oxw();e.xp6(3),e.Oqu(o.LoadingMsg)}}function _(t,r){1&t&&(e.TgZ(0,"div",10),e._UZ(1,"input",33),e.TgZ(2,"div",12)(3,"div",13),e._UZ(4,"span",14),e.qZA()()())}function T(t,r){1&t&&(e.TgZ(0,"div",10),e._UZ(1,"input",34),e.TgZ(2,"div",12)(3,"div",13),e._UZ(4,"span",35),e.qZA()()())}function w(t,r){1&t&&(e.TgZ(0,"div",10),e._UZ(1,"input",36),e.TgZ(2,"div",12)(3,"div",13),e._UZ(4,"span",17),e.qZA()()())}function L(t,r){1&t&&(e.TgZ(0,"div",37),e._uU(1," Password does not match "),e.qZA())}function y(t,r){1&t&&(e.TgZ(0,"label",38),e._uU(1,"Remember me"),e.qZA())}function U(t,r){1&t&&(e.TgZ(0,"label",38),e._uU(1,"I agree to the "),e.TgZ(2,"a",39),e._uU(3,"terms"),e.qZA()())}function I(t,r){if(1&t&&(e.TgZ(0,"button",40),e._uU(1,"logIn"),e.qZA()),2&t){const o=e.oxw();e.Q6J("disabled",!o.authForm.valid)}}function C(t,r){if(1&t&&(e.TgZ(0,"button",41),e._uU(1,"register"),e.qZA()),2&t){const o=e.oxw();e.Q6J("disabled",!o.authForm.valid)}}function x(t,r){1&t&&(e.TgZ(0,"a",42),e._uU(1,"I already have a membership"),e.qZA())}function A(t,r){1&t&&(e.TgZ(0,"a",43),e._uU(1,"Register a new membership"),e.qZA())}function F(t,r){1&t&&(e.TgZ(0,"p",44)(1,"a",45),e._uU(2,"I forgot my password"),e.qZA()())}let q=(()=>{class t{constructor(o,n,i,g){this.auth=o,this.router=n,this.http=i,this.conf=g,this.isLoginForm=!0,this.message="Vous \xeates d\xe9connect\xe9 !",this.isLoading=!1,this.LoadingMsg="Loading...",this.showRegisterPage=!1}ngOnInit(){this.auth.alreadyAuthenticate(),this.authForm=this.createFormGroup()}getConfigs(){return this.conf.getConfigs().subscribe(o=>{this.showRegisterPage=o.showRegisterPage??!1},o=>{this.showRegisterPage=!1})}setMessage(o){this.message=o||"Une Erreur est survenue"}createFormGroup(){return new s.cw({username:new s.NI("",[s.kI.required,s.kI.minLength(3)]),password:new s.NI("",[s.kI.required,s.kI.minLength(7)]),agreeTermsOrRemenberMe:new s.NI(!1,[])})}login(){if(!this.auth.isLoggedIn())return this.isLoading=!0,this.auth.login(this.authForm.value.username,this.authForm.value.password).subscribe(o=>{if(200===o.status){this.message="Login successfully !",console.log(this.message),this.auth.clientSession(o.data);const n=u.F.getSavedUrl();location.href=n||this.auth.defaultRedirectUrl}else this.message=o.data,this.isLoading=!1;console.log(o)},o=>{this.isLoading=!1,this.message=o.error,console.log(this.message)});this.auth.alreadyAuthenticate()}authenticate(){this.login()}passwordMatchError(){return!1}}return t.\u0275fac=function(o){return new(o||t)(e.Y36(c.e),e.Y36(a.F0),e.Y36(p.eN),e.Y36(d.E))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-login"]],decls:38,vars:14,consts:[[1,"login-page","register-page"],[1,"login-box","register-box"],[1,"card","card-outline","card-primary"],[1,"card-header","text-center"],["src","assets/logo/logo.png","alt","","srcset",""],[1,"card-body"],[1,"overlay-wrapper"],["class","overlay",4,"ngIf"],[1,"login-box-msg"],["novalidate","",1,"form-horizontal",3,"formGroup","ngSubmit"],[1,"input-group","mb-3"],["id","username","type","text","placeholder","Username","formControlName","username",1,"form-control"],[1,"input-group-append"],[1,"input-group-text"],[1,"fas","fa-user"],["class","input-group mb-3",4,"ngIf"],["id","password","type","password","placeholder","Password","formControlName","password",1,"form-control"],[1,"fas","fa-lock"],["class","btn btn-danger",4,"ngIf"],[1,"row"],[1,"col-8"],[1,"icheck-primary"],["type","checkbox","id","agreeTerms","name","terms","formControlName","agreeTermsOrRemenberMe"],["for","agreeTerms",4,"ngIf"],[1,"col-md-4"],["color","accent","type","submit","class","btn btn-primary btn-block",3,"disabled",4,"ngIf"],["color","accent","type","submit","class","btn btn-success btn-block",3,"disabled",4,"ngIf"],["routerLink","/auths/login","class","text-center",4,"ngIf"],["routerLink","/auths/register","class","text-center",4,"ngIf"],["class","mb-1",4,"ngIf"],[1,"overlay"],[1,"fas","fa-3x","fa-sync-alt","fa-spin"],[1,"text-bold","pt-2"],["id","fullname","type","text","placeholder","Full Name","formControlName","fullname",1,"form-control"],["id","email","type","email","placeholder","Email","formControlName","email",1,"form-control"],[1,"fas","fa-envelope"],["id","passwordConfirm","type","password","placeholder","Retype password","formControlName","passwordConfirm",1,"form-control"],[1,"btn","btn-danger"],["for","agreeTerms"],["href","#"],["color","accent","type","submit",1,"btn","btn-primary","btn-block",3,"disabled"],["color","accent","type","submit",1,"btn","btn-success","btn-block",3,"disabled"],["routerLink","/auths/login",1,"text-center"],["routerLink","/auths/register",1,"text-center"],[1,"mb-1"],["routerLink","/auths/forgot-password"]],template:function(o,n){1&o&&(e.TgZ(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3),e._UZ(4,"img",4),e.qZA(),e.TgZ(5,"div",5)(6,"div",6),e.YNc(7,b,4,1,"div",7),e.TgZ(8,"p",8)(9,"strong"),e._uU(10),e.qZA()(),e.TgZ(11,"form",9),e.NdJ("ngSubmit",function(){return n.authenticate()}),e.TgZ(12,"div",10),e._UZ(13,"input",11),e.TgZ(14,"div",12)(15,"div",13),e._UZ(16,"span",14),e.qZA()()(),e.YNc(17,_,5,0,"div",15),e.YNc(18,T,5,0,"div",15),e.TgZ(19,"div",10),e._UZ(20,"input",16),e.TgZ(21,"div",12)(22,"div",13),e._UZ(23,"span",17),e.qZA()()(),e.YNc(24,w,5,0,"div",15),e.YNc(25,L,2,0,"div",18),e.TgZ(26,"div",19)(27,"div",20)(28,"div",21),e._UZ(29,"input",22),e.YNc(30,y,2,0,"label",23),e.YNc(31,U,4,0,"label",23),e.qZA()(),e.TgZ(32,"div",24),e.YNc(33,I,2,1,"button",25),e.YNc(34,C,2,1,"button",26),e.qZA()()(),e.YNc(35,x,2,0,"a",27),e.YNc(36,A,2,0,"a",28),e.YNc(37,F,3,0,"p",29),e.qZA()()()()()),2&o&&(e.xp6(7),e.Q6J("ngIf",n.isLoading),e.xp6(3),e.Oqu(n.message),e.xp6(1),e.Q6J("formGroup",n.authForm),e.xp6(6),e.Q6J("ngIf",!n.isLoginForm),e.xp6(1),e.Q6J("ngIf",!n.isLoginForm),e.xp6(6),e.Q6J("ngIf",!n.isLoginForm),e.xp6(1),e.Q6J("ngIf",n.passwordMatchError()),e.xp6(5),e.Q6J("ngIf",n.isLoginForm),e.xp6(1),e.Q6J("ngIf",!n.isLoginForm),e.xp6(2),e.Q6J("ngIf",n.isLoginForm),e.xp6(1),e.Q6J("ngIf",!n.isLoginForm),e.xp6(1),e.Q6J("ngIf",!n.isLoginForm),e.xp6(1),e.Q6J("ngIf",n.isLoginForm&&n.showRegisterPage),e.xp6(1),e.Q6J("ngIf",n.isLoginForm))},dependencies:[m.O5,s._Y,s.Fj,s.Wl,s.JJ,s.JL,s.sg,s.u,a.yS],styles:["label[_ngcontent-%COMP%] {\n        display: block;\n    }"]}),t})(),k=(()=>{class t{constructor(o,n,i,g){this.auth=o,this.router=n,this.http=i,this.conf=g,this.isLoginForm=!0,this.message="Vous \xeates d\xe9connect\xe9 !",this.isLoading=!1,this.LoadingMsg="Loading...",this.showRegisterPage=!1}ngOnInit(){}}return t.\u0275fac=function(o){return new(o||t)(e.Y36(c.e),e.Y36(a.F0),e.Y36(p.eN),e.Y36(d.E))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-recover-password"]],decls:26,vars:0,consts:[[1,"login-page"],[1,"login-box"],[1,"card","card-outline","card-primary"],[1,"card-header","text-center"],["src","assets/logo/logo.png","alt","","srcset",""],[1,"card-body"],[1,"login-box-msg"],["action","login.html","method","post"],[1,"input-group","mb-3"],["type","password","placeholder","Password",1,"form-control"],[1,"input-group-append"],[1,"input-group-text"],[1,"fas","fa-lock"],["type","password","placeholder","Confirm Password",1,"form-control"],[1,"row"],[1,"col-12"],["type","submit",1,"btn","btn-primary","btn-block"],[1,"mt-3","mb-1"],["routerLink","/auths/login"]],template:function(o,n){1&o&&(e.TgZ(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3),e._UZ(4,"img",4),e.qZA(),e.TgZ(5,"div",5)(6,"p",6),e._uU(7,"You are only one step a way from your new password, recover your password now."),e.qZA(),e.TgZ(8,"form",7)(9,"div",8),e._UZ(10,"input",9),e.TgZ(11,"div",10)(12,"div",11),e._UZ(13,"span",12),e.qZA()()(),e.TgZ(14,"div",8),e._UZ(15,"input",13),e.TgZ(16,"div",10)(17,"div",11),e._UZ(18,"span",12),e.qZA()()(),e.TgZ(19,"div",14)(20,"div",15)(21,"button",16),e._uU(22,"Change password"),e.qZA()()()(),e.TgZ(23,"p",17)(24,"a",18),e._uU(25,"Login"),e.qZA()()()()()())},dependencies:[s._Y,s.JL,a.yS],encapsulation:2}),t})();var R=l(574);function N(t,r){if(1&t&&(e.TgZ(0,"div",30),e._UZ(1,"i",31),e.TgZ(2,"div",32),e._uU(3),e.qZA()()),2&t){const o=e.oxw();e.xp6(3),e.Oqu(o.LoadingMsg)}}function Y(t,r){1&t&&(e.TgZ(0,"div",10),e._UZ(1,"input",33),e.TgZ(2,"div",12)(3,"div",13),e._UZ(4,"span",14),e.qZA()()())}function J(t,r){1&t&&(e.TgZ(0,"div",10),e._UZ(1,"input",34),e.TgZ(2,"div",12)(3,"div",13),e._UZ(4,"span",35),e.qZA()()())}function P(t,r){1&t&&(e.TgZ(0,"div",10),e._UZ(1,"input",36),e.TgZ(2,"div",12)(3,"div",13),e._UZ(4,"span",17),e.qZA()()())}function M(t,r){1&t&&(e.TgZ(0,"div",37),e._uU(1," Password does not match "),e.qZA())}function Q(t,r){1&t&&(e.TgZ(0,"label",38),e._uU(1,"Remember me"),e.qZA())}function S(t,r){1&t&&(e.TgZ(0,"label",38),e._uU(1,"I agree to the "),e.TgZ(2,"a",39),e._uU(3,"terms"),e.qZA()())}function O(t,r){if(1&t&&(e.TgZ(0,"button",40),e._uU(1,"logIn"),e.qZA()),2&t){const o=e.oxw();e.Q6J("disabled",!o.authForm.valid)}}function E(t,r){if(1&t&&(e.TgZ(0,"button",41),e._uU(1,"register"),e.qZA()),2&t){const o=e.oxw();e.Q6J("disabled",!o.authForm.valid)}}function G(t,r){1&t&&(e.TgZ(0,"a",42),e._uU(1,"I already have a membership"),e.qZA())}function V(t,r){1&t&&(e.TgZ(0,"a",43),e._uU(1,"Register a new membership"),e.qZA())}function z(t,r){1&t&&(e.TgZ(0,"p",44)(1,"a",45),e._uU(2,"I forgot my password"),e.qZA()())}const X=[{path:"",redirectTo:"login",pathMatch:"full"},{path:"login",component:q,data:{title:"Login"}},{path:"register",component:(()=>{class t{constructor(o,n,i,g){this.auth=o,this.router=n,this.http=i,this.conf=g,this.isLoginForm=!1,this.message="Vous voulez vous enr\xe9gistrer",this.isLoading=!1,this.LoadingMsg="Loading...",this.showRegisterPage=!1}ngOnInit(){this.showRegisterPage=R.G.canManageUser()??!1,this.getConfigs(),this.showRegisterPage||this.auth.alreadyAuthenticate(),this.authForm=this.createFormGroup()}getConfigs(){if(!this.showRegisterPage)return this.conf.getConfigs().subscribe(o=>{if(!0!==o.showRegisterPage){const n=u.F.getSavedUrl();""!=n?location.href=n:this.router.navigate(["auths/login"]),console.log("you don't have permission !")}},o=>{const n=u.F.getSavedUrl();""!=n?location.href=n:this.router.navigate(["auths/login"]),console.log("you don't have permission !")})}createFormGroup(){return new s.cw({username:new s.NI("",[s.kI.required,s.kI.minLength(4)]),fullname:new s.NI("",[s.kI.required,s.kI.minLength(4)]),email:new s.NI("",[s.kI.required,s.kI.email]),password:new s.NI("",[s.kI.required,s.kI.minLength(8)]),passwordConfirm:new s.NI("",[s.kI.required,s.kI.minLength(8)]),agreeTermsOrRemenberMe:new s.NI(!1,[s.kI.required]),isActive:new s.NI(this.showRegisterPage)},[this.MatchValidator("password","passwordConfirm"),this.AcceptThermeValidator("agreeTermsOrRemenberMe")])}MatchValidator(o,n){return i=>{const g=i.get(o),h=i.get(n);return g&&h&&g.value!==h.value?{mismatch:!0}:null}}AcceptThermeValidator(o){return n=>{const i=n.get(o);return i&&!0!==i.value?{mismatch:!0}:null}}passwordMatchError(){return this.authForm.getError("password")&&this.authForm.get("passwordConfirm")?.touched}register(){if(!this.auth.isLoggedIn()||this.showRegisterPage)return this.isLoading=!0,this.auth.register(this.authForm.value).subscribe(o=>{if(200===o.status){this.message="Registed successfully !";const n=u.F.getSavedUrl();""!=n?location.href=n:this.router.navigate(["auths/login"])}else this.message=o.data;console.log(this.message),this.isLoading=!1},o=>{this.message=o.error,this.isLoading=!1,console.log(this.message)});this.auth.alreadyAuthenticate()}authenticate(){this.register()}}return t.\u0275fac=function(o){return new(o||t)(e.Y36(c.e),e.Y36(a.F0),e.Y36(p.eN),e.Y36(d.E))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-register"]],decls:38,vars:14,consts:[[1,"login-page","register-page"],[1,"login-box","register-box"],[1,"card","card-outline","card-primary"],[1,"card-header","text-center"],["src","assets/logo/logo.png","alt","","srcset",""],[1,"card-body"],[1,"overlay-wrapper"],["class","overlay",4,"ngIf"],[1,"login-box-msg"],["novalidate","",1,"form-horizontal",3,"formGroup","ngSubmit"],[1,"input-group","mb-3"],["id","username","type","text","placeholder","Username","formControlName","username",1,"form-control"],[1,"input-group-append"],[1,"input-group-text"],[1,"fas","fa-user"],["class","input-group mb-3",4,"ngIf"],["id","password","type","password","placeholder","Password","formControlName","password",1,"form-control"],[1,"fas","fa-lock"],["class","btn btn-danger",4,"ngIf"],[1,"row"],[1,"col-8"],[1,"icheck-primary"],["type","checkbox","id","agreeTerms","name","terms","formControlName","agreeTermsOrRemenberMe"],["for","agreeTerms",4,"ngIf"],[1,"col-md-4"],["color","accent","type","submit","class","btn btn-primary btn-block",3,"disabled",4,"ngIf"],["color","accent","type","submit","class","btn btn-success btn-block",3,"disabled",4,"ngIf"],["routerLink","/auths/login","class","text-center",4,"ngIf"],["routerLink","/auths/register","class","text-center",4,"ngIf"],["class","mb-1",4,"ngIf"],[1,"overlay"],[1,"fas","fa-3x","fa-sync-alt","fa-spin"],[1,"text-bold","pt-2"],["id","fullname","type","text","placeholder","Full Name","formControlName","fullname",1,"form-control"],["id","email","type","email","placeholder","Email","formControlName","email",1,"form-control"],[1,"fas","fa-envelope"],["id","passwordConfirm","type","password","placeholder","Retype password","formControlName","passwordConfirm",1,"form-control"],[1,"btn","btn-danger"],["for","agreeTerms"],["href","#"],["color","accent","type","submit",1,"btn","btn-primary","btn-block",3,"disabled"],["color","accent","type","submit",1,"btn","btn-success","btn-block",3,"disabled"],["routerLink","/auths/login",1,"text-center"],["routerLink","/auths/register",1,"text-center"],[1,"mb-1"],["routerLink","/auths/forgot-password"]],template:function(o,n){1&o&&(e.TgZ(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3),e._UZ(4,"img",4),e.qZA(),e.TgZ(5,"div",5)(6,"div",6),e.YNc(7,N,4,1,"div",7),e.TgZ(8,"p",8)(9,"strong"),e._uU(10),e.qZA()(),e.TgZ(11,"form",9),e.NdJ("ngSubmit",function(){return n.authenticate()}),e.TgZ(12,"div",10),e._UZ(13,"input",11),e.TgZ(14,"div",12)(15,"div",13),e._UZ(16,"span",14),e.qZA()()(),e.YNc(17,Y,5,0,"div",15),e.YNc(18,J,5,0,"div",15),e.TgZ(19,"div",10),e._UZ(20,"input",16),e.TgZ(21,"div",12)(22,"div",13),e._UZ(23,"span",17),e.qZA()()(),e.YNc(24,P,5,0,"div",15),e.YNc(25,M,2,0,"div",18),e.TgZ(26,"div",19)(27,"div",20)(28,"div",21),e._UZ(29,"input",22),e.YNc(30,Q,2,0,"label",23),e.YNc(31,S,4,0,"label",23),e.qZA()(),e.TgZ(32,"div",24),e.YNc(33,O,2,1,"button",25),e.YNc(34,E,2,1,"button",26),e.qZA()()(),e.YNc(35,G,2,0,"a",27),e.YNc(36,V,2,0,"a",28),e.YNc(37,z,3,0,"p",29),e.qZA()()()()()),2&o&&(e.xp6(7),e.Q6J("ngIf",n.isLoading),e.xp6(3),e.Oqu(n.message),e.xp6(1),e.Q6J("formGroup",n.authForm),e.xp6(6),e.Q6J("ngIf",!n.isLoginForm),e.xp6(1),e.Q6J("ngIf",!n.isLoginForm),e.xp6(6),e.Q6J("ngIf",!n.isLoginForm),e.xp6(1),e.Q6J("ngIf",n.passwordMatchError()),e.xp6(5),e.Q6J("ngIf",n.isLoginForm),e.xp6(1),e.Q6J("ngIf",!n.isLoginForm),e.xp6(2),e.Q6J("ngIf",n.isLoginForm),e.xp6(1),e.Q6J("ngIf",!n.isLoginForm),e.xp6(1),e.Q6J("ngIf",!n.isLoginForm),e.xp6(1),e.Q6J("ngIf",n.isLoginForm&&n.showRegisterPage),e.xp6(1),e.Q6J("ngIf",n.isLoginForm))},dependencies:[m.O5,s._Y,s.Fj,s.Wl,s.JJ,s.JL,s.sg,s.u,a.yS],styles:["label[_ngcontent-%COMP%] {\n        display: block;\n    }"]}),t})(),data:{title:"Register"}},{path:"lock-screen",component:Z,data:{title:"Lock Screen"}},{path:"recover-password",component:k,data:{title:"Recover Password"}},{path:"forgot-password",component:v,data:{title:"Forgot Password"}}];let j=(()=>{class t{}return t.\u0275fac=function(o){return new(o||t)},t.\u0275mod=e.oAB({type:t}),t.\u0275inj=e.cJS({imports:[a.Bz.forChild(X),a.Bz]}),t})(),B=(()=>{class t{}return t.\u0275fac=function(o){return new(o||t)},t.\u0275mod=e.oAB({type:t}),t.\u0275inj=e.cJS({imports:[m.ez,s.UX,j]}),t})()}}]);