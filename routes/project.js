const express = require('express');
const projectController = require('../controllers/project');
const taskController = require('../controllers/task');
const router = express.Router();

router.route('/')
    .get(projectController.getRoot)
    .post(projectController.post);

router.route('/:id')
    .get(projectController.getID)
    .patch(projectController.patch)
    .delete(projectController.delete);

router.route('/:id/settings')
    .get(projectController.getUserSettings)
    .post(projectController.setUserSettings);

router.route('/:id/task')
    .post(taskController.post);

router.route('/:id/task/:taskid')
    .get(taskController.getID)
    .patch(taskController.patch)
    .delete(taskController.delete);

router.route('/:id/task/:taskid/settings')
    .get(taskController.getTaskSettings)
    .patch(taskController.setTaskSettings);

module.exports = router;