import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncsRoutingModule } from './syncs-routing.module';
import { SyncComponent } from './sync.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SyncOrgUnitDataComponent } from './sync-orgunit-data.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SyncsRoutingModule
  ],
  declarations: [SyncComponent,SyncOrgUnitDataComponent]
})
export class SyncsModule { }

