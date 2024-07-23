import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/api/users`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching users: ', error);
        return throwError(error);
      })
    );
  }

  public createNewUser(user: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/api/users`, user).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
          console.error('Invalid user data: ', error.error);
        } else {
          console.error('Error creating user: ', error);
        }
        return throwError(error);
      })
    );
  }

  public updateUser(userId: number, updatedUser: User): Observable<User> {
    const url = `${environment.apiUrl}/api/users/${userId}`; 
    return this.http.put<User>(url, updatedUser).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.error('User not found:', userId);
        } else {
          console.error('Error updating user:', error);
        }
        return throwError(error); 
      })
    );
  }

  public toggleLockUser(userId: number): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/api/users/${userId}/lock`, {}); 
  }

  public deleteUserById(userId: number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/api/users/${userId}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.error('User not found: ', userId);
          } else {
            console.error('Error deleting user: ', error);
          }
          return throwError(error);
        })
      );
  }
}