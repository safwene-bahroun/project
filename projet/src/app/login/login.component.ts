import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';

interface User {
  email: string;
  password: string;
  id?:any;
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
  user: User = { email: '', password: '',id:undefined };
  loginFailed = false;
  loginSuccess = false;

  constructor(private authService: AuthService, private router: Router,private route: ActivatedRoute) {
  }

 
  login() {
    this.authService.login(this.user.email, this.user.password).subscribe(
      response => {
        console.log('Login successful', response); // Check the structure of the response here
        this.loginSuccess = true;
        this.loginFailed = false;
        const userId = response.id;  // Ensure this matches the actual structure of the response
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || `your-absence/${userId}`;
        this.router.navigateByUrl(returnUrl);
      },
      error => {
        console.error('Login failed', error);
        this.loginFailed = true;
        this.loginSuccess = false;
      }
    );
  }
  
  
  verifier() {
    return this.loginFailed;
  }
}