import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { DashboardOneComponent } from './dash1/dashboard-1.component';
import { DashboardTwoComponent } from './dash2/dashboard-2.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardsRoutingModule
  ],
  declarations: [DashboardOneComponent,DashboardTwoComponent]
})
export class DashboardsModule { }
