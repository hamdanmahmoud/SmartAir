import mongoose, { Query } from "mongoose";
import { UserModel as User } from "../models/User";

const Schema = mongoose.Schema;

export interface IRole extends mongoose.Document {
    name: string,
    accessList: Array<Object>
}

export interface IRoleQuery extends Query<any> {
    _update: IRole,
    _conditions: IRole
}

const Role = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    accessList: {
        type: Array,
        required: true,
        default: []
    }
}, {
    collection: 'roles'
});

Role.pre<IRole>('save', true, async function (next, done) {
    if (this.accessList.length <= 0) {
        this.invalidate("Role", "Accesslist cannot be empty.");
        done(new Error("Accesslist cannot be empty."));
    }
    next();
    done();
});

Role.pre<IRoleQuery>('findOneAndUpdate', true, async function (next, done) {
    let roleName = this._conditions.name;
    User.updateMany( // way to make user relog
        { roles: { $in: [roleName] } },
        { $set: { needsRelog: true } },
        { multi: true }
    )
        .then(function () {
            next();
            done();
        })
        .catch(function (exception: mongoose.Error | undefined) {
            done(exception);
        });
});

Role.pre<IRoleQuery>('findOneAndDelete', true, async function (next, done) {
    let roleName = this._conditions.name;
	console.log("Removing role", roleName);
    User.updateMany( // removing role for all users and making user relog
        { roles: { $in: [roleName] } },
        {
            $pull: { roles: roleName },
            $set: { needsRelog: true }
        },
        { multi: true }
    )
        .then(function () {
            next();
            done();
        })
        .catch(function (exception: mongoose.Error | undefined) {
            done(exception);
        });
});

export var RoleModel = mongoose.model<IRole>('Role', Role);
