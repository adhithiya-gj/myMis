import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, Bank, Drafter } from '../../core/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-8">
        
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-3xl font-bold text-gray-900">Settings</h2>
          <a routerLink="/dashboard" class="text-indigo-600 hover:text-indigo-800 font-medium bg-white px-4 py-2 rounded shadow-sm border">Back to Dashboard</a>
        </div>

        <!-- Security Section -->
        <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Update Login Credentials</h3>
          <form (ngSubmit)="updateCredentials()" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Username</label>
              <input type="text" [(ngModel)]="cred.oldUsername" name="oldUsername" required 
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">New Username</label>
              <input type="text" [(ngModel)]="cred.newUsername" name="newUsername" required 
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" [(ngModel)]="cred.newPassword" name="newPassword" required 
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
            </div>
            <div>
              <button type="submit" [disabled]="!cred.oldUsername || !cred.newUsername || !cred.newPassword" 
                      class="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                Update
              </button>
            </div>
          </form>
          <p class="text-green-600 text-sm mt-3 font-medium" *ngIf="credSuccess">Credentials updated successfully! Please use them next time you log in.</p>
          <p class="text-red-600 text-sm mt-3 font-medium" *ngIf="credError">{{credError}}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Banks Section -->
          <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Manage Banks</h3>
            
            <form (ngSubmit)="addBank()" class="flex space-x-2 mb-6">
              <input type="text" [(ngModel)]="newBankName" name="bankName" required placeholder="Enter new bank name..." 
                     class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <button type="submit" [disabled]="!newBankName || isAddingBank" 
                      class="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                Add
              </button>
            </form>

            <ul class="divide-y divide-gray-200 border rounded-md max-h-64 overflow-y-auto">
              <li *ngFor="let bank of banks()" class="p-3 hover:bg-gray-50 flex items-center justify-between group">
                <ng-container *ngIf="editingBankId !== bank.id">
                  <span class="text-sm font-medium text-gray-900">{{bank.name}}</span>
                  <div class="flex space-x-1">
                    <button type="button" (click)="startEditBank(bank)" class="text-indigo-600 hover:text-indigo-900 text-xs font-medium px-2 py-1 bg-indigo-50 rounded">Edit</button>
                    <button type="button" (click)="deleteBank(bank)" class="text-red-600 hover:text-red-900 text-xs font-medium px-2 py-1 bg-red-50 rounded">Delete</button>
                  </div>
                </ng-container>
                <ng-container *ngIf="editingBankId === bank.id">
                  <input type="text" [(ngModel)]="editBankName" (keyup.enter)="saveEditBank(bank)" class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1.5 border mr-2">
                  <div class="flex space-x-1">
                    <button type="button" (click)="saveEditBank(bank)" class="text-green-600 hover:text-green-900 text-xs font-medium px-2 py-1 bg-green-50 rounded">Save</button>
                    <button type="button" (click)="cancelEditBank()" class="text-gray-600 hover:text-gray-900 text-xs font-medium px-2 py-1 bg-gray-100 rounded">Cancel</button>
                  </div>
                </ng-container>
              </li>
              <li *ngIf="banks().length === 0" class="p-3 text-sm text-gray-500 text-center">No banks added yet.</li>
            </ul>
          </div>

          <!-- Drafters Section -->
          <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Manage Drafters</h3>
            
            <form (ngSubmit)="addDrafter()" class="flex space-x-2 mb-6">
              <input type="text" [(ngModel)]="newDrafterName" name="drafterName" required placeholder="Enter new drafter name..." 
                     class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <button type="submit" [disabled]="!newDrafterName || isAddingDrafter" 
                      class="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                Add
              </button>
            </form>

            <ul class="divide-y divide-gray-200 border rounded-md max-h-64 overflow-y-auto">
              <li *ngFor="let drafter of drafters()" class="p-3 hover:bg-gray-50 flex items-center justify-between group">
                <ng-container *ngIf="editingDrafterId !== drafter.id">
                  <span class="text-sm font-medium text-gray-900">{{drafter.name}}</span>
                  <div class="flex space-x-1">
                    <button type="button" (click)="startEditDrafter(drafter)" class="text-indigo-600 hover:text-indigo-900 text-xs font-medium px-2 py-1 bg-indigo-50 rounded">Edit</button>
                    <button type="button" (click)="deleteDrafter(drafter)" class="text-red-600 hover:text-red-900 text-xs font-medium px-2 py-1 bg-red-50 rounded">Delete</button>
                  </div>
                </ng-container>
                <ng-container *ngIf="editingDrafterId === drafter.id">
                  <input type="text" [(ngModel)]="editDrafterName" (keyup.enter)="saveEditDrafter(drafter)" class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1.5 border mr-2">
                  <div class="flex space-x-1">
                    <button type="button" (click)="saveEditDrafter(drafter)" class="text-green-600 hover:text-green-900 text-xs font-medium px-2 py-1 bg-green-50 rounded">Save</button>
                    <button type="button" (click)="cancelEditDrafter()" class="text-gray-600 hover:text-gray-900 text-xs font-medium px-2 py-1 bg-gray-100 rounded">Cancel</button>
                  </div>
                </ng-container>
              </li>
              <li *ngIf="drafters().length === 0" class="p-3 text-sm text-gray-500 text-center">No drafters added yet.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private apiService = inject(ApiService);

  banks = signal<Bank[]>([]);
  drafters = signal<Drafter[]>([]);

  newBankName = '';
  newDrafterName = '';

  isAddingBank = false;
  isAddingDrafter = false;

  editingBankId: number | null = null;
  editBankName = '';

  editingDrafterId: number | null = null;
  editDrafterName = '';

  cred = { oldUsername: '', newUsername: '', newPassword: '' };
  credSuccess = false;
  credError = '';

  ngOnInit() {
    this.loadData();
  }

  updateCredentials() {
    this.credSuccess = false;
    this.credError = '';
    this.apiService.updateCredentials(this.cred).subscribe({
      next: () => {
        this.credSuccess = true;
        this.cred = { oldUsername: '', newUsername: '', newPassword: '' };
        setTimeout(() => this.credSuccess = false, 5000);
      },
      error: () => {
        this.credError = 'Failed to update. Check if your current username is correct.';
      }
    });
  }

  loadData() {
    this.apiService.getBanks().subscribe(b => this.banks.set(b));
    this.apiService.getDrafters().subscribe(d => this.drafters.set(d));
  }

  addBank() {
    if (!this.newBankName.trim()) return;
    this.isAddingBank = true;
    this.apiService.createBank(this.newBankName.trim()).subscribe({
      next: (bank) => {
        this.banks.update(b => [...b, bank]);
        this.newBankName = '';
        this.isAddingBank = false;
      },
      error: (err) => {
        console.error(err);
        this.isAddingBank = false;
        alert('Failed to add bank. It might already exist.');
      }
    });
  }

  addDrafter() {
    if (!this.newDrafterName.trim()) return;
    this.isAddingDrafter = true;
    this.apiService.createDrafter(this.newDrafterName.trim()).subscribe({
      next: (drafter) => {
        this.drafters.update(d => [...d, drafter]);
        this.newDrafterName = '';
        this.isAddingDrafter = false;
      },
      error: (err) => {
        console.error(err);
        this.isAddingDrafter = false;
        alert('Failed to add drafter. It might already exist.');
      }
    });
  }

  startEditBank(bank: Bank) {
    if (!bank.id) return;
    this.editingBankId = bank.id;
    this.editBankName = bank.name;
  }

  cancelEditBank() {
    this.editingBankId = null;
    this.editBankName = '';
  }

  saveEditBank(bank: Bank) {
    if (!bank.id || !this.editBankName.trim() || this.editBankName.trim() === bank.name) {
      this.cancelEditBank();
      return;
    }
    
    this.apiService.updateBank(bank.id, this.editBankName.trim()).subscribe({
      next: (updatedBank) => {
        this.banks.update(banks => banks.map(b => b.id === updatedBank.id ? updatedBank : b));
        this.cancelEditBank();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update bank. It might already exist.');
      }
    });
  }

  deleteBank(bank: Bank) {
    if (!bank.id) return;
    if (confirm(`Are you sure you want to delete the bank "${bank.name}"? This action cannot be undone.`)) {
      this.apiService.deleteBank(bank.id).subscribe({
        next: () => {
          this.banks.update(banks => banks.filter(b => b.id !== bank.id));
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete bank. It might be in use.');
        }
      });
    }
  }

  startEditDrafter(drafter: Drafter) {
    if (!drafter.id) return;
    this.editingDrafterId = drafter.id;
    this.editDrafterName = drafter.name;
  }

  cancelEditDrafter() {
    this.editingDrafterId = null;
    this.editDrafterName = '';
  }

  saveEditDrafter(drafter: Drafter) {
    if (!drafter.id || !this.editDrafterName.trim() || this.editDrafterName.trim() === drafter.name) {
      this.cancelEditDrafter();
      return;
    }
    
    this.apiService.updateDrafter(drafter.id, this.editDrafterName.trim()).subscribe({
      next: (updatedDrafter) => {
        this.drafters.update(drafters => drafters.map(d => d.id === updatedDrafter.id ? updatedDrafter : d));
        this.cancelEditDrafter();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update drafter. It might already exist.');
      }
    });
  }

  deleteDrafter(drafter: Drafter) {
    if (!drafter.id) return;
    if (confirm(`Are you sure you want to delete the drafter "${drafter.name}"? This action cannot be undone.`)) {
      this.apiService.deleteDrafter(drafter.id).subscribe({
        next: () => {
          this.drafters.update(drafters => drafters.filter(d => d.id !== drafter.id));
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete drafter. It might be in use.');
        }
      });
    }
  }
}
