import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@ih-app/services/auth-guard.service';
import { ErrorComponent } from './error.component';


function redirectTo(): string{
    // window.location.reload();
    // location.href = 'error/404';
  return 'errorFound/404';
}
export const routes:Routes = [
  { path: 'errorFound/:code', component: ErrorComponent , canActivate: [AuthGuard], data: {title: 'Error'}},
  { path: '**', redirectTo:redirectTo() },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorsRoutingModule { }
