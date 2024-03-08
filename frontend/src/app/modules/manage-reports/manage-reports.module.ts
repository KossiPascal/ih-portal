import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { ManageReportRoutingModule } from './manage-reports-routing.module';
import { MeetingReportComponent } from './meeting_report/meeting_report.component';
import { GuestMeetingReportComponent } from './guest_meeting_report/guest_meeting_report.component';
import { SharedModule } from '@ih-src/app/shared/shared.module';

@NgModule({
  declarations: [
    MeetingReportComponent,
    GuestMeetingReportComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ManageReportRoutingModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class ManageReportModule { }
