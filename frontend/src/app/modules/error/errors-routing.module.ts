import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@ih-app/services/auth-guard.service';
import { ErrorComponent } from './error.component';


function redirectTo(): string{
    // window.location.reload();
    // location.href = 'error/404';
  return '404';
}
export const routes:Routes = [
  { path: '', redirectTo:redirectTo(), pathMatch: 'full' },
  { path: ':code', component: ErrorComponent, data: {title: 'Error'}},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorsRoutingModule { }
