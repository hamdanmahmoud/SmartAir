import { Component, OnInit, ViewChild } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { MatTableDataSource, MatDialog, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { UserModel } from '../../models/UserModel';
import { CreateUsersComponent } from '../create-users/create-users.component';
import { DatabaseService } from '../../services/database.service';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { ConfirmComponent } from '../popups/confirm/confirm.component';
import { SendPassword } from '../popups/send-password/send-password.component';
import { AuthGuard } from '../../services/auth.guard';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: UserModel[];
  dataSource: MatTableDataSource<UserModel>;
  displayedColumns = ["username", "firstName", "lastName", "email", "role", "update", "remove", "reset-password", "active"];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(public userService: UserService, public ls: LanguageService, public dialog: MatDialog, private ds: DatabaseService, private _snackBar: MatSnackBar, public authGuard: AuthGuard, public router: Router) {

  }

  async ngOnInit() {
  }

  async ngAfterViewInit() {
    this.users = await this.userService.getUsers();
    this.dataSource = new MatTableDataSource<UserModel>();
    this.dataSource.data = this.users;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['mat-toolbar', 'btn-info']

    });
  }
  addUsersDialog(): void {
    if (this.authGuard.canCreate(this.router.url)) {
      const dialogRef = this.dialog.open(CreateUsersComponent, {
        width: '800px',
      });

      dialogRef.componentInstance.addEvent.subscribe(user => {
        this.userService.addUser(user).then(
          response => {
            console.log(response);
            //this.openSnackBar("Userul a fost adaugat cu succes", "OK")
            dialogRef.close();
            // this.openSnackBar(response.error, "OK")
          }
        )
        this.ngAfterViewInit();
      })

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }

  }

  editUser(user: UserModel) {
    if (this.authGuard.canUpdate(this.router.url)) {
      let firstName = user.getFirstName();
      let lastName = user.getLastName();
      let username = user.getUsername();
      let email = user.getEmail()
      let roles = user.getRoles();
      let active = user.isActive();
      const dialogRef = this.dialog.open(EditUserComponent, {
        width: '800px',
        data: {
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          roles: roles,
          active: active
        }
      });

      dialogRef.componentInstance.updateEvent.subscribe(update => {
        console.log("Got from dialog:", update);
        console.log(username)
       // let username = update.username;
        let user = update.user;
        console.log("MERGE AICI",user)
        this.userService.updateUser(username, user).then(res => {
          // this.openSnackBar("Userul a fost modificat cu succes!", "OK")
          // this.openSnackBar("Userul nu a putut fi modificat!", "OK")
        });
        dialogRef.close();
        this.ngAfterViewInit();
      })

      dialogRef.componentInstance.changeActiveStatusEvent.subscribe(
        id => {
          this.userService.changeActiveStatus(id).then(
            res => {
              // this.openSnackBar("Statusul userului a fost modificat!", "OK");
              // this.openSnackBar("Statusul userului nu a putut fi modificat!", "OK");
            }
          );
          dialogRef.close();
          this.ngAfterViewInit();
        }
      )


      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }


  }

  removeUser(user: UserModel) {
    if (this.authGuard.canDelete(this.router.url)) {
      let username = user.getUsername();
      console.log(username);
      const dialogRef = this.dialog.open(ConfirmComponent, {
        width: '500px',
      });

      dialogRef.componentInstance.acceptEvent.subscribe(data => {
        this.userService.deleteUser(username).then(
          res => {
            // this.openSnackBar("Userul a fost sters!", "OK")
            // this.openSnackBar("Userul nu a putut fi sters!", "OK")
          });
        dialogRef.close();
        this.ngAfterViewInit();
      })

      dialogRef.componentInstance.declineEvent.subscribe(data => {
        console.log("close")
        dialogRef.close();
      })

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });

    }


  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };
  resetPassword(user: UserModel) {
    if (this.authGuard.canUpdate(this.router.url)) {
      const dialogRef = this.dialog.open(SendPassword, {
        width: '500px',
      });
      dialogRef.componentInstance.sendPassEvent.subscribe(sendPass => {
        let username = user.getUsername();
        this.userService.resetPassword(username)
        this.openSnackBar("Parola a fost trimisa pe emailul utilizatorului!", "OK")

      });
      dialogRef.componentInstance.cancelEvent.subscribe(_ => {
        this.openSnackBar("Parola nu a fost trimisa!", "OK")

        dialogRef.close();
      })
    }


  }
}
