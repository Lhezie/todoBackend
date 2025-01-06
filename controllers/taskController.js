const Task = require('../models/Task');

// Get Tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.render('tasks/index', { tasks, user: req.user });
  } catch (err) {
    res.status(500).send('Error fetching tasks');
  }
};

// Create Task
exports.createTask = async (req, res) => {
  try {
    const task = new Task({ description: req.body.description, user: req.user.id });
    await task.save();
    res.redirect('/tasks');
  } catch (err) {
    res.status(500).send('Error creating task');
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, { state: req.body.state });
    res.redirect('/tasks');
  } catch (err) {
    res.status(500).send('Error updating task');
  }
};
