import { ValuesModel } from "./ValuesModel";

export class ReadingModel {
    date: Date;
    values: ValuesModel;
    constructor() { }

    public parse(_json: JSON): any {
        for (let key in _json) {
            if (key == 'values') {
                this[key] = new ValuesModel().parse(_json[key]);
            } else if (key == 'date') {
                this[key] = new Date(_json[key]);
            }
        }

        return this;
    }

    getHumidity(): number {
        return this.values.general.getHumidity();
    }

    getTemperature(): number {
        return this.values.general.getTemperature();
    }

    getPressure(): number {
        return this.values.general.getPressure();
    }


    getCO(): number {
        return this.values.poisonous.getCO();
    }

    getCH4(): number {
        return this.values.poisonous.getCH4();
    }

    getSmoke(): number {
        return this.values.poisonous.getSmoke();
    }

}