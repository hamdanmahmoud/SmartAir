import * as express from "express";
import checkAuth from "../middleware/checkAuth";
import * as RolesController from "../controllers/RolesController";
import { checkCache } from "../redis";

const routes = express.Router();

routes.route('/').get(checkCache, RolesController.retrieveRoles);

routes.route('/:name').get(checkCache, RolesController.retrieveRole);

routes.route('/').post(RolesController.createRole);

routes.route('/:name').patch(RolesController.updateRole);

routes.route('/:name').delete(RolesController.deleteRole);

export default routes;