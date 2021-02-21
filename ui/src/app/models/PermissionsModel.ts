export class PermissionsModel {
    access: boolean;
    retrieve: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;

    constructor() { }

    public parse(_json: JSON): any {
        for (let key in _json) {
            this[key] = Boolean(_json[key]);
        }
        return this;
    }

    public boolToNumber() {
        let obj = {
            access: Number(this.access),
            view: Number(this.retrieve),
            create: Number(this.create),
            update: Number(this.update),
            delete: Number(this.delete)
        }
        return obj;
    }

    public setPermissionsToFalse(){
        this.access = false;
        this.retrieve = false;
        this.create = false;
        this.update = false;
        this.delete = false;
    }

}