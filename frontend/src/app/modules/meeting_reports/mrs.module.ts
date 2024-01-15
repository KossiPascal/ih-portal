import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { IhMeetingReportRoutingModule } from './mrs-routing.module';
import { MeetingReportComponent } from './mr.component';
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
    IhMeetingReportRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class IhMeetingReportModule { }
