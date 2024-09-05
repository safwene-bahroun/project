import { Component } from '@angular/core';
import { AuthService } from '../auth.service'; // Adjust the path as necessary
 interface User {
  id: any;
  token: string;
  refreshToken?: string;
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  classes: string;
  fields: string;
  password: string;
}
@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent {
  image = 'assets/images/pr.jpeg'; // Adjusted path
  user: User = {
    id:0,
    token:'',
    cin: '',
    nom: '',
    prenom: '',
    email: '',
    classes: 'choose option',
    fields: 'choose option',
    password: ''
  };
  color: any = {
    nom: '',
    prenom: '',
    cin: '',
    email: '',
    password :'',
    classes : '',
    fields :'',
  };
  
  submitted = false;
  emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private authService: AuthService) {}

  getColor(control: string): string {
    return this.color[control] || '';
  
}

  update() {
    this.color.nom = this.user.nom ? 'success' : 'error';
    this.color.prenom = this.user.prenom ? 'success' : 'error';
    this.color.cin = this.user.cin.length >= 8 ? 'success' : 'error';
    this.color.email = this.user.email.match(this.emailPattern) ? 'success' : 'error';
    this.color.password = this.user.password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/) ? 'success' : 'error';
    this.color.classes = this.user.classes && this.user.classes !== 'choose option' ? 'success' : 'error';
    this.color.fields = this.user.fields && this.user.fields !== 'choose option' ? 'success' : 'error';
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
    this.authService.register(this.user).subscribe(
      response => {
        console.log('User registered successfully', response);
      },
      error => {
        console.error('Registration error', error);
      }
    );
  }


}
