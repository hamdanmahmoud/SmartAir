import { Injectable } from '@angular/core';
import * as stringsRO from '../../assets/strings/stringsRO.json';
import * as stringsEN from '../../assets/strings/stringsEN.json';
import * as stringsFR from '../../assets/strings/stringsFR.json';


@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  public strings: any;
  public lang = "";

  constructor() {
    this.strings = {};
    let lang = this.getLang();
    if (lang) {
      this.lang = lang;
    }
    else { this.lang = "RO"; }
    this.lang = this.lang.toUpperCase();
    if (lang == 'RO'){
      this.strings = stringsRO;
    } else if(this.lang =='EN') {
      this.strings = stringsEN;
    }else{
      this.strings = stringsFR;

    }
  }

  getLang(): string {
    return localStorage.getItem("lang")
  }



  public getString(id) {
    return this.strings[id];
  }

  changeLanguage(lang) {
    localStorage.setItem("lang", lang)
    this.lang = lang;
    if (lang == 'RO'){
      this.strings = stringsRO;
    } else if (lang =='EN'){
      this.strings = stringsEN;
    }else{
      this.strings = stringsFR;
    }
  }
}
