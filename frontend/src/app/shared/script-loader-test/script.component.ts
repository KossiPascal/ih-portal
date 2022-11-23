import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from './script-loader.service';

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html'
})
export class ScriptComponent implements OnInit {

  constructor(private scriptLoaderService: ScriptLoaderService) {
    this.scriptLoaderService.loadStyles('fancybox-css').then(x => {
      this.scriptLoaderService.load('jquery', 'fancybox').then(data => {
      }).catch(error => console.log(error));
    });
  }

  ngOnInit(): void {
  }

}
