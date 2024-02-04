import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageDataRoutingModule } from './manage-data-routing.module';
import { SyncToDhis2Component } from './sync-to-dhis2/sync-to-dhis2.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SyncOrgUnitDataComponent } from './sync-orgunit-data/sync-orgunit-data.component';
import { FullOrgUnitDataSyncComponent } from './full-orgunit-data-sync/full-orgunit-data-sync.component';
import { SyncWeeklyDataComponent } from './sync-weekly-data/sync-weekly-data.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ManageDataRoutingModule
  ],
  declarations: [FullOrgUnitDataSyncComponent,SyncToDhis2Component,SyncWeeklyDataComponent,SyncOrgUnitDataComponent,FullOrgUnitDataSyncComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ManageDataModule { }
