"use strict";(self.webpackChunkih_portal=self.webpackChunkih_portal||[]).push([[257],{3257:(q,m,r)=>{r.r(m),r.d(m,{ChwsManageModule:()=>y});var u=r(8692),g=r(3580),h=r(8239),o=r(92),c=r(8629),p=r(574),t=r(4537),f=r(1383),Z=r(3406),C=r(7556),v=r(1815);function w(n,a){if(1&n&&(t.TgZ(0,"div",43),t._UZ(1,"i",44),t.TgZ(2,"div",45),t._uU(3),t.qZA()()),2&n){const e=t.oxw();t.xp6(3),t.Oqu(e.LoadingMsg)}}function b(n,a){if(1&n&&(t.TgZ(0,"option",46),t._uU(1),t.qZA()),2&n){const e=a.$implicit;t.s9C("value",e.id),t.xp6(1),t.hij(" ",e.name," ")}}function T(n,a){if(1&n&&(t.TgZ(0,"option",46),t._uU(1),t.qZA()),2&n){const e=a.$implicit;t.s9C("value",e.id),t.xp6(1),t.hij(" ",e.name," ")}}function M(n,a){if(1&n){const e=t.EpF();t.TgZ(0,"tbody")(1,"tr",47),t.NdJ("click",function(){const l=t.CHM(e).$implicit,d=t.oxw();return t.KtG(d.EditChwsZone(l))}),t.TgZ(2,"td"),t._uU(3),t.qZA(),t.TgZ(4,"td"),t._uU(5),t.qZA()()()}if(2&n){const e=a.$implicit;t.xp6(3),t.Oqu(e.name),t.xp6(2),t.Oqu(e.zone.name)}}function A(n,a){if(1&n&&(t.TgZ(0,"div",43),t._UZ(1,"i",44),t.TgZ(2,"div",45),t._uU(3),t.qZA()()),2&n){const e=t.oxw();t.xp6(3),t.Oqu(e.LoadingMsg)}}function F(n,a){if(1&n&&(t.TgZ(0,"option",46),t._uU(1),t.qZA()),2&n){const e=a.$implicit;t.s9C("value",e.id),t.xp6(1),t.hij(" ",e.name," ")}}const _=[{path:"",redirectTo:"replacements",pathMatch:"full"},{path:"replacements",component:(()=>{class n{constructor(e,i,s,l,d){this.store=e,this.db=i,this.auth=s,this.sync=l,this.router=d,this.District$=[],this.Sites$=[],this.Zones$=[],this.district$=[],this.sites$=[],this.replacementChws$=[],this.isLoginForm=!1,this.isLoading1=!1,this.isLoading2=!1,this.LoadingMsg="Loading...",this.isEditMode=!1,this.message="",this.roles=new p.G(this.store),this.roles.isSupervisorMentor()||(location.href=this.auth.userValue()?.defaultRedirectUrl)}activeSave(){throw new Error("Method not implemented.")}ngOnInit(){this.initAllData(),this.filterForm=this.createFilterFormGroup(),this.replacementChwsForm=this.createReplacementChwsFormGroup()}initAllData(){var e=this;return(0,h.Z)(function*(){e.sync.getDistrictsList().subscribe(i=>{200==i.status&&(e.District$=i.data),e.sync.getSitesList().subscribe(s=>{200==i.status&&(e.Sites$=s.data)},s=>console.log(s.error))},i=>console.log(i.error))})()}getReplacementChws(){this.isLoading1=!0;const e={districts:c.F.returnDataAsArray(this.filterForm.value.districts),sites:c.F.returnDataAsArray(this.filterForm.value.sites)};this.sync.getZonesList(e).subscribe(i=>{200==i.status&&(this.Zones$=i.data),this.sync.getChwsList(e).subscribe(s=>{if(this.replacementChws$=[],200==s.status)for(let l=0;l<s.data.length;l++){const d=s.data[l];d.name.includes("(R)")&&this.replacementChws$.push(d)}this.isLoading1=!1},s=>{console.log(s),this.isLoading1=!1})},i=>{console.log(i),this.isLoading1=!1})}EditChwsZone(e){this.isEditMode=!0,this.replacementChwsForm=this.createReplacementChwsFormGroup(e),this.selectedChw(e)}selectedChw(e){this.chw=e}updateChwsFacilityIdAndContactPlace(){return this.isLoading2=!0,this.db.updateUserFacilityContactPlace(this.replacementChwsForm.value).subscribe(e=>{this.message=e.message,this.getReplacementChws(),this.closeModal(),this.isLoading2=!1},e=>{this.message=e,this.isLoading2=!1,console.log(this.message)})}createFilterFormGroup(){return new o.cw({districts:new o.NI("",[o.kI.required]),sites:new o.NI("",[o.kI.required])})}createReplacementChwsFormGroup(e){return new o.cw({contact:new o.NI(null!=e?e.id:"",[o.kI.required]),parent:new o.NI(null!=e?e.zone.id:"",[o.kI.required]),new_parent:new o.NI("",[o.kI.required])},[this.MatchValidator("parent","new_parent")])}MatchValidator(e,i){return s=>{const l=s.get(e),d=s.get(i);return l&&d&&this.isEditMode&&l.value==d.value?{mismatch:!0}:null}}genarateSites(){const e=c.F.returnDataAsArray(this.filterForm.value.districts);if(this.sites$=[],c.F.notNull(e))for(let i=0;i<this.Sites$.length;i++){const s=this.Sites$[i];c.F.notNull(s)&&e.includes(s.district.id)&&this.sites$.push(s)}else this.sites$=[]}showModalToast(e,i){showToast(e,i),this.closeModal("close-delete-modal")}closeModal(e="close-modal"){$("#"+e).trigger("click")}}return n.\u0275fac=function(e){return new(e||n)(t.Y36(f.u),t.Y36(Z.W),t.Y36(C.e),t.Y36(v._),t.Y36(g.F0))},n.\u0275cmp=t.Xpm({type:n,selectors:[["app-chws_manage"]],decls:86,vars:13,consts:[[1,"page-title","card","card-primary","card-outline"],[1,"card-body"],[1,"fas","fa-user",2,"float","left"],[1,"overlay-wrapper"],["class","overlay",4,"ngIf"],["novalidate","",3,"formGroup","ngSubmit"],[1,"row"],[1,"col-sm-3","col-6"],[1,"form-group"],["formControlName","districts",1,"form-control",3,"change"],["value",""],[3,"value",4,"ngFor","ngForOf"],["formControlName","sites",1,"form-control"],[1,"col-sm-2","col-6"],["type","submit",1,"btn","btn-warning","form-control",3,"disabled"],[1,"fa","fa-floppy-o","fa-right"],[1,"page-content-wrap"],[1,"col-md-12"],[1,"panel","panel-default"],[1,"panel-heading"],[1,"panel-body"],[1,"table","datatable"],[4,"ngFor","ngForOf"],["id","modal-default",1,"modal","fade"],[1,"modal-dialog"],["novalidate","",1,"form-horizontal",3,"formGroup","ngSubmit"],[1,"modal-content"],[1,"modal-header"],["height","30","src","assets/logo/logo.png","alt","","srcset","",1,"modal-title"],[1,"login-box-msg",2,"text-align","center"],[1,"btn-warning"],["type","button","data-dismiss","modal","aria-label","Close",1,"close"],["aria-hidden","true"],[1,"modal-body"],[1,"login-box-msg"],[1,"input-group","mb-3"],["id","new_parent","formControlName","new_parent",1,"form-control"],[1,"input-group-append"],[1,"input-group-text"],[1,"fas","fa-edit"],[1,"modal-footer","justify-content-between"],["id","close-modal","type","button","data-dismiss","modal",1,"btn","btn-default"],["type","submit",1,"btn","btn-warning",3,"disabled"],[1,"overlay"],[1,"fas","fa-3x","fa-sync-alt","fa-spin"],[1,"text-bold","pt-2"],[3,"value"],["data-toggle","modal","data-target","#modal-default",3,"click"]],template:function(e,i){1&e&&(t.TgZ(0,"div",0)(1,"div",1)(2,"span",2),t._uU(3," List ds ASC rempla\xe7antes"),t.qZA(),t._UZ(4,"br")(5,"br")(6,"br"),t.TgZ(7,"div",3),t.YNc(8,w,4,1,"div",4),t.TgZ(9,"form",5),t.NdJ("ngSubmit",function(){return i.getReplacementChws()}),t.TgZ(10,"div",6)(11,"div",7)(12,"div",8)(13,"label"),t._uU(14,"District"),t.qZA(),t.TgZ(15,"select",9),t.NdJ("change",function(){return i.genarateSites()}),t._UZ(16,"option",10),t.YNc(17,b,2,2,"option",11),t.qZA()()(),t.TgZ(18,"div",7)(19,"div",8)(20,"label"),t._uU(21,"Site"),t.qZA(),t.TgZ(22,"select",12),t._UZ(23,"option",10),t.YNc(24,T,2,2,"option",11),t.qZA()()(),t.TgZ(25,"div",13)(26,"div",8)(27,"label"),t._uU(28,"."),t.qZA(),t.TgZ(29,"button",14),t._uU(30," OK "),t._UZ(31,"span",15),t.qZA()()()()()()()(),t.TgZ(32,"div",16)(33,"div",6)(34,"div",17)(35,"div",18),t._UZ(36,"div",19),t.TgZ(37,"div",20)(38,"table",21)(39,"thead")(40,"tr")(41,"th"),t._uU(42,"Nom de l'ASC"),t.qZA(),t.TgZ(43,"th"),t._uU(44,"Zone Actuel"),t.qZA()()(),t.YNc(45,M,6,2,"tbody",22),t.qZA()()()()()(),t.TgZ(46,"div",23)(47,"div",24)(48,"div",3),t.YNc(49,A,4,1,"div",4),t.TgZ(50,"form",25),t.NdJ("ngSubmit",function(){return i.updateChwsFacilityIdAndContactPlace()}),t.TgZ(51,"div",26)(52,"div",27),t._UZ(53,"img",28),t.TgZ(54,"strong",29)(55,"span",30),t._uU(56,"Modifier la zone"),t.qZA()(),t.TgZ(57,"button",31)(58,"span",32),t._uU(59,"\xd7"),t.qZA()()(),t.TgZ(60,"div",33)(61,"p",34)(62,"strong"),t._uU(63),t.qZA()(),t.TgZ(64,"p"),t._uU(65,"L'ASC remplacante "),t.TgZ(66,"strong"),t._uU(67),t.qZA(),t._uU(68," intervient pr\xe9sentement dans "),t.TgZ(69,"strong"),t._uU(70),t.qZA()(),t._UZ(71,"br"),t.TgZ(72,"p"),t._uU(73,"Selectionner une nouvelle zone d'intervention"),t.qZA(),t.TgZ(74,"div",35)(75,"select",36),t._UZ(76,"option",10),t.YNc(77,F,2,2,"option",11),t.qZA(),t.TgZ(78,"div",37)(79,"div",38),t._UZ(80,"span",39),t.qZA()()()(),t.TgZ(81,"div",40)(82,"button",41),t._uU(83,"Close"),t.qZA(),t.TgZ(84,"button",42),t._uU(85,"Modifier"),t.qZA()()()()()()()),2&e&&(t.xp6(8),t.Q6J("ngIf",i.isLoading1),t.xp6(1),t.Q6J("formGroup",i.filterForm),t.xp6(8),t.Q6J("ngForOf",i.District$),t.xp6(7),t.Q6J("ngForOf",i.sites$),t.xp6(5),t.Q6J("disabled",!i.filterForm.valid),t.xp6(16),t.Q6J("ngForOf",i.replacementChws$),t.xp6(4),t.Q6J("ngIf",i.isLoading2),t.xp6(1),t.Q6J("formGroup",i.replacementChwsForm),t.xp6(13),t.Oqu(i.message),t.xp6(4),t.Oqu(null==i.chw?null:i.chw.name),t.xp6(3),t.Oqu(null==i.chw||null==i.chw.zone?null:i.chw.zone.name),t.xp6(7),t.Q6J("ngForOf",i.Zones$),t.xp6(7),t.Q6J("disabled",!i.replacementChwsForm.valid))},dependencies:[u.sg,u.O5,o._Y,o.YN,o.Kr,o.EJ,o.JJ,o.JL,o.sg,o.u],encapsulation:2}),n})(),data:{href:"replacements",icon:"fa fa-user",label:"Remplacants",title:"Remplacants"}}];let U=(()=>{class n{}return n.\u0275fac=function(e){return new(e||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[g.Bz.forChild(_),g.Bz]}),n})(),y=(()=>{class n{}return n.\u0275fac=function(e){return new(e||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[u.ez,o.UX,U]}),n})()}}]);