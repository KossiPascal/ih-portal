import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewChwsDataRoutingModule } from './view-chws-data-routing.module';
import { Dashboard1Component } from './dash1/dashboard-1.component';
import { Dashboard2Component } from './dash2/dashboard-2.component';
import { Dashboard3Component } from './dash3/dashboard-3.component';
import { Dashboard4Component } from './dash4/dashboard-4.component';
import { Dashboard5Component } from './dash5/dashboard-5.component';
import { TableExportComponent } from '@ih-src/app/components/table-export/table-export.component';
import { SortDirective } from '@ih-src/app/directive/sort.directive';
import { GooglemapComponent } from './goolemap/googlemap.component';
import { MapChartComponent } from './map-chart/map-chart.component';
import { HighchartMap1Component } from './highchart1/highchart1.component';
import { HighchartMap2Component } from './highchart2/highchart2.component';

@NgModule({
  declarations: [
    Dashboard1Component,
    Dashboard2Component,
    Dashboard3Component,
    Dashboard4Component,
    Dashboard5Component,
    GooglemapComponent,
    MapChartComponent,
    HighchartMap1Component,
    HighchartMap2Component,
    TableExportComponent,
    SortDirective 
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ViewChwsDataRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class ViewChwsDataModule { }
