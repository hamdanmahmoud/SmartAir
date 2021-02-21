// default errHandler, might add some others but atm this one works just fine
export function errHandler(err: any, res: any) {
    let statusCode = 400;
    if (!isNaN(err)) {
        statusCode = err;
    }
    res.status(statusCode).send();
}