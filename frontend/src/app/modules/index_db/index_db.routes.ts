import { Routes, Router} from '@angular/router';
import { AuthGuard } from '@ih-app/services/auth-guard.service';
import { IndexDbItemListComponent } from './indexdb_items.component';


export const routes:Routes = [
  { path: 'indexdbitemlist', component: IndexDbItemListComponent, data: {title: 'IndexDb'}},
  
];

