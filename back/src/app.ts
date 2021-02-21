import express from "express";

const app = express();

// const config = require("dotenv").config();
const csrf = require('csurf');
const _db = require('./db');
const cors = require('cors');
const boolParser = require('express-query-boolean');

import bodyParser from "body-parser";
import compression from 'compression'

import accessRoutes from "./routes/accessRoutes";
import devicesRoutes from "./routes/devicesRoutes";
import usersRoutes from "./routes/usersRoutes";
import rolesRoutes from "./routes/rolesRoutes";

// remove any origin cors in production
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression())
app.use(boolParser());
app.options("*", function (req : any, res : any, next : any) {
    res.header('Access-Control-Allow-Origin', 'smartair.com');
    res.header('Access-Control-Allow-Methods', 'GET,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, Content-Length, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Origin');
    res.sendStatus(204);
});

app.use('/api/access', accessRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);

export default app;