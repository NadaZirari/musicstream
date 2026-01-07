import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'library',
    loadComponent: () =>
      import('./features/library/pages/library/library.component')
        .then(c => c.LibraryComponent)
  },
  {
    path: 'track/:id',
    loadComponent: () =>
      import('./features/track/pages/track/track.component')
        .then(c => c.TrackComponent)
  },
  {
    path: '',
    redirectTo: 'library',
    pathMatch: 'full'
  }
];
