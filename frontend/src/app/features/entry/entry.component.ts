import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, Bank, Drafter } from '../../core/api.service';

@Component({
  selector: 'app-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">New File Draft Entry</h2>
          <a routerLink="/dashboard" class="text-indigo-600 hover:text-indigo-800 font-medium">Back to Dashboard</a>
        </div>
        
        <form [formGroup]="entryForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Date of Arrival</label>
              <input type="date" formControlName="dateOfArrival" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Time of Arrival</label>
              <input type="time" formControlName="timeOfArrival" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Bank</label>
              <select formControlName="bank" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                <option value="">Select Bank</option>
                <option *ngFor="let b of banks()" [value]="b.name">{{b.name}}</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Borrower Name</label>
              <input type="text" formControlName="borrowerName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
            </div>



            <div>
              <label class="block text-sm font-medium text-gray-700">Drafted By</label>
              <select formControlName="draftedBy" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                <option value="">Select Drafter</option>
                <option *ngFor="let d of drafters()" [value]="d.name">{{d.name}}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">SAN / SRP</label>
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input type="radio" formControlName="sanSrp" value="SAN" class="form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4">
                  <span class="ml-2 text-sm text-gray-700">SAN</span>
                </label>
                <label class="inline-flex items-center">
                  <input type="radio" formControlName="sanSrp" value="SRP" class="form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4">
                  <span class="ml-2 text-sm text-gray-700">SRP</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select formControlName="status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea formControlName="remarks" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"></textarea>
            </div>
          </div>

          <div class="pt-4">
            <button type="submit" [disabled]="entryForm.invalid || submitting"
                    class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
              {{ submitting ? 'Saving...' : 'Save Entry' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);

  submitting = false;
  banks = signal<Bank[]>([]);
  drafters = signal<Drafter[]>([]);

  ngOnInit() {
    this.apiService.getBanks().subscribe(b => this.banks.set(b));
    this.apiService.getDrafters().subscribe(d => this.drafters.set(d));
  }

  entryForm = this.fb.group({
    dateOfArrival: [new Date().toISOString().split('T')[0], Validators.required],
    timeOfArrival: [new Date().toTimeString().substring(0, 5), Validators.required],
    bank: ['', Validators.required],
    borrowerName: ['', Validators.required],
    draftedBy: ['', Validators.required],
    sanSrp: ['SAN', Validators.required],
    status: ['Pending', Validators.required],
    remarks: ['']
  });

  onSubmit() {
    if (this.entryForm.valid) {
      this.submitting = true;
      const payload = { ...this.entryForm.value } as any;
      if (payload.timeOfArrival) {
        payload.timeOfArrival = this.to12Hour(payload.timeOfArrival);
      }
      this.apiService.createDraft(payload).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
          this.submitting = false;
          alert('Failed to save entry');
        }
      });
    }
  }

  private to12Hour(time24: string): string {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    if (!h || !m) return time24;
    const hours = parseInt(h, 10);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hours12 = ((hours + 11) % 12 + 1).toString().padStart(2, '0');
    return `${hours12}:${m} ${suffix}`;
  }
}
