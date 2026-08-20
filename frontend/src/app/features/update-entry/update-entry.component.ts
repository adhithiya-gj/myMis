import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, FileDraft, Bank } from '../../core/api.service';

@Component({
  selector: 'app-update-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Update Entry Details</h2>
            <p *ngIf="draft" class="text-sm text-gray-500 mt-1">
              {{draft.bank}} - {{draft.borrowerName}} (S No: {{draft.sNo}})
            </p>
          </div>
          <a routerLink="/dashboard" class="text-indigo-600 hover:text-indigo-800 font-medium">Cancel</a>
        </div>
        
        <div *ngIf="loading" class="py-8 text-center text-gray-500">
          Loading...
        </div>

        <form *ngIf="!loading" [formGroup]="updateForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Date of Arrival</label>
              <input type="date" formControlName="dateOfArrival" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Bank Name</label>
              <select formControlName="bank" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                <option value="" disabled>Select Bank</option>
                <option *ngFor="let b of banks" [value]="b.name">{{b.name}}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Time of Arrival</label>
              <input type="time" formControlName="timeOfArrival" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Date of Completion</label>
              <input type="date" formControlName="dateOfCompletion" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">DOC Time</label>
              <input type="time" formControlName="docTime" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
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

          <div class="pt-4 flex justify-end space-x-3">
            <button type="submit" [disabled]="updateForm.invalid || submitting"
                    class="flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
              {{ submitting ? 'Saving...' : 'Save Updates' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class UpdateEntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitting = false;
  loading = false;
  draft: FileDraft | null = null;
  draftId!: number;
  banks: Bank[] = [];

  updateForm = this.fb.group({
    dateOfArrival: [''],
    timeOfArrival: [''],
    dateOfCompletion: [''],
    docTime: [''],
    bank: [''],
    status: ['', Validators.required],
    remarks: ['']
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.draftId = parseInt(id, 10);
        this.loadBanks();
        this.loadDraft();
      } else {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadBanks() {
    this.apiService.getBanks().subscribe({
      next: (banks) => this.banks = banks,
      error: (err) => console.error('Failed to load banks', err)
    });
  }

  loadDraft() {
    this.apiService.getDraft(this.draftId).subscribe({
      next: (data) => {
        try {
          this.draft = data;
          const dateOfArrival = this.draft.dateOfArrival ? new Date(this.draft.dateOfArrival).toISOString().split('T')[0] : '';
          const dateOfCompletion = this.draft.dateOfCompletion ? new Date(this.draft.dateOfCompletion).toISOString().split('T')[0] : '';
          
          let timeOfArrival = this.draft.timeOfArrival || '';
          if (timeOfArrival) {
            timeOfArrival = this.to24Hour(timeOfArrival);
          }

          let docTime = this.draft.docTime || '';
          if (docTime) {
            docTime = this.to24Hour(docTime);
          }

          this.updateForm.patchValue({
            dateOfArrival: dateOfArrival,
            timeOfArrival: timeOfArrival,
            dateOfCompletion: dateOfCompletion,
            docTime: docTime,
            bank: data.bank || '',
            status: data.status || 'Pending',
            remarks: data.remarks || ''
          });
        } catch (e) {
          console.error('Error in patchValue:', e);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to load draft details.');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.updateForm.invalid || !this.draft?.sNo) return;

    this.submitting = true;
    const formVal = this.updateForm.value as any;

    let updatedTimeOfArrival = formVal.timeOfArrival || '';
    if (updatedTimeOfArrival) {
      updatedTimeOfArrival = this.to12Hour(updatedTimeOfArrival);
    }

    let updatedDocTime = formVal.docTime || '';
    if (updatedDocTime) {
      updatedDocTime = this.to12Hour(updatedDocTime);
    }

    const updatePayload: Partial<FileDraft> = {
      dateOfArrival: formVal.dateOfArrival || undefined,
      timeOfArrival: updatedTimeOfArrival,
      dateOfCompletion: formVal.dateOfCompletion || undefined,
      docTime: updatedDocTime,
      bank: formVal.bank || undefined,
      status: formVal.status,
      remarks: formVal.remarks
    };

    this.apiService.updateDraft(this.draftId, updatePayload).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
          this.submitting = false;
          alert('Failed to update entry');
        }
      });
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

  private to24Hour(time12: string): string {
    if (!time12) return '';
    const match = time12.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return time12;
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const suffix = match[3].toUpperCase();
    if (suffix === 'PM' && hours < 12) hours += 12;
    if (suffix === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${mins}`;
  }
}
