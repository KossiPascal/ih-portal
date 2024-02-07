import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DatabaseUtilsComponent } from './database/database_utils.component';
import { UserSafeHtmlPipe } from '@ih-src/app/pipes/userpipe';
import { DocumentationComponent } from './documentation/documentation.component';
import { UserComponent } from './user-list/user-list.component';
import { RoleComponent } from './role/role-list.component';
import { ApiComponent } from './api-list/api-list.component';


@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [DatabaseUtilsComponent,DocumentationComponent,UserComponent,RoleComponent, ApiComponent, UserSafeHtmlPipe]
})
export class AdminModule { }



