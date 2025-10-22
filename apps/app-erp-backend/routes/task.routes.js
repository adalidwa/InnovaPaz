const { Router } = require('express');
const {
  getAllTasks,
  getTask,
  createTask,
  deleteTask,
  updateTask,
} = require('../controllers/tasks.controller');
const { verifyFirebaseToken } = require('../controllers/auth.controller');
const router = Router();

router.get('/tasks', verifyFirebaseToken, getAllTasks);

router.get('/tasks/:id', verifyFirebaseToken, getTask);

router.post('/tasks', verifyFirebaseToken, createTask);

router.delete('/tasks/:id', verifyFirebaseToken, deleteTask);

router.put('/tasks/:id', verifyFirebaseToken, updateTask);

module.exports = router;
