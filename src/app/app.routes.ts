import { Routes } from '@angular/router';
import { LibraryComponent } from './features/library/pages/library/library.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/library/pages/library/library.component').then(m => m.LibraryComponent)
  }
];
