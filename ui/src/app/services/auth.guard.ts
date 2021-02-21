import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MatDialog } from '@angular/material';
import { DialogService } from './dialog.service';
import { AuthDataModel } from '../models/AuthDataModel';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, public router: Router, public dialog: MatDialog, private dialogService: DialogService) { }

  canActivate(
    next: ActivatedRouteSnapshot): boolean {
    if (!localStorage.getItem('pData')) { // for routes that need to be activated, if localStorage cleared => relog
      this.authService.loggedIn = undefined;
      this.authService.doLogout();
    }
    if (!this.authService.isLoggedIn()) {
      console.log("User not logged in.")
      return false;
    } else {
      let url = this.router.getCurrentNavigation().finalUrl.toString().slice(1);
      // url = url.charAt(0).toUpperCase() + url.slice(1);
      url = url.charAt(0) + url.slice(1);
      let user = this.getAuthData().getUser()
      if (user) {
        let accessPermission = user.getImpersonateRole().getPermissionsByComponentName(url).access;
        return accessPermission;
      } else {
        return false; 
      }
    }
  }

  canView(url: string): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    } else {
      url = url.slice(1);
      url = url.charAt(0) + url.slice(1);
      let user = this.getAuthData().getUser();
      if (user) {
        console.log("Impersonating with:", user.getImpersonateRole())
        let viewPermission = user.getImpersonateRole().getPermissionsByComponentName(url).retrieve;
        return viewPermission;
      } else {
        return false;
      }
    }
  }

  canCreate(url: string): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    } else {
      url = url.slice(1);
      // url = url.charAt(0).toUpperCase() + url.slice(1);
      url = url.charAt(0) + url.slice(1);
      let user = this.getAuthData().getUser();
      if (user) {
        let createPermission = user.getImpersonateRole().getPermissionsByComponentName(url).create;
        return createPermission;
      } else {
        return false;
      }
    }
  }

  canUpdate(url: string): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    } else {
      url = url.slice(1);
      url = url.charAt(0) + url.slice(1);
      let user = this.getAuthData().getUser();
      if (user) {
        let updatePermission = user.getImpersonateRole().getPermissionsByComponentName(url).update;
        return updatePermission;
      } else {
        return false;
      }
    }
  }

  canDelete(url: string): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    } else {
      url = url.slice(1);
      url = url.charAt(0) + url.slice(1);
      let user = this.getAuthData().getUser();
      if (user) {
        let deletePermission = user.getImpersonateRole().getPermissionsByComponentName(url).delete;
        return deletePermission;
      } else {
        return false;
      }
    }
  }

  getAuthData(): AuthDataModel {
    return this.authService.getAuthData();
  }

}