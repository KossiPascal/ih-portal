import { NgModule } from '@angular/core';
// import { UtilsPipe } from '../pipes/utils.pipe';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../pipes/safe-html-pipe';

@NgModule({
  declarations: [
    // UtilsPipe, 
    SafeHtmlPipe
  ],
  imports: [CommonModule],
  exports: [
    // UtilsPipe, 
    SafeHtmlPipe
  ]
})
export class SharedModule { }
