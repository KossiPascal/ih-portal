import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DatabaseUtilsComponent } from './database/database_utils.component';
import { UserSafeHtmlPipe } from '@ih-src/app/pipes/userpipe';
import { DocumentationComponent } from './documentation/documentation.component';
import { UserComponent } from './user/user-list.component';
import { RoleComponent } from './role/role-list.component';


@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [DatabaseUtilsComponent,DocumentationComponent,UserComponent,RoleComponent, UserSafeHtmlPipe]
})
export class AdminModule { }



