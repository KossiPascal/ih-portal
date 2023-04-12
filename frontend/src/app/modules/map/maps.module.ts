import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapsRoutingModule } from './maps-routing.module';
import { GooglemapComponent } from './goolemap/googlemap.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HighchartMap1Component } from './highchart1/highchart1.component';
import { HighchartMap2Component } from './highchart2/highchart2.component';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MapsRoutingModule,
    HighchartsChartModule
  ],
  declarations: [GooglemapComponent, HighchartMap1Component, HighchartMap2Component],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapsModule { }
