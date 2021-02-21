export class PoisonousMeasurementsModel {
    private smoke: number;
    private co: number;
    private ch4: number;
    constructor() { }

    public parse(_json: JSON): any {
        for (let key in _json) {
            this[key] = _json[key];
        }
        return this;
    }

    getCO(){
        return this.co;
    }

    getCH4(){
        return this.ch4;
    }

    getSmoke(){
        return this.smoke;
    }

}