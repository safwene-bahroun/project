import { Component } from '@angular/core';
import { AdminInterfaceService } from '../admin-interface.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-interface',
  templateUrl: './admin-interface.component.html',
  styleUrls: ['./admin-interface.component.css']
})
export class AdminInterfaceComponent {
   cardData = { cin:'', rfid_code:'' };
  action: string = '';
  error: string | null = null;
  isInvalidCIN = false;
  isInvalidRFID = false;
  absences: any[] = [];
  constructor(private adminService: AdminInterfaceService, private router: Router) {}

  update() {
    this.isInvalidCIN = this.cardData.cin.length !== 8;
    this.isInvalidRFID = this.cardData.rfid_code.length !== 12;
  }

  onSubmit() {
    if (this.validateInputs()) {
      switch (this.action) {
        case 'add':
          this.adminService.addCard(this.cardData).subscribe(
            response => console.log('Card added successfully', response),
            error => console.error('Failed to add card', error)
          );
          break;
        case 'modify':
          this.adminService.modifyCard(this.cardData).subscribe(
            response => console.log('Card modified successfully', response),
            error => console.error('Failed to modify card', error)
          );
          break;
        case 'delete':
          this.adminService.deleteCard(this.cardData).subscribe(
            response => console.log('Card deleted successfully', response),
            error => console.error('Failed to delete card', error)
          );
          break;
      }
    }
  }

  validateInputs(): boolean {
    this.update();
    return !this.isInvalidCIN && !this.isInvalidRFID;
  }

 

loadAbsences() {
  this.adminService.loadAbsences().subscribe(
    data => {
      console.log('Absences loaded successfully', data);
      this.absences = data;
    },
    error => {
      console.error('Error loading absences', error);
      this.error = 'Error fetching absences';
    }
  );
}

  logout() {
    this.adminService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        this.router.navigate(['/admin_login']);
      },
      error => console.error('Logout failed', error)
    );
  }
}
