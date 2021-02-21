import mongoose, { Query } from "mongoose";
import crypto from "crypto";

const Schema = mongoose.Schema;

export interface IDevice extends mongoose.Document {
    username: string,
    password: string,
    active: boolean,
    type: string,
    devices: [string]
}

export interface IUserQuery extends Query<any> {
    _update: IDevice,
    _conditions: IDevice
}

const Device = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        required: true,
        default: undefined
    },
    devices:{
        type: [String],
        default: []
    }
}, {
    collection: 'devices'
});

Device.pre<IDevice>('save', true, async function (next, done) {
    let hash = crypto.createHash('sha256').update(this.password).digest("hex");
    this.password = hash;
    next();
    done();
});

export var DeviceModel = mongoose.model<IDevice>('Device', Device);