import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncsRoutingModule } from './syncs-routing.module';
import { SyncComponent } from './sync.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SyncsRoutingModule
  ],
  declarations: [SyncComponent]
})
export class SyncsModule { }
