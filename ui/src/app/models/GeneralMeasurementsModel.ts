export class GeneralMeasurementsModel {
    private temperature: number;
    private humidity: number;
    private pressure: number;
    constructor() { }

    public parse(_json: JSON): any {
        for (let key in _json) {
            this[key] = _json[key];
        }
        return this;
    }

    getTemperature() {
        return this.temperature;
    }

    getHumidity() {
        return this.humidity;
    }

    getPressure() {
        return this.pressure;
    }
}