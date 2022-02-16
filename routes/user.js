const express = require('express');
const userController = require('../controllers/user');
const auth = require('../middleware/auth');
const router = express.Router();



router.route('/')
    .get(userController.getRoot)
    .post(userController.postNewUser);

router.route('/login')
    .post(userController.login);

router.route('/logout')
    .post(userController.logout);

router.route('/:id')
    .get(auth, userController.getID)
    .patch(auth, userController.patch)
    .delete(auth, userController.delete);

router.route('/:id/settings')
    .get(auth, userController.getUserSettings)
    .post(auth, userController.setUserSettings);

module.exports = router;