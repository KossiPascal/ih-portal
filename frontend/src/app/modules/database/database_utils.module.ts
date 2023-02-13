import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseUtilsRoutingModule } from './database-routing.module';
import { DatabaseUtilsComponent } from './database_utils.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatabaseUtilsRoutingModule
  ],
  declarations: [DatabaseUtilsComponent]
})
export class DatabaseUtilsModule { }

