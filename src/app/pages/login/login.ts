import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  logoUrl = 'assets/images/home-dryforest.png';

  constructor (private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    // Validation basique
    if (!this.username || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Connexion réussie');
        
        // Redirection simple - tu peux adapter selon le rôle
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    });
  }

  resetForm(): void {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }
}