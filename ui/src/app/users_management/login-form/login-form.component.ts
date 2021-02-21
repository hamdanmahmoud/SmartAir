import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, Form } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  loginResponse = false;
  
  submitEvent: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  constructor(public ls: LanguageService, public fb:FormBuilder, public router: Router, public dialogRef: MatDialogRef<LoginFormComponent>) { 
   
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  
  }
  ngOnInit() {
 
  }
  passwordRecovery(){
    this.router.navigate(['recoverypassword'])
    this.dialogRef.close();
  }
  async doLogin(){
    this.submitEvent.emit(this.loginForm);
  }

  // validation rules to be defined here
  isValidForm(){
    return true;
  }

  
}
