import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserModel } from '../models/UserModel';
import { DatabaseService } from './database.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EventEmitter } from '@angular/core';
import { DialogService } from './dialog.service';
import { UtilsService } from './utils.service';
import { MatDialog } from '@angular/material';
import { AuthDataModel } from '../models/AuthDataModel';
import { RoleModel } from '../models/RoleModel';
import { LanguageService } from './language.service';
import { ConnectionBackend } from '@angular/http';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  endpoint: string = 'http://localhost:4000';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  jwt = new JwtHelperService();
  authData: AuthDataModel;
  savedUserEvent: EventEmitter<any> = new EventEmitter<any>();
  loggedInEvent: EventEmitter<any> = new EventEmitter<any>();
  loggedOutEvent: EventEmitter<any> = new EventEmitter<any>();
  allRoutes: RouteInfo[] = [];
  viewRoutes: RouteInfo[] = [];
  subscription: Subscription;
  roles: RoleModel[];
  loggedIn: boolean;
  impersonateRole: RoleModel;
  constructor(
    public router: Router,
    public ds: DatabaseService,
    private dialogService: DialogService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private ls: LanguageService) {

    this.allRoutes = [
      { path: '/dashboard', title: this.ls.strings.default.routeinfo_dashboard_title, icon: 'dashboard', class: '' },
      { path: '/users', title: this.ls.strings.default.routeinfo_users_title, icon: 'people', class: '' },
      { path: '/roles', title: this.ls.strings.default.routeinfo_roles_title, icon: 'create', class: '' },
      { path: '/profile', title: this.ls.strings.default.routeinfo_profile_title, icon: 'person', class: '' },
    ];


    this.getAuthData();
    this.viewRoutes = this.allRoutes.filter(route => this.getViewPermission(route.path));
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!this.router.navigated) {
          console.log("DID REFRESH")
          this.getAuthData();
          if (this.authData && this.authData.getUser()) {
            this.changeImpersonateRoleInCurrentUser(this.getAuthData().getUser().getImpersonateRole())
          }
        }
      }

    });

    this.ds.needsLogIn.subscribe(
      _ => {
        this.loggedIn = undefined;
        this.doLogout();
        this.loggedIn = undefined;
        this.dialogService.openDialog();
      }
    );
    this.dialogService.submitEvent.subscribe(
      value => {
        this.signIn(value).then(
          (res: any) => {
            if (res) {
              // logged in
              this.loggedIn = true;
              console.log("Logged in successfully.");
              this.dialogService.closeDialog();
              this.router.navigate(['dashboard']);
            }
            else {
              this.loggedIn = undefined;
              this.dialogService.loginFailed();
            }
          }
        )
      }
    );
  }

  getViewPermission(path) {
    path = path.slice(1);
    path = path.charAt(0) + path.slice(1);
    this.getAuthData();
    if (this.authData && this.authData.getUser()) {
      return this.authData.getUser().getImpersonateRole().getPermissionsByComponentName(path).retrieve;
    } else {
      return false;
    }
  }

  async signIn(credentials: UserModel): Promise<boolean> {
    let successful = false;
    console.log("Provided credentials:", credentials);
    await this.ds.signIn(credentials).then(
      res => {
        if (res) {
          this.authData = new AuthDataModel().parse(res); 
          this.impersonateRole = this.authData.getUser().getFirstRole();
          this.authData.getUser().setImpersonateRole(this.impersonateRole);
          let token = this.authData.getToken();
          localStorage.setItem('pData', this.utilsService.encodeObject(JSON.stringify(this.authData)));
          successful = true;
          this.allRoutes = [
            { path: '/dashboard', title: this.ls.strings.default.routeinfo_dashboard_title, icon: 'dashboard', class: '' },
            { path: '/users', title: this.ls.strings.default.routeinfo_users_title, icon: 'people', class: '' },
            { path: '/roles', title: this.ls.strings.default.routeinfo_roles_title, icon: 'create', class: '' },
            { path: '/profile', title: this.ls.strings.default.routeinfo_profile_title, icon: 'person', class: '' },
          ];
          this.viewRoutes = this.allRoutes.filter(route => this.getViewPermission(route.path));
          this.roles = this.authData.getUser().getRoles();
          this.loggedIn = true;
          this.router.navigate(['/dashboard']); 
        } else {
          console.log("Provided invalid credentials.");
        }
      }
    )
    return successful;
  }

  async changeImpersonateRoleInCurrentUser(role: RoleModel) {
    this.getAuthData(); // set authData from storage if not defined in authservice
    this.authData.getUser().setImpersonateRole(role);
    this.impersonateRole = this.authData.getUser().getImpersonateRole()
    this.allRoutes = [
      { path: '/dashboard', title: this.ls.strings.default.routeinfo_dashboard_title, icon: 'dashboard', class: '' },
      { path: '/users', title: this.ls.strings.default.routeinfo_users_title, icon: 'people', class: '' },
      { path: '/roles', title: this.ls.strings.default.routeinfo_roles_title, icon: 'create', class: '' },
      { path: '/profile', title: this.ls.strings.default.routeinfo_profile_title, icon: 'person', class: '' },
    ];
    this.viewRoutes = this.allRoutes.filter(route => this.getViewPermission(route.path)); // sidebar
    this.roles = this.authData.getUser().getRoles(); // navbar
    localStorage.setItem('pData', this.utilsService.encodeObject(JSON.stringify(this.authData)));
  }

  getAuthData() {
    if (!this.authData) {
      this.authData = new AuthDataModel().parse(JSON.parse(this.utilsService.decodeObject(localStorage.getItem('pData'))));
      this.loggedIn = true;
      if (this.authData && this.authData.getUser()) {
        this.impersonateRole = this.authData.getUser().getImpersonateRole()
      }
    }

    return this.authData;
  }


  getToken() {
    let pData = JSON.parse(this.utilsService.decodeObject(localStorage.getItem('pData')));
    if (pData) {
      return pData.token;
    } else {
      this.loggedIn = undefined;
      return null;
    }
  }

  doLogout() {
    console.log("Removing pData, closing all dialogs");
    localStorage.removeItem('pData')
    console.log("Closing all dialogs")
    this.dialog.closeAll();
    this.loggedOutEvent.emit();
    this.authData = undefined;
    this.loggedIn = undefined;
    this.dialogService.openDialog();
    this.router.navigate(['/']);
  }

  isLoggedIn() {
    if (this.loggedIn   && this.impersonateRole  ) {
      return true;
    }
    return false;
  }

}

