import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material';
import { MatButtonModule } from '@angular/material';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { CdkTableModule } from '@angular/cdk/table';
import { MatRippleModule, } from '@angular/material';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator'
import { UserProfileComponent } from '../users_management/user-profile/user-profile.component';
import { CreateUsersComponent } from '../users_management/create-users/create-users.component';
import { RolesComponent } from './roles/roles.component';
import { DatabaseService } from '../services/database.service';
import { AddRoleComponent } from './popups/add-role/add-role.component';
import { EditUserComponent } from '../users_management/edit-user/edit-user.component'
import { API } from 'API.conf';
import { UsersComponent } from '../users_management/users/users.component';
import { ConfirmComponent } from './popups/confirm/confirm.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../services/authconfig.interceptor';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { PasswordRecoveryComponent } from '../users_management/password-recovery/password-recovery.component';
import { SendPassword } from './popups/send-password/send-password.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { UtilsService } from '../services/utils.service';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule,
    HttpClientModule,
    MatButtonModule,
    MatRippleModule,
    MatCheckboxModule,
    MatGridListModule,
    MatInputModule,
    MatIconModule,
    BrowserAnimationsModule,
    FormsModule,
    CdkTableModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MDBBootstrapModule.forRoot()
  ],
  declarations: [
    AddRoleComponent,
    UserProfileComponent,
    RolesComponent,
    CreateUsersComponent,
    UsersComponent,
    EditUserComponent,
    LoginFormComponent,
    ConfirmComponent,
    PasswordRecoveryComponent,
    PasswordResetComponent,
    SendPassword,

  ],
  exports: [],
  entryComponents: [ LoginFormComponent,AddRoleComponent, CreateUsersComponent, EditUserComponent, ConfirmComponent, SendPassword],
  providers: [API, DatabaseService, UtilsService, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: []
})
export class UsersModule { }
