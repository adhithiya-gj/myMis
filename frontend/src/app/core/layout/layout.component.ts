import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Global Navigation Bar -->
      <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-8">
              <!-- Logo -->
              <div class="flex-shrink-0 flex items-center">
                <a routerLink="/welcome">
                  <img class="h-10 w-auto" src="logo.png" alt="SAN Law Partners LLP">
                </a>
              </div>
              
              <!-- Primary Nav -->
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a routerLink="/welcome" routerLinkActive="border-indigo-500 text-gray-900" 
                   [routerLinkActiveOptions]="{exact: true}"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Home
                </a>
                <a routerLink="/dashboard" routerLinkActive="border-indigo-500 text-gray-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Draft Check MIS
                </a>
              </div>
            </div>
            
            <div class="flex items-center">
              <button (click)="logout()" class="ml-4 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors shadow-sm font-medium text-sm flex items-center">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="flex-1 w-full">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class LayoutComponent {
  private router = inject(Router);

  logout() {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
