import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { AuthGuard } from '../../services/auth.guard';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { DialogService } from '../../services/dialog.service';
import { RoleModel } from '../../models/RoleModel';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Vizualizare generala', icon: 'dashboard', class: '' },
  { path: '/users', title: 'Utilizatori', icon: 'people', class: '' },
  { path: '/roles', title: 'Roluri', icon: 'create', class: '' },
  { path: '/profile', title: 'Profil', icon: 'person', class: '' },
  { path:'', title:"API doc",icon :'person',class:''}

];
export const APIROUTER: RouteInfo [] =[
  { path:'', title:"API doc",icon :'person',class:''}

]

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  subscription: Subscription;
  roles: RoleModel[] = [];
  role: RoleModel = new RoleModel();
  savedUserSubscription: Subscription;
  APIROUTES: RouteInfo

  constructor(private dialogService: DialogService, private router: Router, public ls: LanguageService, private authService: AuthService, private authGuard: AuthGuard) {
    this.menuItems = this.authService.viewRoutes;
    this.APIROUTES=
      { path:'', title:"API doc",icon :'assignment',class:''}
    
    
    // console.log("ITEMS:", this.authService.viewRoutes)
  }

  ngOnInit() {
  
  }
  logout() {
    this.authService.doLogout()
  }
  impersonate($value) {
    //console.log("Impersonating ", $value);
    this.authService.changeImpersonateRoleInCurrentUser($value);

  }

  openLoginForm(): void {
    this.dialogService.openDialog();
  }
  async ngAfterViewInit() {
    console.log(this.authService.roles)
  }
  changeImpersonate(role) {
    console.log("Roles:", this.roles)
    console.log("Impersonating ", role);
    this.authService.changeImpersonateRoleInCurrentUser(role);
  }
  isLoggedIn() {
    if (this.authService.isLoggedIn() == true) {
      return true;
    }
    else {
      return false;
    }
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };

  changeToEnglish() {
    this.ls.changeLanguage('EN');
  }

  changeToRomanian() {
    this.ls.changeLanguage('RO');
  }
  changeToFrench() {
    this.ls.changeLanguage('FR');
  }
}
