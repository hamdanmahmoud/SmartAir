import { Component, OnInit, EventEmitter } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmComponent } from '../confirm/confirm.component';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-send-password',
  templateUrl: './send-password.component.html',
  styleUrls: ['./send-password.component.scss']
})
export class SendPassword implements OnInit {
  sendPassEvent: EventEmitter<any> = new EventEmitter<any>();
  cancelEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialogRef: MatDialogRef<ConfirmComponent>, public dialog: MatDialog, private _snackBar: MatSnackBar, public ls: LanguageService) { }

  ngOnInit() {
  }
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['mat-toolbar', 'btn-info']

    });
  }
  sendPassword() {

    this.sendPassEvent.emit();
    this.openSnackBar("Parola a fost trimisă cu succes!","OK");
    this.dialogRef.close();


   /*  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
    });
    this.dialogRef.close();
    dialogRef.componentInstance.acceptEvent.subscribe(sendPass => {
      //TODO: SEND PASSWORD TO EMAIL FOR THE SPECIFIC USER

      
      this.sendPassEvent.emit(sendPass);
      dialogRef.close();
    });

    dialogRef.componentInstance.declineEvent.subscribe(_ => {
      dialogRef.close();
    }) */
  }

  cancel(){

    this.cancelEvent.emit();
    this.openSnackBar("Parola nu a fost trimisă!", "OK")
    this.dialogRef.close();

  }
}
