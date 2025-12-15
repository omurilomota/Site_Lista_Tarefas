const prisma = require('../utils/database');

class TaskService {
  static async createTask(userId, taskData) {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId,
        syncVersion: 1,
        lastSync: new Date()
      }
    });
    
    return task;
  }
  
  static async getTasks(userId, filters = {}) {
    const { completed, priority, category, dueDate, listId, page = 1, limit = 10 } = filters;
    
    const whereCondition = {
      userId,
      ...completed !== undefined && { completed },
      ...priority && { priority },
      ...category && { category },
      ...dueDate && { dueDate: { gte: new Date(dueDate) } },
      ...listId && { listId }
    };
    
    const tasks = await prisma.task.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });
    
    const total = await prisma.task.count({ where: whereCondition });
    
    return {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  static async getTaskById(id, userId) {
    return await prisma.task.findFirst({
      where: {
        id,
        userId
      }
    });
  }
  
  static async updateTask(id, userId, taskData) {
    return await prisma.task.update({
      where: {
        id,
        userId
      },
      data: {
        ...taskData,
        syncVersion: { increment: 1 },
        lastSync: new Date()
      }
    });
  }
  
  static async deleteTask(id, userId) {
    return await prisma.task.delete({
      where: {
        id,
        userId
      }
    });
  }
  
  static async createSubtask(taskId, userId, subtaskData) {
    // Verificar se a tarefa pertence ao usuário
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId
      }
    });

    if (!task) {
      throw new Error('Task not found or does not belong to user');
    }

    const subtask = await prisma.subtask.create({
      data: {
        ...subtaskData,
        taskId
      }
    });

    return subtask;
  }

  static async getSubtasks(taskId, userId) {
    // Verificar se a tarefa pertence ao usuário
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId
      }
    });

    if (!task) {
      throw new Error('Task not found or does not belong to user');
    }

    return await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async getSubtaskById(subtaskId, taskId, userId) {
    return await prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        taskId,
        task: {
          userId
        }
      }
    });
  }

  static async updateSubtask(subtaskId, taskId, userId, subtaskData) {
    // Verificar se o subtask existe e pertence à tarefa correta do usuário
    const subtask = await prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        taskId,
        task: {
          userId
        }
      }
    });

    if (!subtask) {
      throw new Error('Subtask not found or does not belong to user');
    }

    return await prisma.subtask.update({
      where: { id: subtaskId },
      data: subtaskData
    });
  }

  static async deleteSubtask(subtaskId, taskId, userId) {
    // Verificar se o subtask existe e pertence à tarefa correta do usuário
    const subtask = await prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        taskId,
        task: {
          userId
        }
      }
    });

    if (!subtask) {
      throw new Error('Subtask not found or does not belong to user');
    }

    return await prisma.subtask.delete({
      where: { id: subtaskId }
    });
  }

  static async syncTasks(userId, syncData) {
    const { tasks, timestamp } = syncData;
    const results = [];

    for (const task of tasks) {
      try {
        // Verificar se a tarefa existe
        const existingTask = await prisma.task.findFirst({
          where: {
            id: task.id,
            userId
          }
        });

        let updatedTask;
        if (existingTask) {
          // Verificar versão de sincronização para resolver conflitos
          if (task.syncVersion > existingTask.syncVersion) {
            // Atualizar tarefa existente
            updatedTask = await prisma.task.update({
              where: { id: task.id },
              data: {
                ...task,
                syncVersion: task.syncVersion,
                lastSync: new Date()
              }
            });
          } else {
            // Manter versão mais recente
            updatedTask = existingTask;
          }
        } else {
          // Criar nova tarefa
          updatedTask = await prisma.task.create({
            data: {
              ...task,
              userId,
              syncVersion: 1,
              lastSync: new Date()
            }
          });
        }

        results.push(updatedTask);
      } catch (error) {
        console.error(`Erro ao sincronizar tarefa ${task.id}:`, error);
        results.push({ error: `Failed to sync task ${task.id}`, taskId: task.id });
      }
    }

    return results;
  }
}

module.exports = TaskService;