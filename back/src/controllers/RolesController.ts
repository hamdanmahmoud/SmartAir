import { RoleModel as Role } from "../models/Role";
import { trimEndSlashes } from "../utils/reqUtils";
import { errHandler } from "../utils/errHandlingUtils";
import { redisClient } from "../redis";

export function retrieveRoles (req: any, res: any) {
    // TODO: FILTER PARAMS !!!
    const query = req.query;

    // TODO: CHECK ACCESS (probably in middleware, not here)
    Role.find(query, { _id: 0, __v: 0 })
        .then(
            documents => {
                let roles = JSON.parse(JSON.stringify(documents));
                var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
                roles.map((role: any) => role.href = fullUrl + '/' + role.name);
                let response = {
                    roles: roles,
                    count: roles.length
                }

                redisClient.set(fullUrl, JSON.stringify(response), 'EX', 30, 'NX');

                res.status(200);
                res.send(response);
            }
        )
        .catch((err) => errHandler(err, res));
}

export function retrieveRole(req: any, res: any) {
    // TODO: FILTER PARAMS !!!
    const query = { "name": req.params.name};

    // TODO: CHECK ACCESS (probably in middleware, not here)
    Role.findOne(query, { _id: 0, __v: 0 })
        .then(
            document => {
                if (!document){
                    throw(404);
                }
                let role = JSON.parse(JSON.stringify(document));
                var fullUrl =trimEndSlashes( req.protocol + '://' + process.env.HOST + req.originalUrl);
                role.href = fullUrl;

                redisClient.set(fullUrl, JSON.stringify(role), 'EX', 10, 'NX');

                res.status(200);
                res.send(role);
            }
        )
        .catch((err) => errHandler(err, res));
}


export function createRole (req: any, res: any) {
    const role = new Role(req.body);
    role.save()
        .then(
            document => {
                if (!document){
                    throw(404);
                }
                let role = JSON.parse(JSON.stringify(document));
                delete role._id;
                delete role.__v;
                var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
                role.href = fullUrl + '/' + role.name;
                res.status(200);
                res.send(role);
            }
        )
        .catch((err) => errHandler(err, res));

}

export function updateRole(req: any, res: any) {
    const query = { name: req.params["name"]};
    const update = req.body;
    Role.findOneAndUpdate(query, update, { new: true  })
        .then(
            document => {
                if (!document){
                    throw(404);
                }
                let role = JSON.parse(JSON.stringify(document));
                delete role._id;
                delete role.__v;
                var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
                role.href = fullUrl;
                res.status(200);
                res.send(role);
            }
        )
        .catch((err) => errHandler(err, res));

}

export function deleteRole(req: any, res: any) {
    const query = { name: req.params["name"]};
    Role.findOneAndDelete(query)
        .then(
            document => {
                if (!document){
                    throw(404);
                }
                let role = JSON.parse(JSON.stringify(document));
                delete role._id;
                delete role.__v;
                res.status(200);
                res.send(role);
            }
        )
        .catch((err) => errHandler(err, res));
}