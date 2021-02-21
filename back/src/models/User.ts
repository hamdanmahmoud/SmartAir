import mongoose, { Query } from "mongoose";
import crypto from "crypto";

const Schema = mongoose.Schema;

export interface IUser extends mongoose.Document {
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    email: string,
    roles: [string],
    active: boolean,
    session: Date,
    needsRelog: boolean,
    devices: [string]
}

export interface IUserQuery extends Query<any> {
    _update: IUser,
    _conditions: IUser
}

const User = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        required: true,
        default: []
    },
    active: {
        type: Boolean,
        default: false
    },
    session: {
        type: Date,
        default: undefined
    },
    needsRelog: {
        type: Boolean,
        default: false
    },
    devices: {
        type: [String],
        default: []
    }
}, {
    collection: 'users'
});

User.pre<IUser>('save', true, async function (next: any, done: any) {
    let hash = crypto.createHash('sha256').update(this.password).digest("hex");
    this.password = hash;
    next();
    done();
});

User.pre<IUserQuery>('findOneAndUpdate', true, async function (next: any, done: any) {
    let update = this._update;
    let conditions = this._conditions;
    let username = conditions.username;
    let session = update.session;
    // mongoose.model<IUser>('User', User).updateOne( // way to make user relog
    //     { username: username },
    //     { $set: { needsRelog: true } },
    //     { multi: true }
    // )
    next();
    done();
});

export var UserModel = mongoose.model<IUser>('User', User);