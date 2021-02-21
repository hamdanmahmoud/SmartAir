export class HazardousMeasurementsModel {
    private vibration: boolean;
    constructor() { }

    public parse(_json: JSON): any {
        for (let key in _json) {
            this[key] = _json[key];
        }
        return this;
    }
}