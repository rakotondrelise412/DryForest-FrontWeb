import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import { Person } from '../../models/person.model';
import { LoginRequest, LoginResponse } from '../../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient, private router: Router) {}

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/weblogin`, credentials)
            .pipe(
                tap(response => {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.person));
                    localStorage.setItem('user_id', response.id_user.toString());
                    
                    localStorage.setItem('token_expiry', response.expires_at.toString());
                }),
                catchError(error => {
                    let errorMessage = 'Erreur de connexion';
                    
                    if (error.status === 401) {
                        errorMessage = 'Identifiants incorrects';
                    } else if (error.status === 0) {
                        errorMessage = 'Impossible de contacter le serveur';
                    }
                    
                    return throwError(() => new Error(errorMessage));
                })
            );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_id');
        
        this.router.navigate(['/login']);
    }

    isTokenExpired(): boolean {
        const expiresAt = localStorage.getItem('token_expiry');
        if (!expiresAt) return false;
        
        const expiryDate = new Date(expiresAt);
        return new Date() > expiryDate;
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        
        if (!token || this.isTokenExpired()) {
            this.logout();
            return false;
        }
        
        return true;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser(): Person | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    getUserId(): number | null {
        const userId = localStorage.getItem('user_id');
        return userId ? parseInt(userId, 10) : null;
    }

    getFullName(): string | null {
        const user = this.getCurrentUser();
        return user ? `${user.first_name} ${user.last_name}` : null;
    }

    getRole(): string | null {
        const user = this.getCurrentUser();
        return user?.role?.name || null;
    }
}
