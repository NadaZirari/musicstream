import { Routes } from '@angular/router';
import { LibraryComponent } from './pages/library';

export const LIBRARY_ROUTES: Routes = [
  {
    path: '',
    component: LibraryComponent,
    title: 'Music Library'
  }
];
