import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { ManageReportRoutingModule } from './manage-reports-routing.module';
import { MeetingReportComponent } from './meeting_report/meeting_report.component';
import { SafeHtmlPipe } from '@ih-src/app/pipes/pipe';

@NgModule({
  declarations: [
    MeetingReportComponent,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ManageReportRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class ManageReportModule { }
