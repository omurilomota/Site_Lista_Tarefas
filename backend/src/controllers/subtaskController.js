const TaskService = require('../services/taskService');
const { createTaskSchema, updateTaskSchema } = require('../utils/validation');

class SubtaskController {
  static async createSubtask(req, res) {
    try {
      const { taskId } = req.params;
      const { title, completed = false } = req.body;
      
      // Validação dos dados de entrada
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: [{ path: 'title', message: 'Title is required' }] 
        });
      }
      
      if (title.length > 500) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: [{ path: 'title', message: 'Title must be less than 500 characters' }] 
        });
      }
      
      const subtaskData = {
        title: title.trim(),
        completed,
      };
      
      const subtask = await TaskService.createSubtask(taskId, req.user.id, subtaskData);
      
      res.status(201).json({
        success: true,
        data: subtask
      });
    } catch (error) {
      if (error.message === 'Task not found or does not belong to user') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getSubtasks(req, res) {
    try {
      const { taskId } = req.params;
      
      const subtasks = await TaskService.getSubtasks(taskId, req.user.id);
      
      res.status(200).json({
        success: true,
        data: subtasks
      });
    } catch (error) {
      if (error.message === 'Task not found or does not belong to user') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getSubtask(req, res) {
    try {
      const { taskId, subtaskId } = req.params;
      
      const subtask = await TaskService.getSubtaskById(subtaskId, taskId, req.user.id);
      
      if (!subtask) {
        return res.status(404).json({ error: 'Subtask not found' });
      }
      
      res.status(200).json({
        success: true,
        data: subtask
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateSubtask(req, res) {
    try {
      const { taskId, subtaskId } = req.params;
      const { title, completed } = req.body;
      
      // Validação dos dados de entrada
      if (title && (title.trim().length === 0 || title.length > 500)) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: [{ path: 'title', message: 'Title must be between 1 and 500 characters' }] 
        });
      }
      
      const subtaskData = {};
      if (title !== undefined) subtaskData.title = title.trim();
      if (completed !== undefined) subtaskData.completed = completed;
      
      const updatedSubtask = await TaskService.updateSubtask(subtaskId, taskId, req.user.id, subtaskData);
      
      if (!updatedSubtask) {
        return res.status(404).json({ error: 'Subtask not found' });
      }
      
      res.status(200).json({
        success: true,
        data: updatedSubtask
      });
    } catch (error) {
      if (error.message === 'Subtask not found or does not belong to user') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteSubtask(req, res) {
    try {
      const { taskId, subtaskId } = req.params;
      
      const deletedSubtask = await TaskService.deleteSubtask(subtaskId, taskId, req.user.id);
      
      if (!deletedSubtask) {
        return res.status(404).json({ error: 'Subtask not found' });
      }
      
      res.status(200).json({
        success: true,
        message: 'Subtask deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Subtask not found or does not belong to user') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = SubtaskController;