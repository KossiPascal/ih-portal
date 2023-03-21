import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { Dashboard1Component } from './dash1/dashboard-1.component';
import { Dashboard2Component } from './dash2/dashboard-2.component';
import { Dashboard3Component } from './dash3/dashboard-3.component';
import { TableExportComponent } from '@ih-app/components/table-export.component';
import { SortDirective } from '@ih-app/directive/sort.directive';

@NgModule({
  declarations: [Dashboard1Component,Dashboard2Component,Dashboard3Component,TableExportComponent,SortDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class DashboardsModule { }
