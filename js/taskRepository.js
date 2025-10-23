class TaskRepository {
    constructor() {
        this.storageKey = 'smart_tasks';
    }

    async findAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    async save(tasks) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            throw new Error('Failed to save tasks to storage');
        }
    }
}