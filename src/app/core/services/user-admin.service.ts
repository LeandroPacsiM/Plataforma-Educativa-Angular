import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendUserInfo } from '../models/api.models';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private http = inject(HttpClient);

  getUsers(): Observable<BackendUserInfo[]> {
    return this.http.get<BackendUserInfo[]>('/api/users');
  }

  getUser(id: number): Observable<BackendUserInfo> {
    return this.http.get<BackendUserInfo>(`/api/users/${id}`);
  }

  createUser(data: CreateUserRequest): Observable<BackendUserInfo> {
    return this.http.post<BackendUserInfo>('/api/users', data);
  }

  updateUser(id: number, data: UpdateUserRequest): Observable<BackendUserInfo> {
    return this.http.put<BackendUserInfo>(`/api/users/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }
}
