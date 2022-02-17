const express = require('express');
const userController = require('../controllers/user');
const auth = require('../middleware/auth');
const decodeLoggedUser = require('../middleware/decodeLoggedUser');
const router = express.Router();

router.route('/')
    .get(userController.getRoot)
    .post(userController.postNewUser);

router.route('/login')
    .post(userController.login);

router.route('/logout')
    .post(auth, decodeLoggedUser, userController.logout);

router.route('/:id')
    .get(auth, decodeLoggedUser, userController.getID)
    .patch(auth, decodeLoggedUser, userController.patch)
    .delete(auth, decodeLoggedUser, userController.delete);

router.route('/:id/settings')
    .get(auth, decodeLoggedUser, userController.getUserSettings)
    .post(auth, decodeLoggedUser, userController.setUserSettings);

module.exports = router;