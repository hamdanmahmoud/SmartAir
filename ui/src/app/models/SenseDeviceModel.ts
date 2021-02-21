import { DeviceModel } from "./DeviceModel";
import { ControlDeviceModel } from "./ControlDeviceModel";

export class SenseDeviceModel extends DeviceModel{
    private controlDevices: ControlDeviceModel[];
    constructor(){
        super();
    }

    public parse(_json: JSON): any {
        for (let key in _json) {
            if (key == 'devices') {
                this.controlDevices = _json[key];
            } else {
                this[key] = _json[key];
            }
        }
        
        return this;
    }

}

