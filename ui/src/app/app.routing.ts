import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { DashboardComponent } from './/components/dashboard/dashboard.component';
import { UsersRoutingModule } from './users_management/users.routing';
import { ChartsModule } from 'ng2-charts';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
    canActivate:[AuthGuard]
  },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,ChartsModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule, UsersRoutingModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
