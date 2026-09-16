import { Routes } from '@angular/router';
import { Shipments } from './shipments/shipments';

export const routes: Routes = [
  { path: '', component: Shipments },
  { path: '**', redirectTo: '' },
];
