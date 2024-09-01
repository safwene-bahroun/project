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
  { path: 'admin_interface', component: AdminInterfaceComponent, canActivate: [AuthGuard] }, // Protect admin interface
  { path: 'your-absence/:id', component: YourAbsenceComponent, canActivate: [AuthGuard] }, // Protect absence routes
  { path: 'your-absence/profile/:id', component: YourAbsenceComponent, canActivate: [AuthGuard] },
  { path: 'your-absence/:id/:cin', component: YourAbsenceComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/who', pathMatch: 'full' },
  { path: '**', redirectTo: '/who' } // Wildcard route for 404
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
