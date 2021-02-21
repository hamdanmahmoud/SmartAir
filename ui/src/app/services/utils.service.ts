import { RoleModel } from "../models/RoleModel";
import * as CryptoJS from 'crypto-js';
import { throwError } from "rxjs";

export class UtilsService {
    private roles: string[] = ["Guest", "User", "Admin", "SuperAdmin"];
    private enckey: string = "123456$#@$^@1ERF";
    // Function converts a list of strings to a list of role models
    public async listToRoleModels(list: Array<string>): Promise<RoleModel[]> {
        let roleModelsList: RoleModel[] = [];
        await list.forEach(role => {
            if (this.isValidRole(role)) {
                //let roleModel = new RoleModel(role);
                //roleModelsList.push(roleModel);
            } else {
                // do something other than logging here
                console.log("Error: " + role + " is not a valid role.");
                return undefined;
            }
        });

        return roleModelsList;
    }

    public isValidRole(role: string): boolean {
        if (role in this.roles) return true;
        return false;
    }


    encodeObject(value) {
        var key = CryptoJS.enc.Utf8.parse(this.enckey);
        var iv = CryptoJS.enc.Utf8.parse(this.enckey);
        var encrypted = CryptoJS.AES.encrypt(value, key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        return encrypted.toString();
    }

    decodeObject(value) {
        if (!value) {
            return null;

        }
        var key = CryptoJS.enc.Utf8.parse(this.enckey);
        var iv = CryptoJS.enc.Utf8.parse(this.enckey);
        var decrypted = CryptoJS.AES.decrypt(value, key, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    getMonthNameFromIndex(month: number): string {
        switch (month) {
          case 0:
            return "January";
          case 1:
            return "February";
          case 2:
            return "March";
          case 3:
            return "April";
          case 4:
            return "May";
          case 5:
            return "June";
          case 6:
            return "July";
          case 7:
            return "August";
          case 8:
            return "September";
          case 9:
            return "October";
          case 10:
            return "November";
          case 11:
            return "December";
          default:
            throwError("This month is not valid.");
        }
      }
    
      getMonthIndex(month: number): number {
        if (month >= 0) {
          return month;
        }
        switch (month) {
          case -1:
            return 11;
          case -2:
            return 10;
          case -3:
            return 9;
          case -4:
            return 8;
          case -5:
            return 7;
          case -6:
            return 6;
          case -7:
            return 5;
          case -8:
            return 4;
          case -9:
            return 3;
          case -10:
            return 2;
          case -11:
            return 1;
          default:
            throwError("This month is not valid.");
        }
      }
    
      getEuropeanDayIndex(day: number): number {
        switch (day) {
          case 0:
            return 6;
          case 1:
            return 0;
          case 2:
            return 1;
          case 3:
            return 2;
          case 4:
            return 3;
          case 5:
            return 4;
          case 6:
            return 5;
          default:
            throwError("Day doesn't exist.");
        }
      }
}
