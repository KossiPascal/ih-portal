import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentationsRoutingModule } from './documentations-routing.module';
import { DocumentationComponent } from './documentation.component';

@NgModule({
  imports: [
    CommonModule,
    DocumentationsRoutingModule
  ],
  declarations: [DocumentationComponent]
})

export class DocumentationsModule { }
