import * as express from "express";
import * as UsersController from "../controllers/UsersController";
import checkAuth from "../middleware/checkAuth";
import { checkCache } from "../redis";

const routes = express.Router();

routes.route('/').get(checkCache, UsersController.retrieveUsers);

routes.route('/:username').get(checkCache, UsersController.retrieveUser);

routes.route('/').post(UsersController.createUser);

routes.route('/:username').patch(UsersController.updateUser);

routes.route('/:username').delete(UsersController.deleteUser);

export default routes;