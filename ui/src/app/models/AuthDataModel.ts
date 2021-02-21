import { UserModel } from "./UserModel";
import { throwError } from "rxjs";

export class AuthDataModel {
    private user: UserModel;
    private token: string;

    constructor() { }

    public parse(_json: JSON): any {
        for (let key in _json) {
            if (key == 'user'){ 
                this[key] = new UserModel();
                this[key].parseFullUser(_json[key]);
            }
            if (key == 'token'){
                this[key] = _json[key];
            } else {
                throwError("Key " + key + " does not exist for AuthDataModel.");
            }
        }
        return this;
    }

    getUser(): UserModel{
        return this.user;
    }

    getToken(): string {
        return this.token;
    }

}