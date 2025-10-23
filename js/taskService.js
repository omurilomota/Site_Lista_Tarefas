class TaskService {
  constructor(repository) {
      this.repository = repository;
  }

  async findAll() {
      return await this.repository.findAll();
  }

  async createTask(taskData) {
      const tasks = await this.repository.findAll();
      tasks.unshift(taskData);
      await this.repository.save(tasks);
      return taskData;
  }

  async toggleTask(taskId) {
      const tasks = await this.repository.findAll();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
          throw new Error(`Task ${taskId} not found`);
      }

      tasks[taskIndex] = {
          ...tasks[taskIndex],
          completed: !tasks[taskIndex].completed,
          completedAt: !tasks[taskIndex].completed ? new Date().toISOString() : null
      };

      await this.repository.save(tasks);
      return tasks[taskIndex];
  }

  async completeTask(taskId) {
      const tasks = await this.repository.findAll();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
          throw new Error(`Task ${taskId} not found`);
      }

      tasks[taskIndex] = {
          ...tasks[taskIndex],
          completed: true,
          completedAt: new Date().toISOString()
      };

      await this.repository.save(tasks);
      return tasks[taskIndex];
  }

  async deleteTask(taskId) {
      const tasks = await this.repository.findAll();
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      
      if (filteredTasks.length === tasks.length) {
          throw new Error(`Task ${taskId} not found`);
      }

      await this.repository.save(filteredTasks);
      return true;
  }

  async updateTask(taskId, updates) {
      const tasks = await this.repository.findAll();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
          throw new Error(`Task ${taskId} not found`);
      }

      tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
      };

      await this.repository.save(tasks);
      return tasks[taskIndex];
  }

  async clearCompletedTasks() {
      const tasks = await this.repository.findAll();
      const incompleteTasks = tasks.filter(task => !task.completed);
      await this.repository.save(incompleteTasks);
      return incompleteTasks;
  }
}