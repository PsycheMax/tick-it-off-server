const express = require('express');
const projectController = require('../controllers/project');
const taskController = require('../controllers/task');

const auth = require('../middleware/auth');
const decodeLoggedUser = require('../middleware/decodeLoggedUser');
const { statsLoggingMiddleware } = require('../middleware/logging');

const router = express.Router();

router.route('/')
    .get(projectController.getRoot)
    .post(statsLoggingMiddleware, auth, decodeLoggedUser, projectController.post);

router.route('/:id')
    .get(statsLoggingMiddleware, auth, decodeLoggedUser, projectController.getID)
    .patch(statsLoggingMiddleware, auth, decodeLoggedUser, projectController.patch)
    .delete(statsLoggingMiddleware, auth, decodeLoggedUser, projectController.deactivate);

router.route('/permanentlyDelete/:id')
    .delete(statsLoggingMiddleware, auth, decodeLoggedUser, projectController.permanentlyDelete);

router.route('/:id/settings')
    .get(statsLoggingMiddleware, auth, decodeLoggedUser, projectController.getProjectSettings)
    .post(statsLoggingMiddleware, auth, decodeLoggedUser, projectController.setProjectSettings);

router.route('/:id/task')
    .post(statsLoggingMiddleware, auth, decodeLoggedUser, taskController.post);

router.route('/:id/task/:taskid')
    .get(statsLoggingMiddleware, auth, decodeLoggedUser, taskController.getID)
    .patch(statsLoggingMiddleware, auth, decodeLoggedUser, taskController.patch)
    .delete(statsLoggingMiddleware, auth, decodeLoggedUser, taskController.deactivate);

router.route('/:id/task/permanentlyDelete/:taskid')
    .delete(statsLoggingMiddleware, auth, decodeLoggedUser, taskController.permanentlyDelete);

router.route('/:id/task/:taskid/settings')
    .get(statsLoggingMiddleware, auth, decodeLoggedUser, taskController.getTaskSettings)
    .post(statsLoggingMiddleware, auth, decodeLoggedUser, taskController.setTaskSettings);

module.exports = router;