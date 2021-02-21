import { SenseDeviceModel } from "./SenseDeviceModel";
import { ControlDeviceModel } from "./ControlDeviceModel";

export abstract class DeviceModel {
    private active: boolean;
    private username: string;
    private href: string;
    private type: string;
    private devices: SenseDeviceModel[] | ControlDeviceModel[];


    constructor() { }

    abstract parse(_json: JSON);

    getUsername(): string {
        return this.username;
    }
    getType(): string {
        return this.type;
    }
}
