// import { Injectable } from "@angular/core";
// import { ActivatedRoute, Data } from "@angular/router";
// import { IBreadCrumb } from "@ih-app/models/Breadcrumb";

// @Injectable({
//     providedIn: "root",
// })
// export class BreadcrumbService {
    
//     breadcrumbTitle:string = "";


//     getBreadcrumb(activatedRoute: ActivatedRoute): Array<IBreadCrumb> {
//         var bcrs: IBreadCrumb[] = [];
//         const ar = activatedRoute;

//         if (ar != null) {
//             ar.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: true }) : null);
//             if (ar.parent != null) {
//                 ar.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                 if (ar.parent.parent != null) {
//                     ar.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                     if (ar.parent.parent.parent != null) {
//                         ar.parent.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                         if (ar.parent.parent.parent.parent != null) {
//                             ar.parent.parent.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                             if (ar.parent.parent.parent.parent.parent != null) {
//                                 ar.parent.parent.parent.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                                 if (ar.parent.parent.parent.parent.parent.parent != null) {
//                                     ar.parent.parent.parent.parent.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                                     if (ar.parent.parent.parent.parent.parent.parent.parent != null) {
//                                         ar.parent.parent.parent.parent.parent.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                                         if (ar.parent.parent.parent.parent.parent.parent.parent.parent != null) {
//                                             ar.parent.parent.parent.parent.parent.parent.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                                             if (ar.parent.parent.parent.parent.parent.parent.parent.parent.parent != null) {
//                                                 ar.parent.parent.parent.parent.parent.parent.parent.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                                                 if (ar.parent.parent.parent.parent.parent.parent.parent.parent.parent.parent != null) {
//                                                     ar.parent.parent.parent.parent.parent.parent.parent.parent.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);
//                                                     if (ar.parent.parent.parent.parent.parent.parent.parent.parent.parent.parent.parent != null) {
//                                                         ar.parent.parent.parent.parent.parent.parent.parent.parent.parent.parent.parent.data.subscribe((data) => data['label'] != undefined ? bcrs.unshift({ url: data["href"], label: data["label"], isActiveRoot: false }) : null);

//                                                     }
//                                                 }
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         return bcrs;
//     }
// }


