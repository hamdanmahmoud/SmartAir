import { PermissionsModel } from "./PermissionsModel";
import { throwError } from "rxjs";

export class AccessModel {
    component: string;
    permissions: PermissionsModel;

    constructor() { }

    public parse(_json: JSON): any {
        for (let key in _json) {
            if (key == 'component'){
                this[key] = _json[key]
            }
            if (key == 'permissions'){
                this[key] = new PermissionsModel().parse(_json[key]);
            } else {
                throwError("Key " + key + " does not exist for AccessModel.");
            }
        }
        return this;
    }
    
    public getPermissions() {
        return this.permissions;
    }

    
}