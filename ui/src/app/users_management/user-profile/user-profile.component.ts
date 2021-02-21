import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { RoleService } from '../../services/role.service';
import { RoleModel } from '../../models/RoleModel';
import { UserModel } from '../../models/UserModel';
import { FormBuilder, FormGroup, Validators, EmailValidator } from '@angular/forms';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ConfirmComponent } from '../popups/confirm/confirm.component';
import { AuthGuard } from '../../services/auth.guard';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils.service';
import { AuthDataModel } from '../../models/AuthDataModel';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, AfterViewInit {
  roles: RoleModel[];
  role: RoleModel = new RoleModel();
  user: UserModel;
  users: UserModel[];
  userProfile: FormGroup;
  canEditElement = true;
  constructor(private router: Router,
    private authGuard: AuthGuard,
    public ls: LanguageService,
    private rs: RoleService,
    private userService: UserService,
    public fb: FormBuilder,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private utilsService: UtilsService) { }

  async ngOnInit() {
    this.userProfile = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(4)]],
      lastName: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.minLength(4), Validators.email]],
      address: ['', [Validators.required, Validators.minLength(4)]],
      phoneNo: ['', [Validators.required, Validators.minLength(4), Validators.minLength(10)]],
      details: ['', [Validators.required, Validators.minLength(4)]]
    });
    let url = this.router.url

    
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['mat-toolbar', 'btn-info']
    });
  }

  getUserUsername(): string {
    let pData = JSON.parse(this.utilsService.decodeObject(localStorage.getItem('pData')));
    if (pData){
      return pData.user.username;
    } else {
      return null;
    }
  }

  async ngAfterViewInit() {
    //this.roles = await this.rs.getRoles();

    const username = this.getUserUsername();
    if (!username) {
      return;
    }
    this.userService.getUserProfile(username).then(
      user => {
        let username = user.getUsername();
        let firstName = user.getFirstName();
        let email = user.getEmail();
        let lastName = user.getLastName();


        this.userProfile = this.fb.group({
          username: [username],
          firstName: [firstName, [Validators.minLength(4)]],
          lastName: [lastName, [Validators.minLength(4)]],
          email: [email, [Validators.minLength(4), Validators.email]],
          address: ['', [Validators.minLength(4)]],
          phoneNo: ['', [Validators.minLength(4), Validators.minLength(10)]],
          details: ['', [Validators.minLength(4)]]
        });
        this.userProfile.get('username').disable({ onlySelf: true });
      }
    )
  }

  getRoles(): RoleModel[]{
    let authData:AuthDataModel = new AuthDataModel().parse(JSON.parse(this.utilsService.decodeObject(localStorage.getItem('pData'))));
    if (authData){
      let roles:RoleModel[] = authData.getUser().getRoles();
      console.log(roles)
      return roles;
    } else {
      return null;
    }
  }

  saveProfile() {
    if (this.canEditElement) {
      const dialogRef = this.dialog.open(ConfirmComponent, {
        width: '500px',
      });

      dialogRef.componentInstance.acceptEvent.subscribe(_ => {
        if (this.userProfile.valid) {
          let username = this.getUserUsername();
          let updateUser: UserModel = new UserModel();
          let currentUserRoles = this.getRoles();
          console.log(currentUserRoles)
          console.log("Current roles:", currentUserRoles);
          let update = {
           // roles: currentUserRoles,
            username: this.userProfile.get('username').value,
            firstName: this.userProfile.get('firstName').value,
            lastName: this.userProfile.get('lastName').value,
            email: this.userProfile.get('email').value,
          }
          console.log("NU MERGE AICI",update)
          this.userService.updateUser(username, update)
        }
        dialogRef.close();
        this.openSnackBar("Profilul a fost salvat!", "OK")
      });

      dialogRef.componentInstance.declineEvent.subscribe(_ => {
        dialogRef.close();
        this.openSnackBar("Profilul nu a fost actualizat!", "OK")

      })
    }

  }
}
