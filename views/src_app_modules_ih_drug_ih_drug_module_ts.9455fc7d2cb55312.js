"use strict";(self.webpackChunkih_portal=self.webpackChunkih_portal||[]).push([["src_app_modules_ih_drug_ih_drug_module_ts"],{4676:(wt,C,h)=>{h.r(C),h.d(C,{IhDrugModule:()=>xt});var v=h(8692),_=h(92),w=h(3580),q=h(8968),U=h(5601),m=h(8239),d=h(8629),b=h(574),t=h(4537),Q=h(1383),O=h(7556),I=h(1815);function $(n,o){if(1&n&&(t.TgZ(0,"div",18),t._UZ(1,"i",19),t.TgZ(2,"div",20),t._uU(3),t.qZA()()),2&n){const e=t.oxw();t.xp6(3),t.hij(" ",e.initMsg," ")}}function N(n,o){if(1&n&&(t.TgZ(0,"option",24),t._uU(1),t.qZA()),2&n){const e=o.$implicit;t.s9C("value",e.id),t.xp6(1),t.hij(" ",e.labelFR," ")}}function F(n,o){if(1&n&&(t.TgZ(0,"select",22),t.YNc(1,N,2,2,"option",23),t.qZA()),2&n){const e=t.oxw(2);t.xp6(1),t.Q6J("ngForOf",e.Months$)}}function M(n,o){if(1&n&&(t.TgZ(0,"div",10)(1,"div",11)(2,"label"),t._uU(3,"Mois"),t.qZA(),t.YNc(4,F,2,1,"select",21),t.qZA()()),2&n){const e=t.oxw();t.xp6(4),t.Q6J("ngIf",e.Months$.length>0)}}function k(n,o){if(1&n&&(t.TgZ(0,"option",24),t._uU(1),t.qZA()),2&n){const e=o.$implicit;t.s9C("value",e),t.xp6(1),t.hij(" ",e," ")}}function J(n,o){if(1&n&&(t.TgZ(0,"select",26),t.YNc(1,k,2,2,"option",23),t.qZA()),2&n){const e=t.oxw(2);t.xp6(1),t.Q6J("ngForOf",e.Years$)}}function E(n,o){if(1&n&&(t.TgZ(0,"div",10)(1,"div",11)(2,"label"),t._uU(3,"Ann\xe9e"),t.qZA(),t.YNc(4,J,2,1,"select",25),t.qZA()()),2&n){const e=t.oxw();t.xp6(4),t.Q6J("ngIf",e.Years$.length>0)}}function Y(n,o){if(1&n&&(t.TgZ(0,"option",24),t._uU(1),t.qZA()),2&n){const e=o.$implicit;t.s9C("value",e.id),t.xp6(1),t.hij(" ",e.name," ")}}function P(n,o){if(1&n){const e=t.EpF();t.TgZ(0,"select",28),t.NdJ("change",function(){t.CHM(e);const s=t.oxw(2);return t.KtG(s.genarateSites())}),t.YNc(1,Y,2,2,"option",23),t.qZA()}if(2&n){const e=t.oxw(2);t.Q6J("multiple",e.Districts$.length>0?"multiple":""),t.xp6(1),t.Q6J("ngForOf",e.Districts$)}}function L(n,o){if(1&n&&(t.TgZ(0,"div",10)(1,"div",11)(2,"label"),t._uU(3,"District"),t.qZA(),t.YNc(4,P,2,2,"select",27),t.qZA()()),2&n){const e=t.oxw();t.xp6(4),t.Q6J("ngIf",e.Districts$.length>0)}}function j(n,o){if(1&n&&(t.TgZ(0,"option",24),t._uU(1),t.qZA()),2&n){const e=o.$implicit;t.s9C("value",e.id),t.xp6(1),t.hij(" ",e.name," ")}}function S(n,o){if(1&n){const e=t.EpF();t.TgZ(0,"div",10)(1,"div",11)(2,"label"),t._uU(3,"Site"),t.qZA(),t.TgZ(4,"select",29),t.NdJ("change",function(){t.CHM(e);const s=t.oxw();return t.KtG(s.genarateChws())}),t.YNc(5,j,2,2,"option",23),t.qZA()()()}if(2&n){const e=t.oxw();t.xp6(4),t.Q6J("multiple",e.site$.length>0?"multiple":""),t.xp6(1),t.Q6J("ngForOf",e.site$)}}function G(n,o){if(1&n&&(t.TgZ(0,"option",24),t._uU(1),t.qZA()),2&n){const e=o.$implicit;t.s9C("value",e.id),t.xp6(1),t.hij(" ",e.name," ")}}function K(n,o){if(1&n&&(t.TgZ(0,"div",10)(1,"div",11)(2,"label"),t._uU(3,"ASC"),t.qZA(),t.TgZ(4,"select",30),t.YNc(5,G,2,2,"option",23),t.qZA()()()),2&n){const e=t.oxw();t.xp6(4),t.Q6J("multiple",e.chw$.length>0?"multiple":""),t.xp6(1),t.Q6J("ngForOf",e.chw$)}}function H(n,o){if(1&n&&(t.TgZ(0,"h2")(1,"div",2)(2,"div",31),t._uU(3),t.qZA()()()),2&n){const e=t.oxw();t.xp6(3),t.hij(" ",e.data_error_messages," ")}}function V(n,o){1&n&&(t.TgZ(0,"h2")(1,"div",2)(2,"div",31),t._uU(3," Pas de donn\xe9es trouv\xe9e avec les paramettres renseign\xe9s ! "),t.qZA()()())}function B(n,o){if(1&n){const e=t.EpF();t.TgZ(0,"ul")(1,"li")(2,"span",43),t.NdJ("click",function(){t.CHM(e);const s=t.oxw().index,r=t.oxw(2);return t.KtG(r.excel("export_table"+s))}),t._uU(3,"Excel"),t.qZA()(),t.TgZ(4,"li")(5,"span",43),t.NdJ("click",function(){t.CHM(e);const s=t.oxw().index,r=t.oxw(2);return t.KtG(r.csv("export_table"+s))}),t._uU(6,"CSV"),t.qZA()(),t.TgZ(7,"li")(8,"span",43),t.NdJ("click",function(){t.CHM(e);const s=t.oxw().index,r=t.oxw(2);return t.KtG(r.json("export_table"+s))}),t._uU(9,"JSON"),t.qZA()(),t.TgZ(10,"li")(11,"span",43),t.NdJ("click",function(){t.CHM(e);const s=t.oxw().index,r=t.oxw(2);return t.KtG(r.pdf("export_table"+s))}),t._uU(12,"PDF"),t.qZA()(),t.TgZ(13,"li")(14,"span",43),t.NdJ("click",function(){t.CHM(e);const s=t.oxw().index,r=t.oxw(2);return t.KtG(r.print("export_table"+s))}),t._uU(15,"PRINT"),t.qZA()()()}}function z(n,o){1&n&&t._UZ(0,"i",47)}function R(n,o){if(1&n&&(t.TgZ(0,"button",45),t.YNc(1,z,1,0,"i",46),t._uU(2),t.qZA()),2&n){const e=t.oxw().index,i=t.oxw(2);t.Q6J("disabled","true"==i.isUpdateLoading[e]),t.xp6(1),t.Q6J("ngIf","true"==i.isUpdateLoading[e]),t.xp6(1),t.hij(" ","true"==i.isUpdateLoading[e]?"Sauvegarde en cours ...":"Mettre \xe0 jour"," ")}}function X(n,o){if(1&n&&(t.TgZ(0,"span"),t._uU(1),t.qZA()),2&n){const e=t.oxw(2).$implicit,i=t.oxw().$implicit,s=t.oxw(2);t.xp6(1),t.hij(" ",s.convertQty(s.toChwsDrugData(s.sortedArray(i.data),e).val.year_cmm)," ")}}function W(n,o){if(1&n&&t._UZ(0,"input",53),2&n){const e=t.oxw().ngIf,i=t.oxw().$implicit,s=t.oxw(),r=s.index,c=s.$implicit,a=t.oxw(2);t.hYB("id","year_cmm_",r,"_",e,""),t.s9C("value",a.toChwsDrugData(a.sortedArray(c.data),i).val.year_cmm),t.Q6J("disabled","true"==a.isUpdateLoading[r]),t.uIk("data-drug-index",e)}}function tt(n,o){if(1&n&&(t.TgZ(0,"span"),t._uU(1),t.qZA()),2&n){const e=t.oxw(2).$implicit,i=t.oxw().$implicit,s=t.oxw(2);t.xp6(1),t.hij(" ",s.convertQty(s.toChwsDrugData(s.sortedArray(i.data),e).val.theoretical_quantity_to_order)," ")}}function et(n,o){if(1&n&&t._UZ(0,"input",53),2&n){const e=t.oxw().ngIf,i=t.oxw().$implicit,s=t.oxw(),r=s.index,c=s.$implicit,a=t.oxw(2);t.hYB("id","theoretical_quantity_to_order_",r,"_",e,""),t.s9C("value",a.toChwsDrugData(a.sortedArray(c.data),i).val.theoretical_quantity_to_order),t.Q6J("disabled","true"==a.isUpdateLoading[r]),t.uIk("data-drug-index",e)}}function it(n,o){if(1&n&&(t.TgZ(0,"span"),t._uU(1),t.qZA()),2&n){const e=t.oxw(2).$implicit,i=t.oxw().$implicit,s=t.oxw(2);t.xp6(1),t.hij(" ",s.convertQty(s.toChwsDrugData(s.sortedArray(i.data),e).val.quantity_validated)," ")}}function nt(n,o){if(1&n&&t._UZ(0,"input",53),2&n){const e=t.oxw().ngIf,i=t.oxw().$implicit,s=t.oxw(),r=s.index,c=s.$implicit,a=t.oxw(2);t.hYB("id","quantity_validated_",r,"_",e,""),t.s9C("value",a.toChwsDrugData(a.sortedArray(c.data),i).val.quantity_validated),t.Q6J("disabled","true"==a.isUpdateLoading[r]),t.uIk("data-drug-index",e)}}function st(n,o){if(1&n&&(t.TgZ(0,"span"),t._uU(1),t.qZA()),2&n){const e=t.oxw(2).$implicit,i=t.oxw().$implicit,s=t.oxw(2);t.xp6(1),t.hij(" ",s.convertQty(s.toChwsDrugData(s.sortedArray(i.data),e).val.delivered_quantity)," ")}}function at(n,o){if(1&n&&t._UZ(0,"input",53),2&n){const e=t.oxw().ngIf,i=t.oxw().$implicit,s=t.oxw(),r=s.index,c=s.$implicit,a=t.oxw(2);t.hYB("id","delivered_quantity_",r,"_",e,""),t.s9C("value",a.toChwsDrugData(a.sortedArray(c.data),i).val.delivered_quantity),t.Q6J("disabled","true"==a.isUpdateLoading[r]),t.uIk("data-drug-index",e)}}function rt(n,o){if(1&n){const e=t.EpF();t.TgZ(0,"i",54),t.NdJ("click",function(){t.CHM(e);const s=t.oxw(5);return t.KtG(s.showHideMsg("loan_borrowing_chws_code"))}),t.qZA()}}function ot(n,o){if(1&n){const e=t.EpF();t.TgZ(0,"i",54),t.NdJ("click",function(){t.CHM(e);const s=t.oxw(5);return t.KtG(s.showHideMsg("comments"))}),t.qZA()}}function ct(n,o){if(1&n&&(t.TgZ(0,"span"),t._uU(1),t.qZA()),2&n){const e=t.oxw(2).$implicit,i=t.oxw().$implicit,s=t.oxw(2);t.xp6(1),t.hij(" ",s.toChwsDrugData(s.sortedArray(i.data),e).val.observations," ")}}function dt(n,o){if(1&n&&t._UZ(0,"input",55),2&n){const e=t.oxw().ngIf,i=t.oxw().$implicit,s=t.oxw(),r=s.index,c=s.$implicit,a=t.oxw(2);t.hYB("id","observations_",r,"_",e,""),t.s9C("value",a.toChwsDrugData(a.sortedArray(c.data),i).val.observations),t.Q6J("disabled","true"==a.isUpdateLoading[r]),t.uIk("data-drug-index",e)}}function _t(n,o){if(1&n){const e=t.EpF();t.TgZ(0,"i",54),t.NdJ("click",function(){t.CHM(e);const s=t.oxw(5);return t.KtG(s.showHideMsg("observations"))}),t.qZA()}}function ut(n,o){if(1&n&&(t.TgZ(0,"tr")(1,"td")(2,"b"),t._uU(3),t.qZA()(),t.TgZ(4,"td",48)(5,"label")(6,"b"),t._uU(7),t.qZA()()(),t.TgZ(8,"td",48)(9,"p"),t._uU(10),t.qZA()(),t.TgZ(11,"td",48)(12,"p"),t._uU(13),t.qZA()(),t.TgZ(14,"td",48)(15,"p"),t._uU(16),t.qZA()(),t.TgZ(17,"td",48)(18,"p"),t._uU(19),t.qZA()(),t.TgZ(20,"td",48)(21,"p"),t._uU(22),t.qZA()(),t.TgZ(23,"td",48)(24,"p"),t._uU(25),t.qZA()(),t.TgZ(26,"td",48)(27,"p"),t._uU(28),t.qZA()(),t.TgZ(29,"td",48)(30,"p"),t.YNc(31,X,2,1,"span",17),t.YNc(32,W,1,5,"input",49),t.qZA()(),t.TgZ(33,"td",48)(34,"p"),t.YNc(35,tt,2,1,"span",17),t.YNc(36,et,1,5,"input",49),t.qZA()(),t.TgZ(37,"td",48)(38,"p"),t._uU(39),t.qZA()(),t.TgZ(40,"td",48)(41,"p"),t.YNc(42,it,2,1,"span",17),t.YNc(43,nt,1,5,"input",49),t.qZA()(),t.TgZ(44,"td",48)(45,"p"),t.YNc(46,st,2,1,"span",17),t.YNc(47,at,1,5,"input",49),t.qZA()(),t.TgZ(48,"td",48)(49,"p"),t._uU(50),t.qZA()(),t.TgZ(51,"td",48)(52,"p"),t._uU(53),t.qZA()(),t.TgZ(54,"td",48)(55,"p"),t._uU(56),t.qZA()(),t.TgZ(57,"td",50)(58,"p"),t._uU(59),t.qZA(),t.YNc(60,rt,1,0,"i",51),t.qZA(),t.TgZ(61,"td",48)(62,"p"),t._uU(63),t.qZA()(),t.TgZ(64,"td",48)(65,"p"),t._uU(66),t.qZA()(),t.TgZ(67,"td",48)(68,"p"),t._uU(69),t.qZA()(),t.TgZ(70,"td",48)(71,"p"),t._uU(72),t.qZA()(),t.TgZ(73,"td",48)(74,"p"),t._uU(75),t.qZA()(),t.TgZ(76,"td",50)(77,"p"),t._uU(78),t.qZA(),t.YNc(79,ot,1,0,"i",51),t.qZA(),t.TgZ(80,"td",50),t.YNc(81,ct,2,1,"span",17),t.YNc(82,dt,1,5,"input",52),t.YNc(83,_t,1,0,"i",51),t.qZA()()),2&n){const e=o.ngIf,i=t.oxw().$implicit,s=t.oxw(),r=s.$implicit,c=s.index,a=t.oxw(2);t.xp6(3),t.Oqu(e),t.xp6(4),t.Oqu(a.getLabel(a.toChwsDrugData(a.sortedArray(r.data),i).key)),t.xp6(3),t.Oqu(a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.month_quantity_beginning)),t.xp6(3),t.Oqu(a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.month_quantity_received)),t.xp6(3),t.hij("",a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.month_total_quantity)," "),t.xp6(3),t.hij("",a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.month_consumption)," "),t.xp6(3),t.hij("",a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.theoretical_quantity)," "),t.xp6(3),t.hij("",a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.inventory_quantity)," "),t.xp6(3),t.hij("",a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.inventory_variance)," "),t.xp6(3),t.Q6J("ngIf","edit"!=a.editCmm[c]),t.xp6(1),t.Q6J("ngIf","edit"==a.editCmm[c]),t.xp6(3),t.Q6J("ngIf","edit"!=a.editTheoreticalQtyOrder[c]),t.xp6(1),t.Q6J("ngIf","edit"==a.editTheoreticalQtyOrder[c]),t.xp6(3),t.Oqu(a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.quantity_to_order)),t.xp6(3),t.Q6J("ngIf","edit"!=a.editQtyValidated[c]),t.xp6(1),t.Q6J("ngIf","edit"==a.editQtyValidated[c]),t.xp6(3),t.Q6J("ngIf","edit"!=a.editQtyDelivered[c]),t.xp6(1),t.Q6J("ngIf","edit"==a.editQtyDelivered[c]),t.xp6(3),t.Oqu(a.toChwsDrugData(a.sortedArray(r.data),i).val.satisfaction_rate),t.xp6(3),t.Oqu(a.toChwsDrugData(a.sortedArray(r.data),i).val.loan_borrowing),t.xp6(3),t.Oqu(a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.loan_borrowing_quantity)),t.xp6(3),t.Oqu(a.toChwsDrugData(a.sortedArray(r.data),i).val.loan_borrowing_chws_code),t.xp6(1),t.Q6J("ngIf",""!=a.toChwsDrugData(a.sortedArray(r.data),i).val.loan_borrowing_chws_code),t.xp6(3),t.Oqu(a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.quantity_loss)),t.xp6(3),t.Oqu(a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.quantity_damaged)),t.xp6(3),t.Oqu(a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.quantity_broken)),t.xp6(3),t.Oqu(a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.quantity_expired)),t.xp6(3),t.Oqu(a.convertQty(a.toChwsDrugData(a.sortedArray(r.data),i).val.other_quantity)),t.xp6(3),t.Oqu(a.toChwsDrugData(a.sortedArray(r.data),i).val.comments),t.xp6(1),t.Q6J("ngIf",""!=a.toChwsDrugData(a.sortedArray(r.data),i).val.comments),t.xp6(2),t.Q6J("ngIf","edit"!=a.editObservations[c]),t.xp6(1),t.Q6J("ngIf","edit"==a.editObservations[c]),t.xp6(1),t.Q6J("ngIf",""!=a.toChwsDrugData(a.sortedArray(r.data),i).val.observations)}}function lt(n,o){if(1&n&&(t.ynx(0),t.YNc(1,ut,84,33,"tr",17),t.BQk()),2&n){const e=o.$implicit,i=t.oxw().$implicit,s=t.oxw(2);t.xp6(1),t.Q6J("ngIf",s.getKey(s.toChwsDrugData(s.sortedArray(i.data),e).key))}}function ht(n,o){1&n&&(t.TgZ(0,"p"),t._UZ(1,"br")(2,"br"),t.qZA())}function gt(n,o){if(1&n){const e=t.EpF();t.TgZ(0,"div"),t._UZ(1,"div",33),t.TgZ(2,"form",34),t.NdJ("submit",function(s){const c=t.CHM(e).index,a=t.oxw(2);return t.KtG(a.saveOrUpdate(s,c))}),t.TgZ(3,"div",35)(4,"div",6)(5,"div",36)(6,"p",37),t._uU(7),t.TgZ(8,"strong"),t._uU(9),t.qZA(),t._uU(10),t.qZA(),t.YNc(11,B,16,0,"ul",17),t.YNc(12,R,3,3,"button",38),t.qZA()(),t.TgZ(13,"div",39)(14,"table",40)(15,"thead")(16,"tr",41)(17,"th",42),t._uU(18,"Id"),t.qZA(),t.TgZ(19,"th",42),t._uU(20,"MEG"),t.qZA(),t.TgZ(21,"th",42),t._uU(22," Quantit\xe9 d\xe9but du mois "),t._UZ(23,"br"),t.TgZ(24,"small")(25,"small"),t._uU(26,"ou la quantit\xe9 \xe0 l'inventaire pr\xe9c\xe9dent"),t.qZA(),t._uU(27,"(A)"),t.qZA()(),t.TgZ(28,"th",42),t._uU(29,"Quantit\xe9 re\xe7ue au cours du mois "),t.TgZ(30,"small"),t._uU(31,"(B)"),t.qZA()(),t.TgZ(32,"th",42),t._uU(33,"Quantit\xe9 totale du mois "),t.TgZ(34,"small"),t._uU(35,"(C) C=A+B"),t.qZA()(),t.TgZ(36,"th",42),t._uU(37,"Consommation mensuelle du mois "),t.TgZ(38,"small"),t._uU(39,"(D)"),t.qZA()(),t.TgZ(40,"th",42),t._uU(41,"Quantit\xe9 th\xe9orique disponible \xe0 l'inventaire "),t.TgZ(42,"small"),t._uU(43,"E= C-D"),t.qZA()(),t.TgZ(44,"th",42),t._uU(45,"Quantit\xe9 compt\xe9e \xe0 l'inventaire "),t.TgZ(46,"small"),t._uU(47,"(F)"),t.qZA()(),t.TgZ(48,"th",42),t._uU(49,"Ecart d'inventaire "),t.TgZ(50,"small"),t._uU(51,"J = F-E"),t.qZA()(),t.TgZ(52,"th",42),t._uU(53,"CMM de l'ann\xe9e N-1 "),t.TgZ(54,"small"),t._uU(55,"(G)"),t.qZA(),t.TgZ(56,"i",43),t.NdJ("click",function(){const r=t.CHM(e).index,c=t.oxw(2);return t.KtG(c.editCmmClick(r))}),t.qZA()(),t.TgZ(57,"th",42),t._uU(58,"Quantit\xe9 th\xe9orique \xe0 commander "),t.TgZ(59,"small"),t._uU(60,"(H)"),t.qZA(),t.TgZ(61,"i",43),t.NdJ("click",function(){const r=t.CHM(e).index,c=t.oxw(2);return t.KtG(c.editTheoreticalQtyOrderClick(r))}),t.qZA()(),t.TgZ(62,"th",42),t._uU(63,"Quantit\xe9s \xe0 commander "),t._UZ(64,"br"),t.TgZ(65,"small")(66,"small"),t._uU(67,"(Expression besoins ASC)"),t.qZA(),t._uU(68,"(I)"),t.qZA()(),t.TgZ(69,"th",42),t._uU(70,"Quantit\xe9 valid\xe9e "),t.TgZ(71,"i",43),t.NdJ("click",function(){const r=t.CHM(e).index,c=t.oxw(2);return t.KtG(c.editQtyValidatedClick(r))}),t.qZA()(),t.TgZ(72,"th",42),t._uU(73,"Quantit\xe9 livr\xe9e "),t.TgZ(74,"i",43),t.NdJ("click",function(){const r=t.CHM(e).index,c=t.oxw(2);return t.KtG(c.editQtyDeliveredClick(r))}),t.qZA()(),t.TgZ(75,"th",42),t._uU(76,"Taux de satisfaction"),t.qZA(),t.TgZ(77,"th",44),t._uU(78,"Observation ASC"),t.qZA(),t.TgZ(79,"th",42),t._uU(80,"Observations (Pharmacie) "),t.TgZ(81,"i",43),t.NdJ("click",function(){const r=t.CHM(e).index,c=t.oxw(2);return t.KtG(c.editObservationsClick(r))}),t.qZA()()(),t.TgZ(82,"tr",41)(83,"th"),t._uU(84,"Emprunt/Pr\xeat du mois"),t.qZA(),t.TgZ(85,"th"),t._uU(86,"Quantit\xe9 Emprunt/Pr\xeat du mois"),t.qZA(),t.TgZ(87,"th"),t._uU(88,"Nom & Code ASC"),t.qZA(),t.TgZ(89,"th"),t._uU(90,"Perte du mois"),t.qZA(),t.TgZ(91,"th"),t._uU(92,"Avari\xe9 du mois"),t.qZA(),t.TgZ(93,"th"),t._uU(94,"Cass\xe9 du mois"),t.qZA(),t.TgZ(95,"th"),t._uU(96,"P\xe9rim\xe9 du mois"),t.qZA(),t.TgZ(97,"th"),t._uU(98,"Autre du mois"),t.qZA(),t.TgZ(99,"th"),t._uU(100,"Commentaires ASC"),t.qZA()()(),t.TgZ(101,"tbody"),t.YNc(102,lt,2,1,"ng-container",32),t.qZA()()()()(),t.YNc(103,ht,3,0,"p",17),t.qZA()}if(2&n){const e=o.$implicit,i=o.index,s=t.oxw(2);t.xp6(1),t.MGl("id","data-info-",i,""),t.uIk("data-district",e.chw.site.district.id)("data-site",e.chw.site.id)("data-chw",e.chw.id),t.xp6(6),t.AsE("",e.chw.site.district.name," > ",e.chw.site.name," > "),t.xp6(2),t.Oqu(e.chw.name),t.xp6(1),t.hij(" ( ",e.chw.external_id," ) "),t.xp6(1),t.Q6J("ngIf","edit"!=s.editCmm[i]&&"edit"!=s.editQtyValidated[i]&&"edit"!=s.editQtyDelivered[i]&&"edit"!=s.editObservations[i]&&"edit"!=s.editTheoreticalQtyOrder[i]),t.xp6(1),t.Q6J("ngIf","edit"==s.editCmm[i]||"edit"==s.editQtyValidated[i]||"edit"==s.editQtyDelivered[i]||"edit"==s.editObservations[i]||"edit"==s.editTheoreticalQtyOrder[i]||"true"==s.isUpdateLoading[i]),t.xp6(2),t.Q6J("id","export_table"+i),t.xp6(42),t.Gre("fas ","edit"==s.editCmm[i]?"fa-times":"fa-edit",""),t.xp6(5),t.Gre("fas ","edit"==s.editTheoreticalQtyOrder[i]?"fa-times":"fa-edit",""),t.xp6(10),t.Gre("fas ","edit"==s.editQtyValidated[i]?"fa-times":"fa-edit",""),t.xp6(3),t.Gre("fas ","edit"==s.editQtyDelivered[i]?"fa-times":"fa-edit",""),t.xp6(7),t.Gre("fas ","edit"==s.editObservations[i]?"fa-times":"fa-edit",""),t.xp6(21),t.Q6J("ngForOf",s.objectKeys(e.data)),t.xp6(1),t.Q6J("ngIf",i<s.FinalChwsOutputData$.length-1)}}function pt(n,o){if(1&n&&(t.TgZ(0,"div"),t.YNc(1,gt,104,28,"div",32),t.qZA()),2&n){const e=t.oxw();t.xp6(1),t.Q6J("ngForOf",e.FinalChwsOutputData$)}}const mt=[{path:"",redirectTo:"chws",pathMatch:"full"},{path:"chws",component:(()=>{class n{constructor(e,i,s){this.store=e,this.auth=i,this.sync=s,this.roles=new b.G7(this.store),this.chwOU=null,this.data_error_messages="",this.data_no_data_found=!1,this.FinalChwsOutputData$=[],this.selectedChwData=null,this.ChwsDataFromDbError="",this.Districts$=[],this.Sites$=[],this.Chws$=[],this.Months$=[],this.Years$=[],this.chw$=[],this.site$=[],this.Sources$=["Tonoudayo"],this.Forms$=["drug_movements","drug_quantities","pcime_c_asc","pregnancy_family_planning","fp_follow_up_renewal"],this.drugUpdateErrorMsg="",this.isUpdateLoading=[],this.editCmm=[],this.editQtyValidated=[],this.editQtyDelivered=[],this.editObservations=[],this.editTheoreticalQtyOrder=[],this.isNumber=r=>!isNaN(2),this.showClass=r=>this.isNumber(r)?"col-sm-6 col-6":"",this.roles.hasNoAccess()&&this.auth.logout(),!this.roles.isSupervisorMentor()&&!this.roles.isChws()&&(location.href=this.auth.getUser()?.defaultRedirectUrl??"")}createDataFilterFormGroup(){return new _.cw({month:new _.NI(this.month$.id,[_.kI.required]),year:new _.NI(this.year$,[_.kI.required]),sources:new _.NI(""),districts:new _.NI("",this.roles.isChws()?[]:[_.kI.required]),sites:new _.NI("",this.roles.isChws()?[]:[_.kI.required]),chws:new _.NI("")})}editCmmClick(e,i=!1){this.editCmm[e]=1==i?this.editCmm[e]="":"edit"==this.editCmm[e]?"":"edit"}editQtyValidatedClick(e,i=!1){this.editQtyValidated[e]=1==i?this.editQtyValidated[e]="":"edit"==this.editQtyValidated[e]?"":"edit"}editQtyDeliveredClick(e,i=!1){this.editQtyDelivered[e]=1==i?this.editQtyDelivered[e]="":"edit"==this.editQtyDelivered[e]?"":"edit"}editObservationsClick(e,i=!1){this.editObservations[e]=1==i?this.editObservations[e]="":"edit"==this.editObservations[e]?"":"edit"}editTheoreticalQtyOrderClick(e,i=!1){this.editTheoreticalQtyOrder[e]=1==i?this.editTheoreticalQtyOrder[e]="":"edit"==this.editTheoreticalQtyOrder[e]?"":"edit"}ngOnInit(){this.chwOU=this.auth.chwsOrgUnit(),this.roles.isChws()&&(null==this.chwOU||!(0,d.Nf)(this.chwOU))&&(location.href="chws/select_orgunit"),this.isLoading=!1,this.initDate=d.ED.startEnd21and20Date(),this.Months$=d.FI.months(),this.Years$=d.FI.getYearsList(),this.year$=d.FI.currentYear(this.initDate.end_date),this.month$=d.FI.currentMonth(this.initDate.end_date),this.chwsDrugDataForm=this.createDataFilterFormGroup(),this.roles.isChws()?this.initDataFilted():this.initAllData()}saveOrUpdate(e,i){if(e.preventDefault(),this.FinalChwsOutputData$.length>0){this.isUpdateLoading[i]="true";const c=this.FinalChwsOutputData$[0];var s=0;const a=this.objectKeys(c.data).length;for(let l=0;l<a;l++){const u=this.getKey(this.toChwsDrugData(this.sortedArray(c.data),l).key),f=this.getLabel(this.toChwsDrugData(this.sortedArray(c.data),l).key),g=this.getDataInfo(i);if(g&&g.district&&g.site&&g.chw){const D=this.getValue(`year_cmm_${i}_${u}`),Z=this.getValue(`quantity_validated_${i}_${u}`),y=this.getValue(`delivered_quantity_${i}_${u}`),T=this.getValue(`observations_${i}_${u}`),A=this.getValue(`theoretical_quantity_to_order_${i}_${u}`);D?.index!=u&&Z?.index!=u&&y?.index!=u&&T?.index!=u&&A?.index!=u||this.sync.ihDrugUpdateDataPerChw({year:this.chwsDrugDataForm.value.year,month:this.chwsDrugDataForm.value.month,district:g.district,site:g.site,chw:g.chw,drug_index:u,drug_name:f,year_cmm:D?.value,quantity_validated:Z?.value,delivered_quantity:y?.value,theoretical_quantity_to_order:A?.value,observations:T?.value,forms:this.Forms$,sources:this.Sources$}).subscribe(p=>{if(s+=1,200==p.status){if(s==a-1&&p.data){const vt=this.FinalChwsOutputData$.map(x=>x.chwId==g.chw?p.data[0]:x);this.FinalChwsOutputData$=vt.sort((x,Ct)=>x.chw.external_id.localeCompare(Ct.chw.external_id)),this.editCmmClick(i,!0),this.editQtyValidatedClick(i,!0),this.editQtyDeliveredClick(i,!0),this.editObservationsClick(i,!0),this.editTheoreticalQtyOrderClick(i,!0)}}else this.drugUpdateErrorMsg+=p.data.toString();s==a-1&&(this.isUpdateLoading[i]="false")},p=>{this.drugUpdateErrorMsg+=p.toString(),this.isUpdateLoading[i]="false"})}}}}getValue(e){const i=document.getElementById(e);if(null!=i){const s=i.dataset.drugIndex;return{value:i.value,index:s?parseInt(s):void 0}}}getDataInfo(e){const i=document.getElementById(`data-info-${e}`);if(null!=i)return{district:i.dataset.district??"",site:i.dataset.site??"",chw:i.dataset.chw??""}}showHideMsg(e){}convertQty(e){return 0==e||""==e||null==e?void 0:e}toChwsDrugData(e,i){const s=e[parseInt(i)];return{key:s[0],val:s[1]}}sortedArray(e){return Object.entries(e).sort((i,s)=>{const r=i[0].split("_"),c=s[0].split("_");return parseInt(r[r.length-1])-parseInt(c[c.length-1])})}objectKeys(e){return Object.keys(this.sortedArray(e))}getKey(e){const i=e.split("_");return parseInt(i[i.length-1])}getLabel(e){return e.split("_").slice(0,-1).join(" ")}csv(e){table2csv("data2csv",",",e)}excel(e){table2excel("data2excel",e)}pdf(e){table2pdf("data2pdf","l",e)}json(e){table2json("data2json",e)}print(e){printTable("data2print",e)}initAllData(){var e=this;return(0,m.Z)(function*(){e.isLoading=!0;const i=e.ParamsToFilter();e.initMsg="Chargement des Districts ...",e.sync.getDistrictsList(i).subscribe(function(){var s=(0,m.Z)(function*(r){200==r.status&&(e.Districts$=r.data.sort((c,a)=>c.name.localeCompare(a.name))),e.initMsg="Chargement des Sites ...",e.sync.getSitesList(i).subscribe(function(){var c=(0,m.Z)(function*(a){200==a.status&&(e.Sites$=a.data.sort((l,u)=>l.name.localeCompare(u.name))),e.genarateSites(),e.initMsg="Chargement des ASC ...",e.sync.getChwsList(i).subscribe(function(){var l=(0,m.Z)(function*(u){200==u.status&&(e.Chws$=u.data.sort((f,g)=>f.name.localeCompare(g.name))),e.genarateChws(),e.isLoading=!1});return function(u){return l.apply(this,arguments)}}(),l=>{e.isLoading=!1,console.log(l.error)})});return function(a){return c.apply(this,arguments)}}(),c=>{e.isLoading=!1,console.log(c.error)})});return function(r){return s.apply(this,arguments)}}(),s=>{e.isLoading=!1,console.log(s.error)})})()}genarateSites(){this.site$=[],this.chw$=[];const e=d.FI.returnEmptyArrayIfNul(this.chwsDrugDataForm.value.districts);if(this.chwsDrugDataForm.value.sites=[],this.chwsDrugDataForm.value.chws=[],(0,d.Nf)(e))for(let i=0;i<this.Sites$.length;i++){const s=this.Sites$[i];(0,d.Nf)(s)&&e.includes(s.district.id)&&this.site$.push(s)}else this.site$=[]}genarateChws(){const e=d.FI.returnEmptyArrayIfNul(this.chwsDrugDataForm.value.sites);if(this.chw$=[],this.chwsDrugDataForm.value.chws=[],(0,d.Nf)(e))for(let i=0;i<this.Chws$.length;i++){const s=this.Chws$[i];(0,d.Nf)(s)&&e.includes(s.site.id)&&this.chw$.push(s)}else this.chw$=[]}ParamsToFilter(){const e=this.chwsDrugDataForm.value.month,i=this.chwsDrugDataForm.value.year,s=this.chwsDrugDataForm.value.sources;(0,d.Nf)(s)&&d.FI.returnDataAsArray(s);var c=[],a=[],l=[];this.roles.isChws()?null!=this.chwOU&&(0,d.Nf)(this.chwOU)&&(c=d.FI.returnDataAsArray(this.chwOU.site.district.id),a=d.FI.returnDataAsArray(this.chwOU.site.id),l=d.FI.returnDataAsArray(this.chwOU.id),this.chw$=[this.chwOU]):(c=d.FI.returnEmptyArrayIfNul(this.chwsDrugDataForm.value.districts),a=d.FI.returnEmptyArrayIfNul(this.chwsDrugDataForm.value.sites),l=d.FI.returnEmptyArrayIfNul(this.chwsDrugDataForm.value.chws));const u=d.FI.previousMonth(e);return{start_date:`${"12"==u?parseInt(i)-1:i}-${u}-21`,end_date:`${i}-${e}-20`,sources:this.Sources$,districts:c,sites:a,chws:l,forms:this.Forms$}}sort(e){return sortTable(e)}initDataFilted(e){this.isLoading=!0;const i=e??this.ParamsToFilter();this.defaultParams?.start_date!=i.start_date||this.defaultParams?.end_date!=i.end_date||this.defaultParams?.districts!=i.districts||this.defaultParams?.sites!=i.sites?this.sync.ihDrugDataPerChw(i).subscribe(s=>{this.response$=s,this.startTraitement(i)},s=>{this.isLoading=!1,this.ChwsDataFromDbError=s.toString()}):this.startTraitement(i)}startTraitement(e){this.isLoading=!0;const i=e??this.ParamsToFilter();200==this.response$.status?(this.FinalChwsOutputData$=this.response$.data.sort((r,c)=>r.chw.external_id.localeCompare(c.chw.external_id)),this.defaultParams=i,this.data_no_data_found=this.FinalChwsOutputData$.length<=0):(this.data_error_messages=this.response$.data.toString(),this.data_no_data_found=!0),this.isLoading=!1}}return n.\u0275fac=function(e){return new(e||n)(t.Y36(Q.u),t.Y36(O.e),t.Y36(I._))},n.\u0275cmp=t.Xpm({type:n,selectors:[["app-chws-drug"]],decls:28,vars:11,consts:[[1,"content-header"],[1,"container-fluid"],[1,"card","card-info"],[1,"title",2,"text-align","center","color","blue"],[1,"overlay-wrapper"],["class","overlay",4,"ngIf"],[1,"card-header"],["novalidate","",3,"formGroup","ngSubmit"],[1,"row"],["class","col-sm-2 col-6",4,"ngIf"],[1,"col-sm-2","col-6"],[1,"form-group"],[2,"color","white"],["type","submit",1,"btn","btn-primary","form-control",3,"disabled"],[1,"fa","fa-floppy-o","fa-right"],[1,"content"],[1,"col-sm-5"],[4,"ngIf"],[1,"overlay"],[1,"fas","fa-3x","fa-sync-alt","fa-spin"],[1,"text-bold","pt-2"],["class","form-control","formControlName","month",4,"ngIf"],["formControlName","month",1,"form-control"],[3,"value",4,"ngFor","ngForOf"],[3,"value"],["class","form-control","formControlName","year",4,"ngIf"],["formControlName","year",1,"form-control"],["class","form-control","formControlName","districts",3,"multiple","change",4,"ngIf"],["formControlName","districts",1,"form-control",3,"multiple","change"],["formControlName","sites",1,"form-control",3,"multiple","change"],["formControlName","chws",1,"form-control",3,"multiple"],[1,"card-body"],[4,"ngFor","ngForOf"],[3,"id"],["novalidate","",3,"submit"],[1,"card"],[1,"card-title"],[1,"chw-info",2,"color","blue","font-size","20px"],["class","submit","type","submit","class","submit-btn btn btn-warning",3,"disabled",4,"ngIf"],[2,"overflow-x","scroll!important"],[1,"table","table-sm","table-striped",2,"margin","auto",3,"id"],[1,"bg-info","head-elem"],["rowspan","2"],[3,"click"],["colspan","9"],["type","submit",1,"submit-btn","btn","btn-warning",3,"disabled"],["style","margin-right: 20px!important;","class","fas fa-1x fa-sync-alt fa-spin",4,"ngIf"],[1,"fas","fa-1x","fa-sync-alt","fa-spin",2,"margin-right","20px!important"],[1,"ajust-cells"],["class","custom-input form-control","type","number",3,"disabled","id","value",4,"ngIf"],[1,"same-line"],["class","fas fa-eye",3,"click",4,"ngIf"],["class","custom-textarea form-control",3,"disabled","id","value",4,"ngIf"],["type","number",1,"custom-input","form-control",3,"disabled","id","value"],[1,"fas","fa-eye",3,"click"],[1,"custom-textarea","form-control",3,"disabled","id","value"]],template:function(e,i){1&e&&(t.TgZ(0,"section",0)(1,"div",1)(2,"div",2)(3,"h2",3),t._uU(4,"Situation M\xe9dicament Des ASC"),t.qZA(),t.TgZ(5,"div",4),t.YNc(6,$,4,1,"div",5),t.TgZ(7,"div",6)(8,"form",7),t.NdJ("ngSubmit",function(){return i.initDataFilted()}),t.TgZ(9,"div",8),t.YNc(10,M,5,1,"div",9),t.YNc(11,E,5,1,"div",9),t.YNc(12,L,5,1,"div",9),t.YNc(13,S,6,2,"div",9),t.YNc(14,K,6,2,"div",9),t.TgZ(15,"div",10)(16,"div",11)(17,"label",12),t._uU(18,"."),t.qZA(),t.TgZ(19,"button",13),t._uU(20," Charger "),t._UZ(21,"span",14),t.qZA()()()()()()()(),t.TgZ(22,"div",15)(23,"div",1)(24,"div",16),t.YNc(25,H,4,1,"h2",17),t.YNc(26,V,4,0,"h2",17),t.qZA(),t.YNc(27,pt,2,1,"div",17),t.qZA()()()()),2&e&&(t.xp6(6),t.Q6J("ngIf",i.isLoading),t.xp6(2),t.Q6J("formGroup",i.chwsDrugDataForm),t.xp6(2),t.Q6J("ngIf",!i.roles.isChws()),t.xp6(1),t.Q6J("ngIf",!i.roles.isChws()),t.xp6(1),t.Q6J("ngIf",!i.roles.isChws()),t.xp6(1),t.Q6J("ngIf",!i.roles.isChws()),t.xp6(1),t.Q6J("ngIf",!i.roles.isChws()),t.xp6(5),t.Q6J("disabled",!i.chwsDrugDataForm.valid),t.xp6(6),t.Q6J("ngIf",""!=i.data_error_messages),t.xp6(1),t.Q6J("ngIf",1==i.data_no_data_found),t.xp6(1),t.Q6J("ngIf",""==i.data_error_messages&&i.FinalChwsOutputData$.length>0))},dependencies:[v.sg,v.O5,_._Y,_.YN,_.Kr,_.EJ,_.K7,_.JJ,_.JL,_.sg,_.u],styles:[".fa-times[_ngcontent-%COMP%]{color:red;font-size:25px}.fa-edit[_ngcontent-%COMP%]{color:orange;font-size:25px}.custom-input[_ngcontent-%COMP%]{width:90px!important;height:23px!important;margin:-2.5px 0 0!important;padding:1px!important}.custom-textarea[_ngcontent-%COMP%]{width:200px!important;height:23px!important;margin:-2.5px 0 0!important;padding:1px!important}.same-line[_ngcontent-%COMP%]{white-space:nowrap}.same-line[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .same-line[_ngcontent-%COMP%]   i[_ngcontent-%COMP%], .same-line[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{display:inline-block;vertical-align:top}.same-line[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{cursor:pointer;margin-left:2.5px}.same-line[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{width:130px!important;height:15px!important;overflow:hidden}.ajust-cells[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{width:265px!important}.ajust-cells[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{width:90px!important;height:0px!important}.submit-btn[_ngcontent-%COMP%]{min-width:200px!important;margin-right:20px;float:right}.card-title[_ngcontent-%COMP%]{width:100%!important}.chw-info[_ngcontent-%COMP%]{float:left!important}ul[_ngcontent-%COMP%]{list-style-type:none;margin:0;padding:0;overflow:hidden;float:right!important}li[_ngcontent-%COMP%]{background-color:#333;float:right}li[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{display:block;color:#fff;text-align:center;padding:2px 5px;text-decoration:none;font-size:12px;cursor:pointer}li[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:hover{background-color:#111}"]}),n})(),canActivate:[q.a,U.p],data:{href:"chws_drug",icon:"fa fa-user",label:"chws_drug",title:"Situation M\xe9dicament ASC"}}];let ft=(()=>{class n{}return n.\u0275fac=function(e){return new(e||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[w.Bz.forChild(mt),w.Bz]}),n})(),xt=(()=>{class n{}return n.\u0275fac=function(e){return new(e||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[v.ez,_.UX,ft]}),n})()}}]);