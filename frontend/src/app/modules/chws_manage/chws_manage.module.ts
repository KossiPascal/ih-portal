import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChwsManageRoutingModule } from './chws_manage-routing.module';
import { ChwsManageComponent } from './chws_manage-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectOrgUnitComponent } from './chw_select_orgunit.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChwsManageRoutingModule
  ],
  declarations: [ChwsManageComponent, SelectOrgUnitComponent]
})
export class ChwsManageModule { }

