import { Routes } from '@angular/router';
import { signInGuard } from './auth/sign-in/sign-in.guard';
import { authGuard } from './auth/auth.guard';
import { permissionGuard } from './auth/permission.guard';
import { TYPES } from '../../../app-nest/src/types';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products-list/products-list.component').then(m => m.ProductsListComponent),
        canActivate: [permissionGuard],
        data: { permission: TYPES.PERMISSION.PRODUCT.READ }
      },
      {
        path: 'products/add',
        loadComponent: () => import('./products/products-form/products-form.component').then(m => m.ProductsFormComponent),
        canActivate: [permissionGuard],
        data: { permission: TYPES.PERMISSION.PRODUCT.CREATE }
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./products/products-form/products-form.component').then(m => m.ProductsFormComponent),
        canActivate: [permissionGuard],
        data: { permission: TYPES.PERMISSION.PRODUCT.READ }
      },
      {
        path: 'roles',
        loadComponent: () => import('./roles/roles-list/roles-list.component').then(m => m.RolesListComponent),
        canActivate: [permissionGuard],
        data: { permission: TYPES.PERMISSION.SUPERUSER }
      },
      {
        path: 'roles/add',
        loadComponent: () => import('./roles/roles-form/roles-form.component').then(m => m.RolesFormComponent),
        canActivate: [permissionGuard],
        data: { permission: TYPES.PERMISSION.SUPERUSER }
      },
      {
        path: 'roles/:id',
        loadComponent: () => import('./roles/roles-form/roles-form.component').then(m => m.RolesFormComponent),
        canActivate: [permissionGuard],
        data: { permission: TYPES.PERMISSION.SUPERUSER }
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users-list/users-list.component').then(m => m.UsersListComponent),
        canActivate: [permissionGuard],
        data: { permission: TYPES.PERMISSION.SUPERUSER }
      },
      {
        path: 'users/add',
        loadComponent: () => import('./users/users-form/users-form.component').then(m => m.UsersFormComponent),
        canActivate: [permissionGuard],
        data: { permission: TYPES.PERMISSION.SUPERUSER }
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./users/users-form/users-form.component').then(m => m.UsersFormComponent),
        canActivate: [permissionGuard],
        data: { permission: TYPES.PERMISSION.SUPERUSER }
      }
    ]
  },
  {
    path: 'auth/sign-in',
    loadComponent: () => import('./auth/sign-in/sign-in.component').then(m => m.SignInComponent),
    canActivate: [signInGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./page404/page404.component').then(m => m.Page404Component)
  }
];
