import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module'; // Correctly imported
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignComponent } from './sign/sign.component';
import { YourAbsenceComponent } from './your-absence/your-absence.component';
import { AdminSignComponent } from './admin-sign/admin-sign.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminInterfaceComponent } from './admin-interface/admin-interface.component';
import { WhoComponent } from './who/who.component';
import { AuthService } from './auth.service';
import { AbsencesService } from './absences.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignComponent,
    YourAbsenceComponent,
    AdminSignComponent,
    AdminLoginComponent,
    AdminInterfaceComponent,
    WhoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // This should include RouterModule.forRoot(routes) internally
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthService,
    AbsencesService,
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
