import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FileDraft {
  sNo?: number;
  dateOfArrival: string;
  timeOfArrival?: string;
  bank: string;
  borrowerName: string;
  dateOfCompletion?: string | null;
  docTime?: string | null;
  draftedBy: string;
  sanSrp: string;
  status: string;
  remarks?: string | null;
}

export interface Bank {
  id?: number;
  name: string;
}

export interface Drafter {
  id?: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://mymis.onrender.com/api';

  constructor(private http: HttpClient) {}

  // Auth
  login(credentials: any): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/login`, credentials);
  }

  updateCredentials(payload: any): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/auth/credentials`, payload);
  }

  // Drafts
  getDrafts(): Observable<FileDraft[]> {
    return this.http.get<FileDraft[]>(`${this.apiUrl}/drafts`);
  }

  getDraft(id: number): Observable<FileDraft> {
    return this.http.get<FileDraft>(`${this.apiUrl}/drafts/${id}`);
  }

  createDraft(draft: FileDraft): Observable<FileDraft> {
    return this.http.post<FileDraft>(`${this.apiUrl}/drafts`, draft);
  }

  updateDraft(id: number, draft: Partial<FileDraft>): Observable<FileDraft> {
    return this.http.patch<FileDraft>(`${this.apiUrl}/drafts/${id}`, draft);
  }

  deleteDraft(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/drafts/${id}`);
  }

  // Banks
  getBanks(): Observable<Bank[]> {
    return this.http.get<Bank[]>(`${this.apiUrl}/banks`);
  }

  createBank(name: string): Observable<Bank> {
    return this.http.post<Bank>(`${this.apiUrl}/banks`, { name });
  }

  updateBank(id: number, name: string): Observable<Bank> {
    return this.http.put<Bank>(`${this.apiUrl}/banks/${id}`, { name });
  }

  deleteBank(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/banks/${id}`);
  }

  // Drafters
  getDrafters(): Observable<Drafter[]> {
    return this.http.get<Drafter[]>(`${this.apiUrl}/drafters`);
  }


  updateDrafter(id: number, name: string): Observable<Drafter> {
    return this.http.put<Drafter>(`${this.apiUrl}/drafters/${id}`, { name });
  }

  createDrafter(name: string): Observable<Drafter> {
    return this.http.post<Drafter>(`${this.apiUrl}/drafters`, { name });
  }

  deleteDrafter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/drafters/${id}`);
  }
}
