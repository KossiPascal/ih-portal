import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { UserComponent } from './user-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserSafeHtmlPipe } from '@ih-src/app/pipes/userpipe';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UsersRoutingModule
  ],
  declarations: [
    UserComponent,
    UserSafeHtmlPipe
  ]
})
export class UsersModule { }

