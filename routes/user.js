const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

router.route('/')
    .get(userController.getRoot)
    .post(userController.post);

router.route('/:id')
    .get(userController.getID)
    .patch(userController.patch)
    .delete(userController.delete);

router.route('/:id/settings')
    .get(userController.getUserSettings)
    .post(userController.setUserSettings);

module.exports = router;