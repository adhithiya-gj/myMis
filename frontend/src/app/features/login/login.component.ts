import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 overflow-y-auto bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div class="flex flex-col items-center justify-center">
          <img src="logo.png" alt="SAN Law Partners LLP" class="h-24 w-auto mb-4 object-contain">
          <h2 class="text-center text-3xl font-extrabold text-gray-900">
            Login
          </h2>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="username" class="sr-only">Username</label>
              <input id="username" type="text" formControlName="username" required
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                     placeholder="Username">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" type="password" formControlName="password" required
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                     placeholder="Password">
            </div>
          </div>


          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" type="checkbox" formControlName="rememberMe" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="loginForm.invalid"
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
              Sign in
            </button>
          </div>
          
          <div *ngIf="error" class="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-red-700 font-medium">
                  {{error}}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  error = '';

  ngOnInit() {
    if (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.apiService.login(this.loginForm.value).subscribe({
        next: (res) => {
          if (this.loginForm.value.rememberMe) {
            localStorage.setItem('auth_token', res.token);
          } else {
            sessionStorage.setItem('auth_token', res.token);
          }
          this.router.navigate(['/welcome']);
        },
        error: () => {
          this.error = 'Incorrect username or password. Please try again.';
        }
      });
    }
  }
}
