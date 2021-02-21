import * as express from "express";
import checkAuth from "../middleware/checkAuth";
import * as DevicesController from "../controllers/DevicesController";
import { checkCache } from "../redis";

const routes = express.Router();

routes.route('/').get(checkCache, DevicesController.retrieveDevices);

routes.route('/:username').get(DevicesController.retrieveDevice);

routes.route('/').post(DevicesController.createDevice);

routes.route('/:username').patch(DevicesController.updateDevice);

routes.route('/:username').delete(DevicesController.deleteDevice);

routes.route('/:username/readings').get(checkCache, DevicesController.retrieveReadings);

export default routes;