import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentationComponent } from './documentation/documentation.component';
import { UserComponent } from './user-list/user-list.component';
import { RoleComponent } from './role/role-list.component';
import { ApiComponent } from './api-list/api-list.component';
import { SharedModule } from '@ih-src/app/shared/shared.module';
import { TruncateDatabaseComponent } from './truncate_database/truncate_database.component';
import { DeleteCouchdbDataComponent } from './delete_couchdb_data/delete_couchdb_data.component';


@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    DeleteCouchdbDataComponent,
    TruncateDatabaseComponent,
    DocumentationComponent,
    UserComponent,
    RoleComponent,
    ApiComponent,
  ]
})
export class AdminModule { }



