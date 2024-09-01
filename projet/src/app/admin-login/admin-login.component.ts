import { Component } from '@angular/core';
import { AuthAdminService } from '../auth-admin.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
 admin ={   
  user: '',
  password:'' };

  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$";
  loginFailed = false;
  loginSuccess = false;

  constructor(private adminService: AuthAdminService , private router: Router ) {}

  login() {


    this.adminService.loginAdmin(this.admin).subscribe(
      response => {
        console.log('Login successful', response);
        this.loginSuccess = true;
        this.loginFailed = false;
        this.router.navigate(['/admin_interface']);
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
