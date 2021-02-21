import { UserModel } from "./UserModel";

export class UserProfile extends UserModel {
    // some properties like avatar or some other profile specific ones

    constructor() {
        super();
    }

    parse(_json: JSON): UserProfile {
        // own parse, see parse of UserModel for an example
        for (let key in _json) {
            this[key] = _json[key];
        }
        console.log(_json)
        return this;
        
        throw("Method not implemented.");

        return this;
    }
}