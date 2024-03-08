import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';

const routes: Routes = [
  { path: '', redirectTo: 'auths', pathMatch: 'full' },
  { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)},
  { path: 'auths', loadChildren: () => import('./modules/auths/auths.module').then(m => m.AuthsModule)},
  { path: 'chws', loadChildren: () => import('./modules/chws/chws.module').then(m => m.ChwsModule)},
  { path: 'view-chws-data', loadChildren: () => import('./modules/view-chws-data/view-chws-data.module').then(m => m.ViewChwsDataModule)},
  { path: 'manage-chws', loadChildren: () => import('./modules/manage-chws/manage-chws.module').then(m => m.ManageChwsModule)},
  { path: 'manage-data', loadChildren: () => import('./modules/manage-data/manage-data.module').then(m => m.ManageDataModule)},
  { path: 'manage-reports', loadChildren: () => import('./modules/manage-reports/manage-reports.module').then(m => m.ManageReportModule)},
  { path: '**', redirectTo: 'auths/error/404' },
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forRoot(routes, { useHash: false, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
