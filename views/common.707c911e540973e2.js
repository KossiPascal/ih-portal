"use strict";(self.webpackChunkih_portal=self.webpackChunkih_portal||[]).push([[592],{8968:(_,o,a)=>{a.d(o,{a:()=>d});var s=a(4537),r=a(7556),n=a(3580);let d=(()=>{class u{constructor(i,t){this.auth=i,this.router=t}canActivate(i,t){return this.auth.isLoggedIn()||this.auth.logout(),this.auth.isLoggedIn()}}return u.\u0275fac=function(i){return new(i||u)(s.LFG(r.e),s.LFG(n.F0))},u.\u0275prov=s.Yz7({token:u,factory:u.\u0275fac,providedIn:"root"}),u})()},3406:(_,o,a)=>{a.d(o,{W:()=>u});var s=a(8629),r=a(4537),n=a(7556),d=a(5732);let u=(()=>{class h{constructor(t,e){this.auth=t,this.http=e}updateUserFacilityContactPlace(t){(!this.auth.isLoggedIn()||null==this.auth.userValue())&&this.auth.logout();const e=this.auth.userValue();return t.userId=e?.id,t.dhisusersession=e?.dhisusersession,this.http.post(`${s.F.backenUrl()}/database/couchdb/update_user_facility_contact_place`,t,s.F.HttpHeaders(this.auth))}getDatabaseEntities(){(!this.auth.isLoggedIn()||null==this.auth.userValue())&&this.auth.logout();const t=this.auth.userValue(),e={userId:t?.id,dhisusersession:t?.dhisusersession};return this.http.post(`${s.F.backenUrl()}/database/postgres/entities`,e,s.F.HttpHeaders(this.auth))}truncateDatabase(t){(!this.auth.isLoggedIn()||null==this.auth.userValue())&&this.auth.logout();const e=this.auth.userValue();return t.userId=e?.id,t.dhisusersession=e?.dhisusersession,this.http.post(`${s.F.backenUrl()}/database/postgres/truncate`,t,s.F.HttpHeaders(this.auth))}getDataToDeleteFromCouchDb(t){(!this.auth.isLoggedIn()||null==this.auth.userValue())&&this.auth.logout();const e=this.auth.userValue();return t.userId=e?.id,t.dhisusersession=e?.dhisusersession,this.http.post(`${s.F.backenUrl()}/database/couchdb/list_data_to_delete`,t,s.F.HttpHeaders(this.auth))}deleteDataFromCouchDb(t,e){(!this.auth.isLoggedIn()||null==this.auth.userValue())&&this.auth.logout();const l=this.auth.userValue();return this.http.post(`${s.F.backenUrl()}/database/couchdb/detele_data`,{array_data_to_delete:t,type:e,userId:l?.id,dhisusersession:l?.dhisusersession},s.F.HttpHeaders(this.auth))}}return h.\u0275fac=function(t){return new(t||h)(r.LFG(n.e),r.LFG(d.eN))},h.\u0275prov=r.Yz7({token:h,factory:h.\u0275fac,providedIn:"root"}),h})()}}]);