import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageChwsRoutingModule } from './manage-chws-routing.module';
import { ChwsReplacementManageComponent } from './chws_manage/chws_manage-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChwsDrugManageComponent } from './chws_drug/chws_drug.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ManageChwsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [ChwsReplacementManageComponent, ChwsDrugManageComponent]
})
export class ManageChwsModule { }


