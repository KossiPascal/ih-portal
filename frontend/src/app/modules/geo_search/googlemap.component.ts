import { Component, OnInit } from '@angular/core';

@Component({

    selector: 'googlemaps',
    templateUrl: `./googlemap.component.html`,
    styleUrls: [
        './googlemap.component.css'
    ],
})
export class GooglemapComponent implements OnInit {

  lat:number = 24
  lng:number = 12
  
  constructor() {}
  ngOnInit(): void {}
  display: any;
  center: google.maps.LatLngLiteral = {
      lat: 24,
      lng: 12
  };
  zoom = 4;
  moveMap(event: google.maps.MapMouseEvent) {
      if (event.latLng != null) this.center = (event.latLng.toJSON());
  }
  move(event: google.maps.MapMouseEvent) {
      if (event.latLng != null) this.display = event.latLng.toJSON();
  }
}
