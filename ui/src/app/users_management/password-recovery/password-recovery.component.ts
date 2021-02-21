import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { TransitionCheckState, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnInit {
  recovery: FormGroup;
  validate = false;
  constructor(
    public fb: FormBuilder,
    private userService: UserService,
    public _snackBar: MatSnackBar,
    private router: Router,
    public ls: LanguageService) {
    this.recovery = fb.group({
      identification: ['', [Validators.required, Validators.minLength(4)]],
    })

  }

  ngOnInit() {
  }
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 10000,
      panelClass: ['mat-toolbar', 'btn-info']
    });
  }

  recoverPassword() {
    let identification = this.recovery.get('identification').value;
    if (this.recovery.valid) {
      this.userService.recoveryPassword(identification).then(_ => {
        this.validate = true; // nush ce e acest this.validate = true, dar ma rog
        this.openSnackBar(this.ls.strings.default.recoveryPassMessage1 + " " + identification + ". " + this.ls.strings.default.recoveryPassMessage2, "OK"); // pune stringu acu 
      });
    }

  }
  isValid() {
    return true;
  }
}
