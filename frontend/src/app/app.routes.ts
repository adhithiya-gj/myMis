import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { EntryComponent } from './features/entry/entry.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SettingsComponent } from './features/settings/settings.component';
import { UpdateEntryComponent } from './features/update-entry/update-entry.component';
import { LayoutComponent } from './core/layout/layout.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'welcome', component: WelcomeComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'entry', component: EntryComponent },
      { path: 'update-entry/:id', component: UpdateEntryComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
