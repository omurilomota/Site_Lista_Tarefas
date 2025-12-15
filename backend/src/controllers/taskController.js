const TaskService = require('../services/taskService');
const { createTaskSchema, updateTaskSchema } = require('../utils/validation');

class TaskController {
  static async createTask(req, res) {
    try {
      // Validação dos dados de entrada
      const validatedData = createTaskSchema.parse(req.body);
      
      // Criar a tarefa
      const task = await TaskService.createTask(req.user.id, validatedData);
      
      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getTasks(req, res) {
    try {
      const { completed, priority, category, dueDate, listId, page, limit } = req.query;
      
      const filters = {
        completed: completed !== undefined ? completed === 'true' : undefined,
        priority: priority || undefined,
        category: category || undefined,
        dueDate: dueDate || undefined,
        listId: listId || undefined,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      };
      
      const result = await TaskService.getTasks(req.user.id, filters);
      
      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getTask(req, res) {
    try {
      const { id } = req.params;
      
      const task = await TaskService.getTaskById(id, req.user.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateTask(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updateTaskSchema.parse(req.body);
      
      const updatedTask = await TaskService.updateTask(id, req.user.id, validatedData);
      
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.status(200).json({
        success: true,
        data: updatedTask
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteTask(req, res) {
    try {
      const { id } = req.params;
      
      const deletedTask = await TaskService.deleteTask(id, req.user.id);
      
      if (!deletedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async syncTasks(req, res) {
    try {
      const { tasks, timestamp } = req.body;
      
      if (!Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Tasks must be an array' });
      }
      
      const results = await TaskService.syncTasks(req.user.id, { tasks, timestamp });
      
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = TaskController;