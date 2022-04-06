const express = require('express');
const projectController = require('../controllers/project');
const taskController = require('../controllers/task');
const auth = require('../middleware/auth');
const decodeLoggedUser = require('../middleware/decodeLoggedUser');
const router = express.Router();

router.route('/')
    .get(projectController.getRoot)
    .post(auth, decodeLoggedUser, projectController.post);

router.route('/:id')
    .get(auth, decodeLoggedUser, projectController.getID)
    .patch(auth, decodeLoggedUser, projectController.patch)
    .delete(auth, decodeLoggedUser, projectController.deactivate);

router.route('/permanentDelete/:id')
    .delete(auth, decodeLoggedUser, projectController.permanentlyDelete);

router.route('/:id/settings')
    .get(auth, decodeLoggedUser, projectController.getProjectSettings)
    .post(auth, decodeLoggedUser, projectController.setProjectSettings);

router.route('/:id/task')
    .post(auth, decodeLoggedUser, taskController.post);

router.route('/:id/task/:taskid')
    .get(auth, decodeLoggedUser, taskController.getID)
    .patch(auth, decodeLoggedUser, taskController.patch)
    .delete(auth, decodeLoggedUser, taskController.deactivate);

router.route('/:id/task/permanentlyDelete/:taskid')
    .delete(auth, decodeLoggedUser, taskController.permanentlyDelete);

router.route('/:id/task/:taskid/settings')
    .get(auth, decodeLoggedUser, taskController.getTaskSettings)
    .post(auth, decodeLoggedUser, taskController.setTaskSettings);

module.exports = router;