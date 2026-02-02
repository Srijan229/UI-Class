import { Routes } from '@angular/router';
import { ItemDetailComponent } from './items/item-detail.component';
import { ItemFormComponent } from './items/item-form.component';
import { ItemListComponent } from './items/item-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'items' },
  { path: 'items', component: ItemListComponent },
  { path: 'items/new', component: ItemFormComponent },
  { path: 'items/:id', component: ItemDetailComponent },
  { path: 'items/:id/edit', component: ItemFormComponent },
  { path: '**', redirectTo: 'items' }
];
