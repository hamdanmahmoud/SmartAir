import * as express from 'express';
import * as AccessController from '../controllers/AccessController';

const routes = express.Router();

routes.route('/login').post(AccessController.login);

routes.route('/password/recovery').post(AccessController.recoverPassword);

routes.route('/password/change/:username').post(AccessController.changePassword);

routes.route('/password/reset/:username').post(AccessController.resetPassword);
export default routes;
