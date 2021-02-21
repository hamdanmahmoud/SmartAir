import { UserModel as User } from "../models/User";
import { trimEndSlashes } from "../utils/reqUtils";
import { errHandler } from "../utils/errHandlingUtils";
import { redisClient } from "../redis";
const sendmail = require('sendmail')();

export function retrieveUsers(req: any, res: any) {
    // TODO: FILTER PARAMS !!!
    const query = req.query;

    // TODO: CHECK ACCESS (probably in middleware, not here)
    User.find(query, { _id: 0, __v: 0, password: 0 })
        .then(
            documents => {
                let users = JSON.parse(JSON.stringify(documents));
                var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
                users.map((user: any) => user.href = fullUrl + '/' + user.username);
                let response = {
                    users: users,
                    count: users.length
                }

                redisClient.set(fullUrl, JSON.stringify(response), 'EX', 30, 'NX');

                res.status(200);
                res.send(response);
            }
        )
        .catch((err) => errHandler(err, res));

}

export function retrieveUser(req: any, res: any) {
    // TODO: FILTER PARAMS !!!
    const query = { "username": req.params.username };
    console.log("Query is", query);
    // TODO: CHECK ACCESS (probably in middleware, not here)
    User.findOne(query, { _id: 0, __v: 0, password: 0 })
        .then(
            document => {
                if (!document) {
                    throw (404);
                }
                console.log("Retrieved user", document);
                let user = JSON.parse(JSON.stringify(document));
                var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
                user.href = fullUrl;

                redisClient.set(fullUrl, JSON.stringify(user), 'EX', 30, 'NX');

                res.status(200);
                res.send(user);
            }
        )
        .catch((err) => errHandler(err, res));

}

export function createUser(req: any, res: any) {
    const user = new User(req.body);
    console.log(user)
    let time = Date.now().toString();
    
    user.password = time;
    let tempPassword = time;

    user.save()
        .then(
            document => {
                if (!document) {
                    throw (404);
                }
                console.log("Created user:", document);
                let user = JSON.parse(JSON.stringify(document));
                delete user._id;
                delete user.__v;
                delete user.password;
		var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
                user.href = fullUrl + '/' + user.username;
                res.status(200);
                res.send(user);

                let link = "http://smartair.live/#/changepassword/" + document.username;
                console.log("Sending mail to " + document.email);
                sendmail({
                    from: 'no-reply@smartair.live',
                    to: document.email,
                    subject: 'Activate your account',
                    html: '<p> Dear ' + document.username + ', <br>For gaining full access to your account, you have to change your temporary password (' + tempPassword + ') using the following link:<br> ' + link + '<br></p>',
                }, function (err: any, reply: any) {
                    console.log(err && err.stack);
                    console.dir(reply);
               });
            }
        )
        .catch((err) => { console.log(err); errHandler(err, res); });

}

export function updateUser(req: any, res: any) {
    const query = { username: req.params["username"] };
    const update = req.body;
    User.findOneAndUpdate(query, update, { new: true })
        .then(
            document => {
                if (!document) {
                    throw (404);
                }
                let user = JSON.parse(JSON.stringify(document));
                delete user._id;
                delete user.__v;
		delete user.password;
                var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
                user.href = fullUrl;
                res.status(200);
                res.send(user);
            }
        )
        .catch((err) => errHandler(err, res));
}

export function deleteUser(req: any, res: any) {
    const query = { username: req.params["username"] };
    User.findOneAndDelete(query)
        .then(
            document => {
                if (!document) {
                    throw (404);
                }
                let user = JSON.parse(JSON.stringify(document));
                delete user._id;
                delete user.__v;
		delete user.password;
                res.status(200);
                res.send(user);
            }
        )
        .catch((err) => errHandler(err, res));
}
