import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../services/auth.guard';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { UserProfileComponent } from '../users_management/user-profile/user-profile.component';
import { RolesComponent } from '../users_management/roles/roles.component';
import { CreateUsersComponent } from '../users_management/create-users/create-users.component';
import { UsersComponent } from '../users_management/users/users.component';
import { PasswordRecoveryComponent } from '../users_management/password-recovery/password-recovery.component';
import { PasswordResetComponent } from '../users_management/password-reset/password-reset.component';
import { AuthService } from '../services/auth.service';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'roles',
    component: RolesComponent,
    canActivate: [AuthGuard]
  },
  {
    path:'sidebar',
    component:SidebarComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [AuthGuard]
  },
  {
    path:'recoverypassword',
    component:PasswordRecoveryComponent
  },
  {
    path:'changepassword/:id',
    component:PasswordResetComponent
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class UsersRoutingModule { }
