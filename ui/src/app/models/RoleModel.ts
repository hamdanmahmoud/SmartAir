import { AccessModel } from "./AccessModel";
import { PermissionsModel } from "./PermissionsModel";
import { throwError } from "rxjs";
import * as _ from "lodash";

export class RoleModel {
    private name: string;
    private accessList: Array<AccessModel>;
    constructor() { }

    public parse(_json: JSON): any {
        for (let key in _json) {
            if (key == 'accessList') {
                let accessList = new Array<AccessModel>();
                Object.keys(_json[key]).forEach(function (item) {
                    let accessModel = new AccessModel();
                    accessModel = accessModel.parse(_json[key][item]);
                    accessList.push(accessModel);
                })
                this[key] = accessList;
            } else if (key == 'name') {
                this[key] = _json[key];
            } else {
                throwError("Key " + key + " does not exist for RoleModel.");
            }

        }

        return this;
    }

    public getComponentsWithViewPermission(): string[] {
        let list = this.getAccessList().filter(access => access.getPermissions().retrieve == true);
        let componentNames = list.map(access => access.component);
        return componentNames;
    }

    public getAccessList(): AccessModel[] {
        return this.accessList;
    }


    public getAccessModel(index): AccessModel {
        return this.accessList[index];
    }

    public getName() {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public setAccessList(accessList: AccessModel[]) {
        console.log(accessList)
        this.accessList = accessList;
    }

    public getAccessOnComponentId(componentId: Number): AccessModel {
        return this.accessList.find(access => Number(access.component) == componentId);
    }

    public getAccessOnComponentName(componentName: string): AccessModel {
        return this.accessList.find(access => access.component == componentName);
    }

    public getPermissionsOnComponent(component: string): PermissionsModel {
        return this.getAccessOnComponentName(component).permissions;
    }

    public getPermissionOnComponent(component: string, permission: string): boolean {
        let permissions = this.getPermissionsOnComponent(component);
        let boolValue;
        switch (permission) {
            case "access": boolValue = permissions.access; break;
            case "retrieve": boolValue = permissions.retrieve; break;
            case "create": boolValue = permissions.create; break;
            case "update": boolValue = permissions.update; break;
            case "delete": boolValue = permissions.delete; break;
            default: throwError("Permission " + permission + " does not exist."); break;
        }
        return boolValue;
    }

    public canAccessComponent(component: string): boolean {
        return this.getPermissionsOnComponent(component).access;
    }

    public canRetrieveComponent(component: string): boolean {
        return this.getPermissionsOnComponent(component).retrieve;
    }

    public canCreateComponent(component: string): boolean {
        return this.getPermissionsOnComponent(component).create;
    }

    public canUpdateComponent(component: string): boolean {
        return this.getPermissionsOnComponent(component).update;
    }

    public canDeleteComponent(component: string): boolean {
        return this.getPermissionsOnComponent(component).delete;
    }

    public getPermissionsByComponentName(componentName: string): PermissionsModel {
        return this.accessList.find(access => access.component == componentName).permissions;
    }

    public changePermission(componentName: string, permission: string): void {
        console.log(componentName)
        let permissions = this.getPermissionsByComponentName(componentName);
        switch (permission) {
            case "access": permissions.access = !permissions.access; break;
            case "retrieve": permissions.retrieve = !permissions.retrieve; break;
            case "create": permissions.create = !permissions.create; break;
            case "update": permissions.update = !permissions.update; break;
            case "delete": permissions.delete = !permissions.delete; break;
            default: throwError("Permission " + permission + " does not exist."); break;
        }
    }

    public getEquivalentRoleWithNoPermissions(name: string) {
        let equivalentRole = new RoleModel().parse(JSON.parse(JSON.stringify(this)));
        equivalentRole.setName(name);
        let newAccessList = _.cloneDeep(equivalentRole.getAccessList());
        newAccessList.forEach(
            definedAccess => {
                definedAccess.getPermissions().setPermissionsToFalse();
            }
        )
        return equivalentRole;
    }

}