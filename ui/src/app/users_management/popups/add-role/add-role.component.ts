import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from '../../../services/database.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {
  @Output()
  addRoleEvent: EventEmitter<string> = new EventEmitter<string>();
  
  angForm: FormGroup;
  constructor(private fb: FormBuilder, private ds: DatabaseService, public dialogRef: MatDialogRef<AddRoleComponent>, public ls: LanguageService) {
    this.createForm();
  }

  createForm() {
    this.angForm = this.fb.group({
      roleName: ['', Validators.required]//,
    });
  }

  addRole(roleName) {
    this.addRoleEvent.emit(roleName);
  }

  ngOnInit() {
  }

}