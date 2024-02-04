import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ChwsRoutingModule } from './chws-routing.module';
import { SelectOrgUnitComponent } from './chw_select_orgunit/chw_select_orgunit.component';
import { ChwsDashboard1Component } from './dash1/dashboard-1.component';
import { ChwsDashboard2Component } from './dash2/dashboard-2.component';
import { ChwsDashboard3Component } from './dash3/dashboard-3.component';
import { ChwsDashboard4Component } from './dash4/dashboard-4.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChwsRoutingModule
  ],
  declarations: [ChwsDashboard1Component, ChwsDashboard2Component, ChwsDashboard3Component, ChwsDashboard4Component, SelectOrgUnitComponent]
})
export class ChwsModule { }

