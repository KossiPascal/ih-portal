import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  
  { path: '', redirectTo: 'auths', pathMatch: 'full' },
  { path: 'auths', loadChildren: () => import('./modules/auth/auths.module').then(m => m.AuthsModule)},
  { path: 'users', loadChildren: () => import('./modules/user/users.module').then(m => m.UsersModule)},
  { path: 'dashboards', loadChildren: () => import('./modules/dashboard/dashboards.module').then(m => m.DashboardsModule)},
  { path: 'docs', loadChildren: () => import('./modules/documentation/documentations.module').then(m => m.DocumentationsModule)},
  { path: 'fetch', loadChildren: () => import('./modules/sync/syncs.module').then(m => m.SyncsModule)},
  { path: 'error', loadChildren: () => import('./modules/error/errors.module').then(m => m.ErrorsModule)},
  { path: '**', redirectTo: 'error' },
  
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    SharedModule,
    // RouterModule.forRoot(routes)
    RouterModule.forRoot(routes, { useHash: false, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
