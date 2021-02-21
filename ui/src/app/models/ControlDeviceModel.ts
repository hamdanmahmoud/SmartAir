import { DeviceModel } from "./DeviceModel";
import { SenseDeviceModel } from "./SenseDeviceModel";

export class ControlDeviceModel extends DeviceModel{
    private senseDevices: SenseDeviceModel[];
    constructor(){
        super();
    }

    public parse(_json: JSON): any {
        for (let key in _json) {
            if (key == 'devices') {
                this.senseDevices = _json[key];
            } else {
                this[key] = _json[key];
            }
        }
        return this;
    }

}