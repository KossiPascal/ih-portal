import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IhDrugRoutingModule } from './ih_drug-routing.module';
import { ChwsDrugComponent } from './chws_drug/chws_drug.component';

@NgModule({
  declarations: [ChwsDrugComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IhDrugRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class IhDrugModule { }
