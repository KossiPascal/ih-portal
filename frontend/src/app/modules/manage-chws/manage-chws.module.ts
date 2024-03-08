import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageChwsRoutingModule } from './manage-chws-routing.module';
import { ChwsReplacementManageComponent } from './chws_manage/chws_manage-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DrugPerChwManageComponent } from './drug_per_chw/drug_per_chw.component';
import { DrugPerSelectedManageComponent } from './drug_per_selected/drug_per_selected.component';
import { SharedModule } from '@ih-src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ManageChwsRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [ChwsReplacementManageComponent, DrugPerChwManageComponent, DrugPerSelectedManageComponent]
})
export class ManageChwsModule { }


