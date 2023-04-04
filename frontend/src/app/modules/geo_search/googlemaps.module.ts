import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsRoutingModule } from './googlemaps-routing.module';
import { GooglemapComponent } from './googlemap.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GoogleMapsRoutingModule,
  ],
  declarations: [GooglemapComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GoogleMapsModule { }
