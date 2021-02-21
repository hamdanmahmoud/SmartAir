import { RoleModel } from "./RoleModel";

export class utils {
    private roles: string[] = ["Guest", "User", "Admin", "SuperAdmin"];

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
}
