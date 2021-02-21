import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { ConfirmComponent } from '../popups/confirm/confirm.component';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MustMatch } from '../../models/MustMatch';
import { DatabaseService } from '../../services/database.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Route } from '@angular/compiler/src/core';
import { LanguageService } from '../../services/language.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  id: string;
  passwordManagement: FormGroup;
  constructor(
    public ls: LanguageService,
    public fb: FormBuilder,
    public userService: UserService,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private router: Router) {

    this.passwordManagement = this.fb.group({
      temporaryPassword: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]

    })

  }
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['mat-toolbar', 'btn-info']
    });
  }
  ngOnInit() {
    this.route.paramMap.pipe(map(paramMap => paramMap.get('id'))).subscribe(
      id => {
        this.id = id;
      }
    );
    console.log("initializare password reset")

  }

  changePassword() {
    if (this.passwordManagement.valid) {
      let oldPass = this.passwordManagement.get('temporaryPassword').value;
      let newPass = this.passwordManagement.get('password').value;
      this.userService.changePassword(this.id, oldPass, newPass).then(
        result => {
          this.openSnackBar("Parola a fost schimbata cu succes! Veti fi redirectionat la pagina principala.", "OK");
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 3000);
        }
      );
    }

  }

}
