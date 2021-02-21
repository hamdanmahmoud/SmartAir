import { Component, OnInit, Inject, AfterViewInit, EventEmitter, ɵConsole } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { RoleModel } from '../../models/RoleModel';
import { RoleService } from '../../services/role.service';
import { UserModel } from '../../models/UserModel';
import { DatabaseService } from '../../services/database.service';
import { MustMatch } from '../../models/MustMatch';
import { ConfirmComponent } from '../popups/confirm/confirm.component';
import { SendPassword } from '../popups/send-password/send-password.component';
import { AuthService } from '../..//services/auth.service';
import { UtilsService } from '../../services/utils.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit, AfterViewInit {
  userDetails: FormGroup;
  passwordManagement: FormGroup;
  roles: RoleModel[];
  user: UserModel = new UserModel();
  email: string;
  username: string;
  lastName: string;
  firstName: string;
  id: string
  role: Number;
  resetPassword = false;
  updateEvent: EventEmitter<any> = new EventEmitter<any>();
  changeActiveStatusEvent: EventEmitter<any> = new EventEmitter<any>();
  changePassEvent: EventEmitter<any> = new EventEmitter<any>();
  selectedRoles: string[];
  active: boolean;
  constructor(private authService: AuthService,
    private userService: UserService,
    private rs: RoleService,
    public fb: FormBuilder,
    public dialog: MatDialog,
    public ls: LanguageService,
    public _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditUserComponent>,
    private utilsService: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userDetails = fb.group({
      email: [data.email, [Validators.required, Validators.email]],
      firstName: [data.firstName, [Validators.required, Validators.minLength(1)]],
      lastName: [data.lastName, [Validators.required, Validators.minLength(1)]],
      username: [data.username, [Validators.required, Validators.minLength(1)]],
      address: ['', Validators.minLength(1)],
      roles: [data.roles, Validators.required],
      active: [data.active]
    });
    this.userDetails.get('username').disable({ onlySelf: true });
    this.selectedRoles = this.userDetails.get('roles').value;
    this.active = this.userDetails.get('active').value;
    console.log("ACTIVE:", this.active)

    this.passwordManagement = fb.group({
      password: ['', Validators.required, Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")],
      confirmPassword: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    })
  }


  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4000,
      panelClass: ['mat-toolbar', 'btn-info']

    });
  }
  changePassword() {
    let confirmPass = this.passwordManagement.get('confirmPassword').value;
    console.log(confirmPass)
    this.resetPassword = true;
    if (this.passwordManagement.invalid) {
      return;
    }
  }
  sendPassword() {
    const dialogRef = this.dialog.open(SendPassword, {
      width: '500px',
    });
    dialogRef.componentInstance.sendPassEvent.subscribe(sendPass => {
      let id = this.data.id;
      this.userService.resetPassword(id);
      this.openSnackBar("Parola a fost trimisa pe emailul utilizatorului", "OK")

    })
    dialogRef.componentInstance.cancelEvent.subscribe(_ => {
      dialogRef.close();
    })

    //dialogRef.componentInstance.
    /*  dialogRef.componentInstance.acceptEvent.subscribe(_ => {
       //TODO: SEND PASSWORD FOR THE SPECIFIC USER 
       let email = this.data.email;
       let id = this.data.id;
 
     });
     dialogRef.componentInstance.declineEvent.subscribe(_ => {
       dialogRef.close();
     }) */
  }
  updateUser() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '500px',
    });

    let currentUserRole = this.getUserRole();

    dialogRef.componentInstance.acceptEvent.subscribe(_ => {
      let newRoles = [];
      if (this.userDetails.valid) {
        let id = this.data.id;
        console.log("aaa", this.userDetails.get('roles'))
        let newRoleName = this.userDetails.get('roles').value;
        console.log("ROLEEEEEEEEES", newRoleName)
        for (let i in newRoleName) {
          let newRole: RoleModel = this.roles.find(role => role.getName() == newRoleName[i]);
          newRoles.push(newRole)
          console.log("NEW ROLES", newRole)
        }

        //let newRoleId = this.roles.find(role => role.getName() == newRoleName).getId();
        //console.log("New role id: ", newRoleId);
        let obj = {
          roles: this.userDetails.get('roles').value,
        //  username: this.userDetails.get('username').value,
          firstName: this.userDetails.get('firstName').value,
          lastName: this.userDetails.get('lastName').value,
         // email: this.userDetails.get('email').value,
        };

        console.log(obj)
        console.log("this.role updateusers", this.roles)
        let update = {
          id: this.data.username,
          user: obj
        };
        console.log(this.data.username)
        console.log("Sending user for updating", obj);
        this.updateEvent.emit(update);

        this.dialog.closeAll();

        /* if (this.getUserName() == obj.username) {
          if ((newRoleId).toString() != this.getUserRole()) {
            setTimeout(() => {
              this.authService.doLogout();
              this.openSnackBar("Va rugam sa va reconectati pentru a avea toate drepturile aferente rolului!", "OK")
            }, 2500);
          }
        } */
      }
    })
    dialogRef.componentInstance.declineEvent.subscribe(_ => {
      dialogRef.close();
      this.openSnackBar("Userul nu a fost modificat!", "OK")

    })
  }

  getUserName(): string {
    let pData = JSON.parse(this.utilsService.decodeObject(localStorage.getItem('pData')));
    if (pData) {
      return pData.user.userame;
    } else {
      return null;
    }
  }
  getUserRole(): string {
    let pData = JSON.parse(this.utilsService.decodeObject(localStorage.getItem('pData')));
    if (pData) {
      return pData.user.roles;
    } else {
      return null;
    }
  }
  async ngAfterViewInit() {
    this.roles = await this.rs.getRoles();

  }
  ngOnInit() {
    console.log(this.data)
  }

  changeActiveStatus() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '500px',
    });

    dialogRef.componentInstance.acceptEvent.subscribe(
      _ => {
        let id = this.data.id;
        this.changeActiveStatusEvent.emit(id);
        this.dialog.closeAll();
      })
    dialogRef.componentInstance.declineEvent.subscribe(_ => {
      dialogRef.close();
      this.openSnackBar("Userul nu a fost dezactivat!", "OK")

    })
  }
}
