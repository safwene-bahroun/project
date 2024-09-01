import { Component } from '@angular/core';
import { AuthAdminService } from '../auth-admin.service';  // Ensure this path is correct

@Component({
  selector: 'app-admin-sign',
  templateUrl: './admin-sign.component.html',
  styleUrls: ['./admin-sign.component.css']
})
export class AdminSignComponent {
  admin: any = {
    admin_name: '',
    cin: '',
    email: '',
    password: '',
  };

  color: any = {
    admin_name: '',
    email: '',
    cin: '',
    password: '',
  };

  submitted = false;
  emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private adminService: AuthAdminService) {}  // Correctly using the service

  getColor(control: string): string {
    return this.color[control] || '';
  }

  update() {
    this.color.admin_name = this.admin.admin_name ? 'success' : 'error';
    this.color.cin = this.admin.cin.length >= 8 ? 'success' : 'error';
    this.color.email = this.admin.email.match(this.emailPattern) ? 'success' : 'error';
    this.color.password = this.admin.password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/) ? 'success' : 'error';
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.submitted = true;
      if (Object.values(this.color).every(c => c === 'success')) {
        this.register();
      } else {
        console.log('Form is valid but manual validation failed');
      }
    } else {
      this.submitted = false;
      console.log('Form is invalid');
    }
  }

  register() {
    this.adminService.registerAdmin(this.admin).subscribe(
      response => {
        console.log('Registration successful', response);
      },
      error => {
        console.error('Registration failed', error);
      }
    );
  }
}
