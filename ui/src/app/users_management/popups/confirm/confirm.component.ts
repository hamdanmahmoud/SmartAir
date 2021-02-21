import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  @Input()
  acceptEvent: EventEmitter<string> = new EventEmitter<string>();
  declineEvent: EventEmitter<string> = new EventEmitter<string>();
  constructor(public dialogRef: MatDialogRef<ConfirmComponent>, public ls: LanguageService) { }

  ngOnInit() {
  }
  
  accept() {
    this.acceptEvent.emit();
  }

  decline() {
    this.declineEvent.emit()
  }

}
