import { Component, inject, OnInit, computed, signal, effect, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService, FileDraft } from '../../core/api.service';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div class="space-x-3 flex">
            <a routerLink="/settings" class="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm font-medium flex items-center">
              ⚙️ Settings
            </a>
            <a routerLink="/entry" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm font-medium flex items-center">
              + New Entry
            </a>
            <button (click)="exportToExcel()" class="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-md hover:bg-green-100 transition-colors shadow-sm font-medium flex items-center">
              📊 Export
            </button>
            <button (click)="logout()" class="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors shadow-sm font-medium flex items-center">
              Logout
            </button>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <!-- Overall Chart -->
          <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
            <h2 class="text-lg font-bold text-gray-700 mb-4">Overall Status</h2>
            <div class="relative w-full max-w-[250px] aspect-square flex items-center justify-center">
              <canvas #overallChartCanvas></canvas>
              <div *ngIf="drafts().length === 0" class="absolute text-gray-400 text-sm">No data available</div>
            </div>
          </div>

          <!-- Trend Chart -->
          <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
            <h2 class="text-lg font-bold text-gray-700 mb-4">Last 5 Days Trend</h2>
            <div class="relative w-full h-[250px] flex items-center justify-center">
              <canvas #trendChartCanvas></canvas>
              <div *ngIf="drafts().length === 0" class="absolute text-gray-400 text-sm">No data available</div>
            </div>
          </div>

          <!-- Bank Specific Chart -->
          <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
            <div class="w-full flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold text-gray-700">Bank Status</h2>
              <select [(ngModel)]="selectedBankForChart" (ngModelChange)="updateBankChart()" class="border-gray-300 rounded-md text-sm p-1.5 border bg-white focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select a Bank...</option>
                <option *ngFor="let bank of availableBanks()" [value]="bank">{{bank}}</option>
              </select>
            </div>
            
            <div class="relative w-full max-w-[250px] aspect-square flex items-center justify-center" [class.hidden]="!selectedBankForChart">
              <canvas #bankChartCanvas></canvas>
            </div>
            
            <div *ngIf="!selectedBankForChart" class="flex-1 flex items-center justify-center text-gray-400 text-sm w-full h-[250px]">
              Please select a bank to view data.
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S No</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex justify-between items-center">
                      <span>Arrival</span>
                      <button *ngIf="filters.arrMonth || filters.arrYear || filters.arrExactDate" (click)="clearFilter('arrival')" class="text-red-500 hover:text-red-700 bg-red-50 rounded px-1" title="Clear Arrival Filter">✕</button>
                    </div>
                    <div class="flex flex-col space-y-1 mt-1">
                      <div class="flex space-x-1">
                        <select [(ngModel)]="filters.arrMonth" (ngModelChange)="updateFilters()" class="block w-1/2 text-xs border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                          <option value="">Month</option>
                          <option value="01">Jan</option><option value="02">Feb</option><option value="03">Mar</option>
                          <option value="04">Apr</option><option value="05">May</option><option value="06">Jun</option>
                          <option value="07">Jul</option><option value="08">Aug</option><option value="09">Sep</option>
                          <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
                        </select>
                        <input type="text" [(ngModel)]="filters.arrYear" (ngModelChange)="updateFilters()" class="block w-1/2 text-xs border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500" placeholder="Year">
                      </div>
                      <input type="date" [(ngModel)]="filters.arrExactDate" (ngModelChange)="updateFilters()" class="block w-full text-xs border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500" title="Specific Date">
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex justify-between items-center">
                      <span>Completion</span>
                      <button *ngIf="filters.docMonth || filters.docYear || filters.docExactDate" (click)="clearFilter('completion')" class="text-red-500 hover:text-red-700 bg-red-50 rounded px-1" title="Clear Completion Filter">✕</button>
                    </div>
                    <div class="flex flex-col space-y-1 mt-1">
                      <div class="flex space-x-1">
                        <select [(ngModel)]="filters.docMonth" (ngModelChange)="updateFilters()" class="block w-1/2 text-xs border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                          <option value="">Month</option>
                          <option value="01">Jan</option><option value="02">Feb</option><option value="03">Mar</option>
                          <option value="04">Apr</option><option value="05">May</option><option value="06">Jun</option>
                          <option value="07">Jul</option><option value="08">Aug</option><option value="09">Sep</option>
                          <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
                        </select>
                        <input type="text" [(ngModel)]="filters.docYear" (ngModelChange)="updateFilters()" class="block w-1/2 text-xs border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500" placeholder="Year">
                      </div>
                      <input type="date" [(ngModel)]="filters.docExactDate" (ngModelChange)="updateFilters()" class="block w-full text-xs border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500" title="Specific Date">
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex justify-between items-center">
                      <span>Bank</span>
                      <button *ngIf="filters.bank" (click)="clearFilter('bank')" class="text-red-500 hover:text-red-700 bg-red-50 rounded px-1" title="Clear Bank Filter">✕</button>
                    </div>
                    <input type="text" [(ngModel)]="filters.bank" (ngModelChange)="updateFilters()" class="mt-1 block w-full text-sm border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500" placeholder="Filter...">
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex justify-between items-center">
                      <span>Borrower Name</span>
                      <button *ngIf="filters.borrower" (click)="clearFilter('borrower')" class="text-red-500 hover:text-red-700 bg-red-50 rounded px-1" title="Clear Borrower Filter">✕</button>
                    </div>
                    <input type="text" [(ngModel)]="filters.borrower" (ngModelChange)="updateFilters()" class="mt-1 block w-full text-sm border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500" placeholder="Filter...">
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex justify-between items-center">
                      <span>Status</span>
                      <button *ngIf="filters.status" (click)="clearFilter('status')" class="text-red-500 hover:text-red-700 bg-red-50 rounded px-1" title="Clear Status Filter">✕</button>
                    </div>
                    <select [(ngModel)]="filters.status" (ngModelChange)="updateFilters()" class="mt-1 block w-full text-sm border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                      <option value="">All</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex justify-between items-center">
                      <span>Drafter</span>
                      <button *ngIf="filters.drafter" (click)="clearFilter('drafter')" class="text-red-500 hover:text-red-700 bg-red-50 rounded px-1" title="Clear Drafter Filter">✕</button>
                    </div>
                    <input type="text" [(ngModel)]="filters.drafter" (ngModelChange)="updateFilters()" class="mt-1 block w-full text-sm border-gray-300 rounded-md p-1 border font-normal focus:ring-indigo-500 focus:border-indigo-500" placeholder="Filter...">
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let row of filteredData(); let i = index" (click)="viewDetails(row)" class="hover:bg-gray-50 transition-colors cursor-pointer group">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{filteredData().length - i}}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{row.dateOfArrival | date:'dd-MM-yyyy'}}
                    <div class="text-xs text-gray-500" *ngIf="row.timeOfArrival">{{row.timeOfArrival}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{row.dateOfCompletion ? (row.dateOfCompletion | date:'dd-MM-yyyy') : '—'}}
                    <div class="text-xs text-gray-500" *ngIf="row.docTime">{{row.docTime}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{row.bank}}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{row.borrowerName}}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="{
                          'bg-[#87AE73]/15 text-[#6c8f5a]': row.status === 'Completed',
                          'bg-[#F47174]/15 text-[#cc4649]': row.status === 'Pending'
                          }">
                      {{row.status}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{row.draftedBy}}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <a [routerLink]="['/update-entry', row.sNo]" (click)="$event.stopPropagation()" class="text-indigo-600 hover:text-indigo-900 font-medium bg-indigo-50 px-3 py-1 rounded">Update</a>
                    <button type="button" (click)="deleteEntry(row, $event)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded">Delete</button>
                  </td>
                </tr>
                <tr *ngIf="filteredData().length === 0">
                  <td colspan="8" class="px-6 py-8 text-center text-gray-500">No data found matching filters.</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Mobile Card View -->
          <div class="md:hidden">
            <div class="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
              <p class="text-sm font-semibold text-gray-700">Filters</p>
              <div class="flex flex-col space-y-2">
                <div class="flex justify-between text-xs text-gray-500">
                  <div class="flex items-center space-x-2">
                    <span>Arrival Filters</span>
                    <button *ngIf="filters.arrMonth || filters.arrYear || filters.arrExactDate" (click)="clearFilter('arrival')" class="text-red-500 font-bold">✕</button>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span>Completion Filters</span>
                    <button *ngIf="filters.docMonth || filters.docYear || filters.docExactDate" (click)="clearFilter('completion')" class="text-red-500 font-bold">✕</button>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <div class="w-1/2 flex space-x-1">
                    <select [(ngModel)]="filters.arrMonth" (ngModelChange)="updateFilters()" class="w-1/2 text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                      <option value="">Arr Mth</option>
                      <option value="01">Jan</option><option value="02">Feb</option><option value="03">Mar</option><option value="04">Apr</option><option value="05">May</option><option value="06">Jun</option><option value="07">Jul</option><option value="08">Aug</option><option value="09">Sep</option><option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
                    </select>
                    <input type="text" [(ngModel)]="filters.arrYear" (ngModelChange)="updateFilters()" class="w-1/2 text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500" placeholder="Year">
                  </div>
                  <div class="w-1/2 flex space-x-1">
                    <select [(ngModel)]="filters.docMonth" (ngModelChange)="updateFilters()" class="w-1/2 text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                      <option value="">Doc Mth</option>
                      <option value="01">Jan</option><option value="02">Feb</option><option value="03">Mar</option><option value="04">Apr</option><option value="05">May</option><option value="06">Jun</option><option value="07">Jul</option><option value="08">Aug</option><option value="09">Sep</option><option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
                    </select>
                    <input type="text" [(ngModel)]="filters.docYear" (ngModelChange)="updateFilters()" class="w-1/2 text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500" placeholder="Year">
                  </div>
                </div>
                <div class="flex space-x-2">
                  <input type="date" [(ngModel)]="filters.arrExactDate" (ngModelChange)="updateFilters()" class="w-1/2 text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500" title="Arrival Date">
                  <input type="date" [(ngModel)]="filters.docExactDate" (ngModelChange)="updateFilters()" class="w-1/2 text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500" title="Completion Date">
                </div>
              </div>
              <div class="flex space-x-2 relative">
                <input type="text" [(ngModel)]="filters.bank" (ngModelChange)="updateFilters()" class="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500 pr-8" placeholder="Filter by Bank...">
                <button *ngIf="filters.bank" (click)="clearFilter('bank')" class="absolute right-3 top-2 text-red-500 font-bold">✕</button>
              </div>
              <div class="flex space-x-2 relative">
                <input type="text" [(ngModel)]="filters.borrower" (ngModelChange)="updateFilters()" class="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500 pr-8" placeholder="Filter by Borrower...">
                <button *ngIf="filters.borrower" (click)="clearFilter('borrower')" class="absolute right-3 top-2 text-red-500 font-bold">✕</button>
              </div>
              <div class="flex space-x-2">
                <div class="w-1/2 relative">
                  <select [(ngModel)]="filters.status" (ngModelChange)="updateFilters()" class="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none">
                    <option value="">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <button *ngIf="filters.status" (click)="clearFilter('status')" class="absolute right-6 top-2 text-red-500 font-bold z-10">✕</button>
                </div>
                <div class="w-1/2 relative">
                  <input type="text" [(ngModel)]="filters.drafter" (ngModelChange)="updateFilters()" class="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-indigo-500 focus:border-indigo-500 pr-8" placeholder="Filter Drafter...">
                  <button *ngIf="filters.drafter" (click)="clearFilter('drafter')" class="absolute right-3 top-2 text-red-500 font-bold">✕</button>
                </div>
              </div>
            </div>
            
            <ul class="divide-y divide-gray-200">
              <li *ngFor="let row of filteredData(); let i = index" (click)="viewDetails(row)" class="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="text-xs font-bold text-gray-400">#{{filteredData().length - i}}</p>
                    <p class="text-sm font-medium text-indigo-600">{{row.bank}}</p>
                    <p class="text-lg font-bold text-gray-900">{{row.borrowerName}}</p>
                  </div>
                  <span class="px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-[#87AE73]/15 text-[#6c8f5a]': row.status === 'Completed',
                          'bg-[#F47174]/15 text-[#cc4649]': row.status === 'Pending'
                        }">
                    {{row.status}}
                  </span>
                </div>
                <div class="text-sm text-gray-500 flex justify-between items-end mt-2">
                  <div class="flex flex-col space-y-1">
                    <span>Arr: {{row.dateOfArrival | date:'dd-MM-yyyy'}} <span *ngIf="row.timeOfArrival">{{row.timeOfArrival}}</span></span>
                    <span *ngIf="row.dateOfCompletion">Doc: {{row.dateOfCompletion | date:'dd-MM-yyyy'}} <span *ngIf="row.docTime">{{row.docTime}}</span></span>
                    <span>By: {{row.draftedBy}}</span>
                  </div>
                  <div class="flex space-x-2">
                    <a [routerLink]="['/update-entry', row.sNo]" (click)="$event.stopPropagation()" class="text-indigo-600 hover:text-indigo-900 font-medium bg-indigo-50 px-3 py-1 rounded">Update</a>
                    <button type="button" (click)="deleteEntry(row, $event)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded">Delete</button>
                  </div>
                </div>
              </li>
              <li *ngIf="filteredData().length === 0" class="p-8 text-center text-gray-500">
                No data found matching filters.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Entry Details Modal -->
    <div *ngIf="selectedEntryForModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" (click)="closeModal()">
          <div class="absolute inset-0 bg-gray-500 opacity-75 backdrop-blur-sm"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full border border-gray-100">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
            <button (click)="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-2xl leading-6 font-bold text-gray-900 mb-1">
                  {{selectedEntryForModal.borrowerName}}
                </h3>
                <p class="text-sm text-gray-500 mb-6 flex items-center space-x-2">
                  <span class="font-medium text-indigo-600">{{selectedEntryForModal.bank}}</span>
                  <span>&bull;</span>
                  <span>File #{{selectedEntryForModal.sNo}}</span>
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ml-auto"
                        [ngClass]="{
                          'bg-[#87AE73]/15 text-[#6c8f5a]': selectedEntryForModal.status === 'Completed',
                          'bg-[#F47174]/15 text-[#cc4649]': selectedEntryForModal.status === 'Pending'
                        }">
                    {{selectedEntryForModal.status}}
                  </span>
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 border-t border-gray-200 pt-6">
                  <div>
                    <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Arrival Details</h4>
                    <p class="mt-1 text-sm text-gray-900">Date: <span class="font-medium">{{selectedEntryForModal.dateOfArrival | date:'dd-MM-yyyy'}}</span></p>
                    <p class="mt-1 text-sm text-gray-900" *ngIf="selectedEntryForModal.timeOfArrival">Time: <span class="font-medium">{{selectedEntryForModal.timeOfArrival}}</span></p>
                  </div>
                  <div *ngIf="selectedEntryForModal.dateOfCompletion">
                    <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Completion Details</h4>
                    <p class="mt-1 text-sm text-gray-900">Date: <span class="font-medium">{{selectedEntryForModal.dateOfCompletion | date:'dd-MM-yyyy'}}</span></p>
                    <p class="mt-1 text-sm text-gray-900" *ngIf="selectedEntryForModal.docTime">Time: <span class="font-medium">{{selectedEntryForModal.docTime}}</span></p>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Borrower Info</h4>
                    <p class="mt-1 text-sm text-gray-900">Name: <span class="font-medium">{{selectedEntryForModal.borrowerName}}</span></p>
                    <p class="mt-1 text-sm text-gray-900">Type: <span class="font-medium">{{selectedEntryForModal.sanSrp}}</span></p>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Staff</h4>
                    <p class="mt-1 text-sm text-gray-900">Drafted By: <span class="font-medium">{{selectedEntryForModal.draftedBy}}</span></p>
                  </div>
                  <div class="sm:col-span-2">
                    <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Remarks</h4>
                    <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border border-gray-200">{{selectedEntryForModal.remarks || 'No remarks added.'}}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
            <a [routerLink]="['/update-entry', selectedEntryForModal.sNo]" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
              Update Entry
            </a>
            <button type="button" (click)="closeModal()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  @ViewChild('overallChartCanvas') overallChartCanvas!: ElementRef;
  @ViewChild('trendChartCanvas') trendChartCanvas!: ElementRef;
  @ViewChild('bankChartCanvas') bankChartCanvas!: ElementRef;

  overallChartInstance: Chart | null = null;
  trendChartInstance: Chart | null = null;
  bankChartInstance: Chart | null = null;

  selectedBankForChart = 'AU';
  selectedEntryForModal: FileDraft | null = null;

  drafts = signal<FileDraft[]>([]);

  filters = {
    arrMonth: '',
    arrYear: '',
    arrExactDate: '',
    docMonth: '',
    docYear: '',
    docExactDate: '',
    bank: '',
    borrower: '',
    status: '',
    drafter: ''
  };

  filterTrigger = signal(0);

  filteredData = computed(() => {
    this.filterTrigger();
    const data = this.drafts();
    return data.filter(item => {
      const matchArrExact = !this.filters.arrExactDate || item.dateOfArrival.startsWith(this.filters.arrExactDate);
      const matchDocExact = !this.filters.docExactDate || (!!item.dateOfCompletion && item.dateOfCompletion.startsWith(this.filters.docExactDate));

      const matchArrMonth = !this.filters.arrMonth || this.checkMonthPart(item.dateOfArrival, this.filters.arrMonth);
      const matchArrYear = !this.filters.arrYear || this.checkYearPart(item.dateOfArrival, this.filters.arrYear);
      
      const matchDocMonth = !this.filters.docMonth || this.checkMonthPart(item.dateOfCompletion, this.filters.docMonth);
      const matchDocYear = !this.filters.docYear || this.checkYearPart(item.dateOfCompletion, this.filters.docYear);
      
      const matchBank = !this.filters.bank || item.bank.toLowerCase().includes(this.filters.bank.toLowerCase());
      const matchBorrower = !this.filters.borrower || item.borrowerName.toLowerCase().includes(this.filters.borrower.toLowerCase());
      
      const matchStatus = !this.filters.status || item.status === this.filters.status;
      const matchDrafter = !this.filters.drafter || item.draftedBy.toLowerCase().includes(this.filters.drafter.toLowerCase());
      
      return matchArrExact && matchDocExact && matchArrMonth && matchArrYear && matchDocMonth && matchDocYear && matchBank && matchBorrower && matchStatus && matchDrafter;
    });
  });

  private checkMonthPart(isoString: string | null | undefined, filterMonth: string): boolean {
    if (!filterMonth) return true;
    if (!isoString) return false;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return false;
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return month === filterMonth;
  }

  private checkYearPart(isoString: string | null | undefined, filterYear: string): boolean {
    if (!filterYear) return true;
    if (!isoString) return false;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return false;
    const year = d.getFullYear().toString();
    return year.includes(filterYear);
  }

  clearFilter(type: string) {
    if (type === 'arrival') {
      this.filters.arrMonth = '';
      this.filters.arrYear = '';
      this.filters.arrExactDate = '';
    } else if (type === 'completion') {
      this.filters.docMonth = '';
      this.filters.docYear = '';
      this.filters.docExactDate = '';
    } else if (type === 'bank') {
      this.filters.bank = '';
    } else if (type === 'borrower') {
      this.filters.borrower = '';
    } else if (type === 'status') {
      this.filters.status = '';
    } else if (type === 'drafter') {
      this.filters.drafter = '';
    }
    this.updateFilters();
  }

  viewDetails(entry: FileDraft) {
    this.selectedEntryForModal = entry;
  }

  closeModal() {
    this.selectedEntryForModal = null;
  }

  availableBanks = computed(() => {
    const data = this.drafts();
    const banks = new Set(data.map(d => d.bank));
    return Array.from(banks).sort();
  });

  constructor() {
    effect(() => {
      const data = this.filteredData(); // update charts when filtered data changes
      setTimeout(() => {
        if (this.overallChartCanvas) {
          this.renderOverallChart(data);
          this.updateTrendChart();
          this.updateBankChart();
        }
      }, 50); // slight delay to ensure view is ready
    });
  }

  deleteEntry(draft: FileDraft, event: Event) {
    event.stopPropagation();
    if (!draft.sNo) return;
    if (confirm(`Are you sure you want to delete this entry from bank ${draft.bank}? This action cannot be undone.`)) {
      this.apiService.deleteDraft(draft.sNo).subscribe({
        next: () => {
          this.drafts.update(drafts => drafts.filter(d => d.sNo !== draft.sNo));
          this.filterTrigger.set(this.filterTrigger() + 1);
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete the entry.');
        }
      });
    }
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  exportToExcel() {
    const data = this.filteredData();
    if (!data || data.length === 0) {
      alert('No data to export.');
      return;
    }

    const exportData = data.map((row, index) => {
      const arrDate = row.dateOfArrival ? new Date(row.dateOfArrival).toLocaleDateString('en-GB') : '';
      const compDate = row.dateOfCompletion ? new Date(row.dateOfCompletion).toLocaleDateString('en-GB') : '';
      return {
        'S.No': data.length - index,
        'Date of Arrival': arrDate,
        'Time of Arrival': row.timeOfArrival || '',
        'Bank': row.bank || '',
        'Borrower Name': row.borrowerName || '',
        'Date of Completion': compDate,
        'Doc Time': row.docTime || '',
        'Drafted By': row.draftedBy || '',
        'SAN/SRP': row.sanSrp || '',
        'Status': row.status,
        'Remarks': row.remarks || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Data');
    XLSX.writeFile(workbook, `MIS_Export_${new Date().getTime()}.xlsx`);
  }

  ngOnInit() {
    this.apiService.getDrafts().subscribe(data => {
      this.drafts.set(data);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.renderOverallChart(this.filteredData());
      this.updateTrendChart();
      this.updateBankChart();
    }, 100);
  }

  updateFilters() {
    this.filterTrigger.update(v => v + 1);
  }

  renderOverallChart(data: FileDraft[]) {
    if (!this.overallChartCanvas) return;

    const completed = data.filter(d => d.status === 'Completed').length;
    const pending = data.filter(d => d.status === 'Pending').length;

    if (this.overallChartInstance) {
      this.overallChartInstance.destroy();
    }

    // Only draw if there is data
    if (completed === 0 && pending === 0) return;

    this.overallChartInstance = new Chart(this.overallChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [completed, pending],
          backgroundColor: ['#87AE73', '#F47174'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  updateBankChart() {
    if (!this.selectedBankForChart || !this.bankChartCanvas) {
      if (this.bankChartInstance) {
        this.bankChartInstance.destroy();
        this.bankChartInstance = null;
      }
      return;
    }

    const data = this.filteredData().filter(d => d.bank === this.selectedBankForChart);
    const completed = data.filter(d => d.status === 'Completed').length;
    const pending = data.filter(d => d.status === 'Pending').length;

    if (this.bankChartInstance) {
      this.bankChartInstance.destroy();
    }

    this.bankChartInstance = new Chart(this.bankChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [completed, pending],
          backgroundColor: ['#87AE73', '#F47174'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  updateTrendChart() {
    if (!this.trendChartCanvas) return;
    const data = this.filteredData();

    // 1. Generate the last 5 working days from today (skipping Sundays)
    const dates: string[] = [];
    const labels: string[] = [];
    let d = new Date();
    
    while (dates.length < 5) {
      if (d.getDay() !== 0) { // 0 is Sunday
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        
        dates.unshift(`${yyyy}-${mm}-${dd}`);
        labels.unshift(`${dd}-${mm}`);
      }
      d.setDate(d.getDate() - 1);
    }

    const arrivals = dates.map(date => data.filter(d => {
      if (!d.dateOfArrival) return false;
      const dt = new Date(d.dateOfArrival);
      return !isNaN(dt.getTime()) && `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}` === date;
    }).length);

    const completions = dates.map(date => data.filter(d => {
      if (!d.dateOfCompletion) return false;
      const dt = new Date(d.dateOfCompletion);
      return !isNaN(dt.getTime()) && `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}` === date;
    }).length);

    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }

    if (dates.length === 0) return;

    this.trendChartInstance = new Chart(this.trendChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Arrivals',
            data: arrivals,
            borderColor: '#3B82F6', // Blue
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            pointStyle: 'circle',
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Completions',
            data: completions,
            borderColor: '#87AE73', // Theme Green
            backgroundColor: 'rgba(135, 174, 115, 0.1)',
            fill: true,
            pointStyle: 'circle',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { mode: 'index', intersect: false }
        }
      }
    });
  }
}
