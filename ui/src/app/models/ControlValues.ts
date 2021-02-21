export class ControlValues {
    private default_temperature: number;
    private default_humidity: number;
    private default_ch4: number;
    private default_smoke: number;
    private default_co: number;

    constructor() { }

    public parse(_json: JSON): any {
        for (let key in _json) {
            this[key] = _json[key];
        }
        return this;
    }

    getTemperature() {
        return this.default_temperature;
    }

    getHumidity() {
        return this.default_humidity;
    }
    getCh4() {
        return this.default_ch4;
    }
    getSmoke() {
        return this.default_smoke;
    }
    getCo() {
        return this.default_co;
    }
   
}