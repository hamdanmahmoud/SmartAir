import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { MatDialog, MatTableDataSource, MatSnackBar, MatDialogRef } from '@angular/material';
import { AddRoleComponent } from '../popups/add-role/add-role.component';
import { RoleModel } from '../..//models/RoleModel';
import { RoleService } from '../../services/role.service';
import { DatabaseService } from '../../services/database.service';
import * as _ from "lodash";
import { ConfirmComponent } from '../popups/confirm/confirm.component';
import { Router } from '@angular/router';
import { AuthGuard } from '../../services/auth.guard';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: RoleModel[];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  public displayedColumns: string[] = ["component", "access", "retrieve", "create", "update", "delete"];
  role: RoleModel = new RoleModel(); // role for which we visualize permissions
  constructor(public authGuard: AuthGuard, public router: Router, public ls: LanguageService, public dialog: MatDialog, private roleService: RoleService, private ds: DatabaseService, private _snackBar: MatSnackBar) {
  }

  ngOnInit() {

  }

  async ngAfterViewInit() {
    this.roles = await this.roleService.getRoles();
    this.setDefaultRole();
  }

  setDefaultRole() {
    if (this.roles.length) {
      let adminIndex = this.roles.findIndex(element => element.getName() === "admin");
      this.changeRole(this.roles[adminIndex]);
    }
  }

  changeRole(role: RoleModel) {
    this.role = role;
    this.setDataSource();
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };
  setDataSource() {
    let role = this.role;
    let accessList = role.getAccessList().sort();
    let arr = [];
    accessList.forEach(
      element => {
        let component = element.component;
        let componentName = component;
        let model = {
          'component': componentName,
          'access': role.canAccessComponent(componentName),
          'retrieve': role.canRetrieveComponent(componentName),
          'create': role.canCreateComponent(componentName),
          'update': role.canUpdateComponent(componentName),
          'delete': role.canDeleteComponent(componentName)
        };
        arr.push(model)
      }
    )
    this.dataSource.data = [...arr];
  }

  changePermission(componentName: string, permission: string) {
    this.role.changePermission(componentName, permission);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['mat-toolbar', 'btn-info']
    });
  }

  checkevent(event) {
    console.log(event)
    return event;
  }

  async saveRole() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '500px',
    });

    dialogRef.componentInstance.acceptEvent.subscribe(emittedEvent => {
      let update = { accessList: this.role.getAccessList() };
      this.roleService.updateRole(this.role.getName(), update)
        .then(res => { console.log(res); this.openSnackBar(this.ls.strings.snackBarSuccessfullyUpdatedRole, "OK"); });
      dialogRef.close();
    });

    dialogRef.componentInstance.declineEvent.subscribe(emittedEvent => {
      dialogRef.close();
    })
  }


  removeRole(): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '500px',
    });

    dialogRef.componentInstance.acceptEvent.subscribe(emittedEvent => {
      let roleName = this.role.getName();
      this.roleService.deleteRole(roleName).then((role: RoleModel) => {
        this.openSnackBar(this.ls.strings.snackBarSuccessfullySavedRole, "OK")
      });
      if (this.roles[0]) {
        let adminIndex = this.roles.findIndex(element => element.getName() === "admin");
        this.roles.splice(_.indexOf(this.roles, _.find(this.roles, function (item) { return item.getName() === roleName; })), 1);
        this.changeRole(this.roles[adminIndex]);
      }
      dialogRef.close();
    });

    dialogRef.componentInstance.declineEvent.subscribe(emittedEvent => {
      dialogRef.close();
    });

  }

  addRole(): void {
    const dialogRef = this.dialog.open(AddRoleComponent, {
      width: '300px',
    });

    dialogRef.componentInstance.addRoleEvent.subscribe(
      newRoleName => {
        let newRole = this.role.getEquivalentRoleWithNoPermissions(newRoleName);
        let newRoleObject = new RoleModel().parse(JSON.parse(JSON.stringify(newRole)));
        this.roleService.addRole(newRole)
          .then(
            (role: RoleModel) => {
              this.openSnackBar(this.ls.strings.snackBarSuccessfullyDeletedRole, "OK")
            }
          );
        this.changeRole(newRoleObject);
        if (this.roles.indexOf(newRoleObject) == -1) {
          this.roles.push(newRoleObject);
          this.setDataSource();
        }
        dialogRef.close();
      }
    )

  }

}
