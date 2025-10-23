/**
 * Sistema de Gerenciamento de Tarefas - Versão Corrigida
 * Arquitetura: Repository Pattern + Service Layer
 */

class TaskManager {
    constructor() {
        this.repository = new TaskRepository();
        this.service = new TaskService(this.repository);
        this.validator = new TaskValidator();
        
        this.state = {
            tasks: [],
            filter: 'all',
            sort: 'data',
            searchTerm: '',
            selectedTasks: new Set(),
            isSelectMode: false,
            currentEditId: null
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadTasks();
            this.setupEventListeners();
            this.render();
            console.log('Sistema inicializado com sucesso');
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.handleError('Initialization failed', error);
        }
    }

    async loadTasks() {
        try {   
            this.state.tasks = await this.service.findAll();
            this.applySorting();
        } catch (error) {
            this.handleError('Failed to load tasks', error);
        }
    }

    setupEventListeners() {
        // Adicionar tarefa
        document.getElementById('addTaskButton').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filtros
        document.getElementById('allTasks').addEventListener('click', () => this.setFilter('all'));
        document.getElementById('pendingTasks').addEventListener('click', () => this.setFilter('pending'));
        document.getElementById('completedTasks').addEventListener('click', () => this.setFilter('completed'));

        // Pesquisa
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.setSearch(e.target.value);
        });

        // Ordenação
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.setSort(e.target.value);
        });

        // Ações em lote
        document.getElementById('toggleSelectMode').addEventListener('click', () => this.toggleSelectMode());
        document.getElementById('completeSelected').addEventListener('click', () => this.completeSelected());
        document.getElementById('deleteSelected').addEventListener('click', () => this.deleteSelected());
        document.getElementById('exportTasks').addEventListener('click', () => this.exportTasks());
        document.getElementById('clearTasksButton').addEventListener('click', () => this.clearCompletedTasks());

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.closeEditModal());
        document.getElementById('saveEdit').addEventListener('click', () => this.saveEdit());

        // Filtros de prioridade
        document.querySelectorAll('.priority-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                const priority = btn.dataset.priority;
                this.setPriorityFilter(priority);
            });
        });

        // Fechar modal ao clicar fora
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') this.closeEditModal();
        });
    }

    async addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        
        if (!text) {
            this.showNotification('Por favor, digite uma tarefa', 'warning');
            return;
        }

        try {
            const task = {
                text: text,
                priority: document.getElementById('prioritySelect').value,
                category: document.getElementById('categorySelect').value,
                createdAt: new Date().toISOString(),
                completed: false,
                id: Date.now().toString()
            };

            await this.service.createTask(task);
            await this.loadTasks();
            this.render();
            input.value = '';
            input.focus();
            this.showNotification('Tarefa adicionada com sucesso!', 'success');
        } catch (error) {
            this.handleError('Failed to add task', error);
        }
    }

    async toggleTask(id) {
        try {
            await this.service.toggleTask(id);
            await this.loadTasks();
            this.render();
        } catch (error) {
            this.handleError('Failed to toggle task', error);
        }
    }

    async deleteTask(id) {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        
        try {
            await this.service.deleteTask(id);
            this.state.selectedTasks.delete(id);
            await this.loadTasks();
            this.render();
            this.showNotification('Tarefa excluída com sucesso!', 'success');
        } catch (error) {
            this.handleError('Failed to delete task', error);
        }
    }

    toggleSelectMode() {
        this.state.isSelectMode = !this.state.isSelectMode;
        this.state.selectedTasks.clear();
        this.updateBatchActions();
        this.render();
        
        const button = document.getElementById('toggleSelectMode');
        if (this.state.isSelectMode) {
            button.innerHTML = '<i class="fas fa-times"></i> Cancelar Seleção';
            button.classList.add('btn-danger');
        } else {
            button.innerHTML = '<i class="fas fa-mouse-pointer"></i> Seleção Múltipla';
            button.classList.remove('btn-danger');
        }
    }

    toggleTaskSelection(id) {
        if (!this.state.isSelectMode) return;
        
        if (this.state.selectedTasks.has(id)) {
            this.state.selectedTasks.delete(id);
        } else {
            this.state.selectedTasks.add(id);
        }
        this.updateBatchActions();
        this.render();
    }

    async completeSelected() {
        if (this.state.selectedTasks.size === 0) {
            this.showNotification('Nenhuma tarefa selecionada', 'warning');
            return;
        }

        try {
            for (const id of this.state.selectedTasks) {
                await this.service.completeTask(id);
            }
            this.state.selectedTasks.clear();
            await this.loadTasks();
            this.render();
            this.showNotification('Tarefas concluídas com sucesso!', 'success');
        } catch (error) {
            this.handleError('Failed to complete selected tasks', error);
        }
    }

    async deleteSelected() {
        if (this.state.selectedTasks.size === 0) {
            this.showNotification('Nenhuma tarefa selecionada', 'warning');
            return;
        }

        if (!confirm(`Tem certeza que deseja excluir ${this.state.selectedTasks.size} tarefa(s)?`)) return;

        try {
            for (const id of this.state.selectedTasks) {
                await this.service.deleteTask(id);
            }
            this.state.selectedTasks.clear();
            await this.loadTasks();
            this.render();
            this.showNotification('Tarefas excluídas com sucesso!', 'success');
        } catch (error) {
            this.handleError('Failed to delete selected tasks', error);
        }
    }

    setFilter(filter) {
        this.state.filter = filter;
        
        // Atualizar botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        if (filter === 'all') document.getElementById('allTasks').classList.add('active');
        if (filter === 'pending') document.getElementById('pendingTasks').classList.add('active');
        if (filter === 'completed') document.getElementById('completedTasks').classList.add('active');
        
        this.render();
    }

    setSearch(searchTerm) {
        this.state.searchTerm = searchTerm;
        this.render();
    }

    setSort(sortType) {
        this.state.sort = sortType;
        this.applySorting();
        this.render();
    }

    setPriorityFilter(priority) {
        this.state.priorityFilter = priority;
        this.render();
    }

    applySorting() {
        const sortStrategies = {
            data: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            prioridade: (a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority),
            alfabetica: (a, b) => a.text.localeCompare(b.text)
        };

        this.state.tasks.sort(sortStrategies[this.state.sort] || sortStrategies.data);
    }

    getPriorityWeight(priority) {
        const weights = { alta: 3, media: 2, baixa: 1 };
        return weights[priority] || 1;
    }

    getFilteredTasks() {
        let filteredTasks = this.state.tasks;

        // Aplicar filtro de status
        if (this.state.filter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (this.state.filter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }

        // Aplicar filtro de prioridade
        if (this.state.priorityFilter) {
            filteredTasks = filteredTasks.filter(task => task.priority === this.state.priorityFilter);
        }

        // Aplicar pesquisa
        if (this.state.searchTerm) {
            const searchTerm = this.state.searchTerm.toLowerCase();
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(searchTerm) ||
                task.category.toLowerCase().includes(searchTerm)
            );
        }

        return filteredTasks;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        this.renderTaskList(filteredTasks);
        this.updateStats();
        this.updateUIState();
    }

    renderTaskList(tasks) {
        const container = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        
        if (tasks.length === 0) {
            emptyState.style.display = 'block';
            container.innerHTML = '';
            return;
        }
        
        emptyState.style.display = 'none';
        
        const fragment = document.createDocumentFragment();
        
        tasks.forEach(task => {
            fragment.appendChild(this.createTaskElement(task));
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `tarefa-item ${task.completed ? 'completed' : ''} ${
            this.state.selectedTasks.has(task.id) ? 'selected' : ''
        }`;
        li.setAttribute('data-id', task.id);
        
        li.innerHTML = `
            <div class="task-select">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="taskManager.toggleTask('${task.id}')">
                ${this.state.isSelectMode ? 
                    `<input type="checkbox" class="select-checkbox" ${
                        this.state.selectedTasks.has(task.id) ? 'checked' : ''
                    } onchange="taskManager.toggleTaskSelection('${task.id}')">` : ''
                }
            </div>
            <span class="texto-tarefa">${this.escapeHTML(task.text)}</span>
            <div class="tarefa-meta">
                <span class="priority-badge ${task.priority}">${task.priority}</span>
                <span class="category-badge">${task.category}</span>
                <small class="task-date">${this.formatDate(task.createdAt)}</small>
            </div>
            <div class="tarefa-actions">
                <button class="btn-editar" onclick="taskManager.openEditModal('${task.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-excluir" onclick="taskManager.deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return li;
    }

    openEditModal(id) {
        const task = this.state.tasks.find(task => task.id === id);
        if (task) {
            this.state.currentEditId = id;
            document.getElementById('editTaskInput').value = task.text;
            document.getElementById('editPrioritySelect').value = task.priority;
            document.getElementById('editCategorySelect').value = task.category;
            document.getElementById('editModal').style.display = 'flex';
        }
    }

    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        this.state.currentEditId = null;
    }

    async saveEdit() {
        if (!this.state.currentEditId) return;

        const text = document.getElementById('editTaskInput').value.trim();
        if (!text) {
            this.showNotification('Texto da tarefa não pode estar vazio', 'warning');
            return;
        }

        try {
            const updatedTask = {
                text: text,
                priority: document.getElementById('editPrioritySelect').value,
                category: document.getElementById('editCategorySelect').value
            };

            await this.service.updateTask(this.state.currentEditId, updatedTask);
            await this.loadTasks();
            this.render();
            this.closeEditModal();
            this.showNotification('Tarefa atualizada com sucesso!', 'success');
        } catch (error) {
            this.handleError('Failed to save task edit', error);
        }
    }

    async clearCompletedTasks() {
        const completedTasks = this.state.tasks.filter(task => task.completed);
        if (completedTasks.length === 0) {
            this.showNotification('Não há tarefas completas para limpar', 'info');
            return;
        }

        if (!confirm(`Tem certeza que deseja limpar ${completedTasks.length} tarefa(s) completa(s)?`)) return;

        try {
            await this.service.clearCompletedTasks();
            await this.loadTasks();
            this.render();
            this.showNotification('Tarefas completas removidas com sucesso!', 'success');
        } catch (error) {
            this.handleError('Failed to clear completed tasks', error);
        }
    }

    exportTasks() {
        const data = {
            tasks: this.state.tasks,
            exportDate: new Date().toISOString(),
            totalTasks: this.state.tasks.length,
            completedTasks: this.state.tasks.filter(t => t.completed).length
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `tarefas-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Tarefas exportadas com sucesso!', 'success');
    }

    updateStats() {
        const totalTasks = this.state.tasks.length;
        const pendingTasks = this.state.tasks.filter(task => !task.completed).length;
        document.getElementById('taskStats').textContent = `Total: ${totalTasks} | Pendentes: ${pendingTasks}`;
    }

    updateUIState() {
        this.updateBatchActions();
        
        // Mostrar/ocultar estado vazio
        const emptyState = document.getElementById('emptyState');
        const hasTasks = this.state.tasks.length > 0;
        emptyState.style.display = hasTasks ? 'none' : 'block';
    }

    updateBatchActions() {
        const batchActions = document.getElementById('batchActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.state.isSelectMode && this.state.selectedTasks.size > 0) {
            batchActions.style.display = 'flex';
            selectedCount.textContent = `${this.state.selectedTasks.size} tarefa(s) selecionada(s)`;
        } else {
            batchActions.style.display = 'none';
        }
    }

    // Utility methods
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    showNotification(message, type = 'info') {
        // Implementação simples de notificação
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Em uma implementação completa, aqui seria um toast notification
    }

    handleError(context, error) {
        console.error(`[ERROR] ${context}:`, error);
        this.showNotification(`Erro: ${error.message}`, 'error');
    }
}

// Inicialização quando o DOM estiver pronto
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});