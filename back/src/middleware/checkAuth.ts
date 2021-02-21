import { getTokenFromHeaders } from "../utils/reqUtils";
import { UserModel as User } from "../models/User";
import { errHandler } from "../utils/errHandlingUtils";

const jwt = require('jsonwebtoken');

export default function(req: any, res: any, next: any) {
    const token = getTokenFromHeaders(req.headers["authorization"]);
    if (!token) {
        errHandler(401, res);
    }

    try {
        jwt.verify(token, process.env.PRIVATE_KEY);
        const decodedToken = jwt.decode(token);
        let exp = decodedToken.exp;
        let iat = decodedToken.iat;
        let username = decodedToken.client.username;

        // expiration
        let time = Date.now();
        if (time > exp) {
            throw (401);
        }

        User.findOne({ username: username }, { session: 1 })
            .then(
                document => {
                    if (!document) {
                        throw (401);
                    }
                    let session = document?.session;
                    if (iat < session) {
                        throw (401);
                    }
                    next();
                }
            )
            .catch((err) => errHandler(err, res));

    } catch (ex) {
        //if invalid token
        errHandler(401, res);
    }
}