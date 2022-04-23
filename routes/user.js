const express = require('express');
const userController = require('../controllers/user');

const auth = require('../middleware/auth');
const decodeLoggedUser = require('../middleware/decodeLoggedUser');
const { increaseObjectValueMiddleware } = require('../middleware/logging');

const router = express.Router();

router.route('/')
    .post(increaseObjectValueMiddleware, userController.postNewUser);

router.route('/login')
    .post(increaseObjectValueMiddleware, userController.login);

router.route('/logout')
    .post(increaseObjectValueMiddleware, auth, decodeLoggedUser, userController.logout);

router.route('/:id')
    .get(increaseObjectValueMiddleware, auth, decodeLoggedUser, userController.getID)
    .patch(increaseObjectValueMiddleware, auth, decodeLoggedUser, userController.patch)
    .delete(increaseObjectValueMiddleware, auth, decodeLoggedUser, userController.delete);

router.route('/:id/settings')
    .get(auth, decodeLoggedUser, userController.getUserSettings)
    .post(auth, decodeLoggedUser, userController.setUserSettings);

module.exports = router;