import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CachesRoutingModule } from './caches-routing.module';
import { CacheComponent } from './cache.component';


@NgModule({
  imports: [
    CommonModule,
    CachesRoutingModule
  ],
  declarations: [CacheComponent]
})
export class CachesModule { }
