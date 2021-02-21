import app from "./app";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, function () {
    console.log('Express server listening on port ' + PORT);
});