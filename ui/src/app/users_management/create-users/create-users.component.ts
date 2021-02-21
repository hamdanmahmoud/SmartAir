import { Component, OnInit, AfterViewInit, Inject, EventEmitter } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { RoleModel } from '../../models/RoleModel';
import { RoleService } from '../../services/role.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserModel } from '../../models/UserModel';
import { DatabaseService } from '../../services/database.service';
export interface CreateUserData {
  email: string;
  username: string;
  lastName: string;
  firstName: string;
  selectedRoles: RoleModel[];
}
@Component({
  selector: 'app-create-users',
  templateUrl: './create-users.component.html',
  styleUrls: ['./create-users.component.scss']
})

export class CreateUsersComponent implements OnInit, AfterViewInit {
  availableRoles: RoleModel[];
  userDetails: FormGroup;
  email: string;
  username: string;
  lastName: string;
  firstName: string;
  selectedRoles: RoleModel[];

  addEvent: EventEmitter<any> = new EventEmitter<any>();


  constructor(public fb: FormBuilder, public ls: LanguageService, private rs: RoleService, public ds: DatabaseService, public dialogRef: MatDialogRef<any>
    , @Inject(MAT_DIALOG_DATA) public data: CreateUserData) {

    this.userDetails = fb.group({
      userid: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      selectedRoles: ['', [Validators.required]]

    });
  }

  ngOnInit() {

  }

  async ngAfterViewInit() {
    this.availableRoles = await this.rs.getRoles();
  }

  changeClient($value) {
    console.log($value)
    this.selectedRoles = $value;
    console.log(this.selectedRoles)
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };
  equals(roleOne, roleTwo) {
    if (typeof roleOne !== 'undefined' && typeof roleTwo != 'undefined') {
      return roleOne.id == roleTwo.id;
    }
  }

  createUser() {
    if (this.userDetails.valid) {
      let user = {
        roles: this.selectedRoles,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password:"smartair"
      };
      console.log("Sending user for saving:", user)
      this.addEvent.emit(user);
      this.dialogRef.close()
    }
  }
}