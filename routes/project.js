const express = require('express');
const projectController = require('../controllers/project');
const taskController = require('../controllers/task');

const auth = require('../middleware/auth');
const decodeLoggedUser = require('../middleware/decodeLoggedUser');
const { increaseObjectValueMiddleware } = require('../middleware/logging');

const router = express.Router();

router.route('/')
    .post(increaseObjectValueMiddleware, auth, decodeLoggedUser, projectController.post);

router.route('/:id')
    .get(increaseObjectValueMiddleware, auth, decodeLoggedUser, projectController.getID)
    .patch(increaseObjectValueMiddleware, auth, decodeLoggedUser, projectController.patch)
    .delete(increaseObjectValueMiddleware, auth, decodeLoggedUser, projectController.deactivate);

router.route('/permanentlyDelete/:id')
    .delete(increaseObjectValueMiddleware, auth, decodeLoggedUser, projectController.permanentlyDelete);

router.route('/:id/settings')
    .get(auth, decodeLoggedUser, projectController.getProjectSettings)
    .post(auth, decodeLoggedUser, projectController.setProjectSettings);

router.route('/:id/task')
    .post(increaseObjectValueMiddleware, auth, decodeLoggedUser, taskController.post);

router.route('/:id/task/:taskid')
    .get(increaseObjectValueMiddleware, auth, decodeLoggedUser, taskController.getID)
    .patch(increaseObjectValueMiddleware, auth, decodeLoggedUser, taskController.patch)
    .delete(increaseObjectValueMiddleware, auth, decodeLoggedUser, taskController.deactivate);

router.route('/:id/task/permanentlyDelete/:taskid')
    .delete(increaseObjectValueMiddleware, auth, decodeLoggedUser, taskController.permanentlyDelete);

router.route('/:id/task/:taskid/settings')
    .get(auth, decodeLoggedUser, taskController.getTaskSettings)
    .post(auth, decodeLoggedUser, taskController.setTaskSettings);

module.exports = router;