import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

interface User {
  id?: number; // Adjusted to number for type safety
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  border = '1';
  color = 'green';
  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$";
  user: User = { email: '', password: '' };
  loginFailed = false;
  loginSuccess = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.user.email, this.user.password).subscribe(
      response => {
        console.log('Login successful', response);
        this.loginSuccess = true;
        this.loginFailed = false;

        // Navigate to the user's absences page
        const userId = response.id; // Adjust based on your API response structure
        if (userId) {
          this.router.navigate([`/auth/profile/${userId}`]); // Corrected syntax for dynamic route
        } else {
          this.errorMessage = 'User ID not found in response.';
          this.loginFailed = true;
        }
      },
      error => {
        console.error('Login failed', error);
        this.loginFailed = true;
        this.loginSuccess = false;
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
      }
    );
  }

  verifier(): boolean {
    return this.loginFailed;
  }
}
