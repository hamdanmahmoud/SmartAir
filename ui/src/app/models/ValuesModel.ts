import { GeneralMeasurementsModel } from "./GeneralMeasurementsModel";
import { PoisonousMeasurementsModel } from "./PoisonousMeasurementsModel";
import { HazardousMeasurementsModel } from "./HazardousMeasurementsModel";

export class ValuesModel {
    general: GeneralMeasurementsModel;
    hazardous: HazardousMeasurementsModel;
    poisonous: PoisonousMeasurementsModel;

    constructor() { }
    public parse(_json: JSON): any {
        for (let key in _json) {
            if (key === 'general') {
                this.general = new GeneralMeasurementsModel().parse(_json[key]);
            } else if (key === 'hazardous') {
                this.hazardous = new HazardousMeasurementsModel().parse(_json[key]);
            } else if (key === 'poisonous') {
                this.poisonous = new PoisonousMeasurementsModel().parse(_json[key]);
            } else {
                this[key] = _json[key];
            }
        }

        return this;
    }
}