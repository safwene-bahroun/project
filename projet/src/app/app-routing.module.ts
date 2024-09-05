import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignComponent } from './sign/sign.component';
import { YourAbsenceComponent } from './your-absence/your-absence.component';
import { LoginComponent } from './login/login.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminSignComponent } from './admin-sign/admin-sign.component';
import { AdminInterfaceComponent } from './admin-interface/admin-interface.component';
import { WhoComponent } from './who/who.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: 'who', component: WhoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign', component: SignComponent },
  { path: 'admin_login', component: AdminLoginComponent },
  { path: 'admin_sign', component: AdminSignComponent },
  { 
    path: 'admin_interface', 
    component: AdminInterfaceComponent,
  },
  { 
    path: 'auth/absences/:id', 
    component: YourAbsenceComponent
  },
  { 
    path: 'auth/profile/:id', 
    component: YourAbsenceComponent
  },
  { path: '', redirectTo: '/who', pathMatch: 'full' },
  { path: '**', redirectTo: '/who' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
