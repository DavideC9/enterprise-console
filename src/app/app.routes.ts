import {Routes} from '@angular/router';
import {guestGuard} from './core/guards/guest.guard';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {path: '', redirectTo: 'sections', pathMatch: 'full'},
      {
        path: 'sections',
        loadComponent: () =>
          import('./features/sections/list/sections-list.component').then(
            (m) => m.SectionsListComponent
          ),
      },
      {
        path: 'sections/new',
        loadComponent: () =>
          import('./features/sections/form/section-form.component').then(
            (m) => m.SectionFormComponent
          ),
      },
      {
        path: 'sections/edit/:key',
        loadComponent: () =>
          import('./features/sections/form/section-form.component').then(
            (m) => m.SectionFormComponent
          ),
      },
    ],
  },
  {path: '**', redirectTo: ''},
];
