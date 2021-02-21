const redis = require("redis");
import { trimEndSlashes } from "./utils/reqUtils";

const PORT = 6379;
const client = redis.createClient(PORT);

//Middleware Function to Check Cache
export const checkCache = (req:any, res:any, next:any) => {
    const fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
    console.log(fullUrl)
    //get data value for key =id
    client.get(fullUrl, (err:any, data:any) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        }
        //if no match found
        if (data !== null) {
            res.send(JSON.parse(data));
        } 
        else {
            //proceed to next middleware function
            next();
        }
     });
};

export var redisClient = client;