import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-full py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex items-center justify-center">
      <div class="max-w-4xl w-full space-y-10">
        
        <div class="text-center">
          <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to <span class="text-indigo-600">SAN Law Partners</span>
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Select a module below to get started.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          
          <!-- Module 1: Draft Check MIS -->
          <a routerLink="/dashboard" class="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full cursor-pointer">
            <div class="p-8 flex-1">
              <div class="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <svg class="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">Draft Check MIS</h3>
              <p class="text-gray-500 line-clamp-3">
                Manage your file drafts, track completion statuses, and monitor drafter productivity across banks.
              </p>
            </div>
            <div class="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center justify-between group-hover:bg-indigo-50 transition-colors duration-300">
              <span class="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">Open Module</span>
              <svg class="w-5 h-5 text-indigo-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </a>

          <!-- Module 2: Placeholder -->
          <div class="group relative bg-white/60 rounded-2xl shadow-md overflow-hidden border border-gray-100 border-dashed flex flex-col h-full cursor-not-allowed opacity-80 backdrop-blur-sm">
            <div class="p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div class="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-400 mb-3">Module 2</h3>
              <p class="text-gray-400">
                Awaiting requirements. This module is coming soon.
              </p>
            </div>
            <div class="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
              <span class="text-sm font-semibold text-gray-400">Coming Soon</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class WelcomeComponent { }
