import { Routes } from '@angular/router';
import { IndexDbItemListComponent } from './indexdb_items.component';


export const routes:Routes = [
  { path: 'indexdbitemlist', component: IndexDbItemListComponent, data: {title: 'IndexDb'}},
  
];

