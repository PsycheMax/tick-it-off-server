const express = require('express');
const userController = require('../controllers/user');

const auth = require('../middleware/auth');
const decodeLoggedUser = require('../middleware/decodeLoggedUser');
const { statsLoggingMiddleware } = require('../middleware/logging');

const router = express.Router();

router.route('/')
    .get(userController.getRoot)
    .post(statsLoggingMiddleware, userController.postNewUser);

router.route('/login')
    .post(statsLoggingMiddleware, userController.login);

router.route('/logout')
    .post(statsLoggingMiddleware, auth, decodeLoggedUser, userController.logout);

router.route('/:id')
    .get(statsLoggingMiddleware, auth, decodeLoggedUser, userController.getID)
    .patch(statsLoggingMiddleware, auth, decodeLoggedUser, userController.patch)
    .delete(statsLoggingMiddleware, auth, decodeLoggedUser, userController.delete);

router.route('/:id/settings')
    .get(statsLoggingMiddleware, auth, decodeLoggedUser, userController.getUserSettings)
    .post(statsLoggingMiddleware, auth, decodeLoggedUser, userController.setUserSettings);

module.exports = router;