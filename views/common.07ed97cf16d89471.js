"use strict";(self.webpackChunkih_portal=self.webpackChunkih_portal||[]).push([["common"],{6938:(p,h,r)=>{r.d(h,{z:()=>_});var a=r(4537),n=r(5998);let _=(()=>{class o{constructor(i){this.sanitizer=i}transform(i){return this.sanitizer.bypassSecurityTrustHtml(i)}}return o.\u0275fac=function(i){return new(i||o)(a.Y36(n.H7,16))},o.\u0275pipe=a.Yjl({name:"safeHtml",type:o,pure:!0}),o})()},3406:(p,h,r)=>{r.d(h,{W:()=>i});var a=r(8629),n=r(4537),_=r(7556),o=r(8345),u=r(5732);let i=(()=>{class c{constructor(t,e,s){this.auth=t,this.store=e,this.http=s}ApiParams(t,e=!0){if(e&&!this.auth.isLoggedIn())return this.auth.logout();const s=(0,a.Nf)(t)?t:{};return s.userId=this.auth.getUserId(),s.appLoadToken=this.auth.getAppLoadToken(),s.accessRoles=this.auth.RolePagesActions("roles"),s.accessPages=this.auth.RolePagesActions("pages"),s.accessActions=this.auth.RolePagesActions("actions"),s.dhisusername=void 0,s.dhispassword=void 0,s}updateUserFacilityContactPlace(t){const e=this.ApiParams(t);return this.http.post(`${(0,a.Y1)()}/database/couchdb/update_user_facility_contact_place`,e,(0,a.PU)(this.store))}getDatabaseEntities(){const t=this.ApiParams();return this.http.post(`${(0,a.Y1)()}/database/postgres/entities`,t,(0,a.PU)(this.store))}truncateDatabase(t){const e=this.ApiParams(t);return this.http.post(`${(0,a.Y1)()}/database/postgres/truncate`,e,(0,a.PU)(this.store))}getDataToDeleteFromCouchDb(t){const e=this.ApiParams(t);return this.http.post(`${(0,a.Y1)()}/database/couchdb/list_data_to_delete`,e,(0,a.PU)(this.store))}deleteDataFromCouchDb(t,e){const s=this.ApiParams({array_data_to_delete:t,type:e});return this.http.post(`${(0,a.Y1)()}/database/couchdb/detele_data`,s,(0,a.PU)(this.store))}}return c.\u0275fac=function(t){return new(t||c)(n.LFG(_.e),n.LFG(o.u),n.LFG(u.eN))},c.\u0275prov=n.Yz7({token:c,factory:c.\u0275fac,providedIn:"root"}),c})()}}]);