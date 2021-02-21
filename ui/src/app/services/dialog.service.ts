import { Injectable, EventEmitter } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { LoginFormComponent } from '../users_management/login-form/login-form.component';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { KitchenPopupComponent } from 'app/components/home-management/kitchenPopup/kitchen-popup.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogRef: MatDialogRef<LoginFormComponent>;
  submitEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor(public dialog: MatDialog) { }

  openDialog(): MatDialogRef<LoginFormComponent> {

    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(LoginFormComponent, {
      width: '300px',
      autoFocus:true,
      hasBackdrop: false
    });

    this.dialogRef.componentInstance.submitEvent.subscribe(loginForm => {
      let value = loginForm.value;
      this.submitEvent.emit(value);

    })

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
    return this.dialogRef;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  loginFailed(): void {
    this.dialogRef.componentInstance.loginResponse = true;
    this.dialogRef.componentInstance.loginForm.reset();
  }

  openLiveDialog() {
    this.dialog.open(KitchenPopupComponent, {
      width: '70%',
      disableClose: true,
      maxHeight:'500px'
    });
    

  }
}
