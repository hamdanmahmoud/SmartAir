import { RoleModel } from "./RoleModel";
import { DeviceModel } from "./DeviceModel";

export class UserModel {
    private roles: Array<RoleModel>;
    private active: boolean;
    private lastLogIn: Number;
    private needsRelog: boolean;
    private username: string;
    private password: string;
    private firstName: string;
    private lastName: string;
    private session: string;
    private href: string;
    private email: string;
    private devices: string[];
    private impersonateRole: RoleModel;

    constructor() { }

    public parseFullUser(_json: JSON): any {
        for (let key in _json) {
            if (key == 'roles') {
                let roles = new Array<RoleModel>();
                Object.keys(_json[key]).forEach(function (item) {
                    let role = new RoleModel();
                    role = role.parse(_json[key][item]);
                    roles.push(role);
                });
                this[key] = roles;
            } else if (key == 'impersonateRole') {
                this[key] = new RoleModel().parse(_json[key])
            } else if (key == 'devices') {
                this[key] = _json[key];
            } else {
                this[key] = _json[key];
            }
        }
        return this;
    }

    public parse(_json: JSON): any {
        for (let key in _json) {
            if (key == 'roles') {
                this[key] = _json[key];
            } else if (key == 'impersonateRole') {
                this[key] = new RoleModel().parse(_json[key])
            } else {
                this[key] = _json[key];
            }
        }
        return this;
    }

    isActive() {
        return this.active;
    }

    getFirstRole() {
        return this.roles[0];
    }

    public getRoleByName(roles: RoleModel[], roleName: string): RoleModel {
        return roles.find(role => role.getName() === roleName);
    }

    public getUsername(): string {
        return this.username;
    }

    public getFirstName() {
        return this.firstName;

    }

    public getLastName() {
        return this.lastName;

    }

    public getEmail() {
        return this.email;

    }

    public getRole() {
        return this.roles[0];
    }

    public getRoleByIndex(index) {
        return this.roles[index];
    }

    public getRoles() {
        return this.roles;
    }

    setImpersonateRole(role: RoleModel) {
        this.impersonateRole = new RoleModel().parse(JSON.parse(JSON.stringify(role)));
        console.log("Impersonate role set to ", this.impersonateRole)
    }

    getImpersonateRole() {
        return this.impersonateRole;
    }

    public getDevices(): string[] {
        return this.devices;
    }

    public getRoleNames(): string[] {
        let roleNames: string[] = [];
        this.roles.forEach(function (role) {
            console.log(role)
            roleNames.push(role.getName());
        });
        console.log("ROLENAMES:", roleNames)
        return roleNames;
    }


}