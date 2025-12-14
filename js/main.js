// TaskFlow - Aplicativo Avançado de Lista de Tarefas
class TaskFlowApp {
    constructor() {
        // Elementos DOM
        this.elements = {};
        this.selectedTasks = new Set();
        this.currentFilter = 'all';
        this.currentSort = 'added';
        this.currentPriority = 'medium';
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadTasks();
        this.updateUI();
        this.registerServiceWorker();
        this.setupTheme();
        this.setupDate();
        this.setupKeyboardShortcuts();
        this.setupDragAndDrop();
    }
    
    cacheElements() {
        // Cache de todos os elementos importantes
        this.elements = {
            // Inputs
            taskInput: document.getElementById('taskInput'),
            taskCategory: document.getElementById('taskCategory'),
            taskDueDate: document.getElementById('taskDueDate'),
            searchInput: document.getElementById('searchInput'),
            sortTasks: document.getElementById('sortTasks'),
            
            // Botões
            addTaskButton: document.getElementById('addTaskButton'),
            addQuickTask: document.getElementById('addQuickTask'),
            clearCompletedButton: document.getElementById('clearCompletedButton'),
            exportTasksButton: document.getElementById('exportTasksButton'),
            importTasksButton: document.getElementById('importTasksButton'),
            selectAllTasks: document.getElementById('selectAllTasks'),
            statsButton: document.getElementById('statsButton'),
            closeStats: document.getElementById('closeStats'),
            keyboardShortcutsBtn: document.getElementById('keyboardShortcutsBtn'),
            aboutBtn: document.getElementById('aboutBtn'),
            resetAppBtn: document.getElementById('resetAppBtn'),
            themeToggle: document.getElementById('themeToggle'),
            
            // Containers
            taskList: document.getElementById('taskList'),
            statsPanel: document.getElementById('statsPanel'),
            shortcutsModal: document.getElementById('shortcutsModal'),
            aboutModal: document.getElementById('aboutModal'),
            toastContainer: document.getElementById('toastContainer'),
            
            // Elementos de UI
            progressPercent: document.getElementById('progressPercent'),
            progressFill: document.getElementById('progressFill'),
            taskCount: document.getElementById('taskCount'),
            totalTasks: document.getElementById('totalTasks'),
            completedTasks: document.getElementById('completedTasks'),
            pendingTasks: document.getElementById('pendingTasks'),
            highPriorityTasks: document.getElementById('highPriorityTasks'),
            connectionStatus: document.getElementById('connectionStatus'),
            lastSync: document.getElementById('lastSync'),
            saveNotice: document.getElementById('saveNotice'),
            
            // Botões de filtro
            filterButtons: document.querySelectorAll('.filter-btn'),
            priorityButtons: document.querySelectorAll('.priority-btn')
        };
    }
    
    setupEventListeners() {
        // Adicionar tarefa
        this.elements.addTaskButton.addEventListener('click', () => this.addTask());
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
            if (e.ctrlKey && e.key === 'Enter') this.addQuickTaskFunc();
        });
        
        // Tarefa rápida
        this.elements.addQuickTask.addEventListener('click', () => this.addQuickTaskFunc());
        
        // Filtros
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
            });
        });
        
        // Prioridade
        this.elements.priorityButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const priority = e.currentTarget.dataset.priority;
                this.setPriority(priority);
            });
        });
        
        // Ordenação
        this.elements.sortTasks.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.updateTaskList();
        });
        
        // Busca
        this.elements.searchInput.addEventListener('input', (e) => {
            this.updateTaskList();
        });
        
        // Limpar completas
        this.elements.clearCompletedButton.addEventListener('click', () => this.clearCompletedTasks());
        
        // Exportar/Importar
        this.elements.exportTasksButton.addEventListener('click', () => this.exportTasks());
        this.elements.importTasksButton.addEventListener('click', () => this.importTasks());
        
        // Selecionar tudo
        this.elements.selectAllTasks.addEventListener('click', () => this.toggleSelectAll());
        
        // Estatísticas
        this.elements.statsButton.addEventListener('click', () => this.toggleStatsPanel());
        this.elements.closeStats.addEventListener('click', () => this.toggleStatsPanel());
        
        // Modais
        this.elements.keyboardShortcutsBtn.addEventListener('click', () => this.showModal('shortcutsModal'));
        this.elements.aboutBtn.addEventListener('click', () => this.showModal('aboutModal'));
        
        // Fechar modais
        document.querySelectorAll('.modal-close, .modal').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el || e.target.closest('.modal-close')) {
                    this.hideAllModals();
                }
            });
        });
        
        // Resetar app
        this.elements.resetAppBtn.addEventListener('click', () => this.resetApp());
        
        // Tema
        this.elements.themeToggle.addEventListener('change', () => this.toggleTheme());
        
        // Monitorar conexão
        window.addEventListener('online', () => this.updateConnectionStatus(true));
        window.addEventListener('offline', () => this.updateConnectionStatus(false));
        
        // Salvar automaticamente
        window.addEventListener('beforeunload', () => this.saveTasks());
        setInterval(() => this.saveTasks(), 30000); // Salvar a cada 30 segundos
    }
    
    // ===== FUNCIONALIDADES DE TAREFAS =====
    
    addTask() {
        const text = this.elements.taskInput.value.trim();
        if (!text) {
            this.showToast('Por favor, digite uma tarefa', 'warning');
            this.elements.taskInput.classList.add('shake');
            setTimeout(() => this.elements.taskInput.classList.remove('shake'), 500);
            return;
        }
        
        const task = {
            id: Date.now().toString(),
            text: text,
            category: this.elements.taskCategory.value,
            priority: this.currentPriority,
            dueDate: this.elements.taskDueDate.value || null,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.saveTask(task);
        this.elements.taskInput.value = '';
        this.elements.taskInput.focus();
        
        this.showToast('Tarefa adicionada com sucesso', 'success');
        this.updateUI();
    }
    
    addQuickTaskFunc() {
        const quickTasks = [
            "Responder e-mails importantes",
            "Reunião com a equipe",
            "Revisar relatórios",
            "Planejar semana",
            "Fazer compras de supermercado",
            "Ler artigo interessante",
            "Fazer exercícios físicos",
            "Organizar workspace"
        ];
        
        const randomTask = quickTasks[Math.floor(Math.random() * quickTasks.length)];
        this.elements.taskInput.value = randomTask;
        this.addTask();
    }
    
    saveTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
        this.updateTaskList();
    }
    
    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
            localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
            this.updateTaskList();
        }
    }
    
    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem('taskflow_tasks', JSON.stringify(filteredTasks));
        this.updateTaskList();
        this.showToast('Tarefa removida', 'info');
    }
    
    getTasks() {
        return JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
    }
    
    getFilteredTasks() {
        let tasks = this.getTasks();
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        
        // Filtrar por busca
        if (searchTerm) {
            tasks = tasks.filter(task => 
                task.text.toLowerCase().includes(searchTerm) ||
                task.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filtrar por tipo
        switch (this.currentFilter) {
            case 'completed':
                tasks = tasks.filter(task => task.completed);
                break;
            case 'pending':
                tasks = tasks.filter(task => !task.completed);
                break;
            case 'today':
                const today = new Date().toISOString().split('T')[0];
                tasks = tasks.filter(task => task.dueDate === today);
                break;
            case 'high':
                tasks = tasks.filter(task => task.priority === 'high');
                break;
            // 'all' - não filtra
        }
        
        // Ordenar
        switch (this.currentSort) {
            case 'added':
                tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'due':
                tasks.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'alphabetical':
                tasks.sort((a, b) => a.text.localeCompare(b.text));
                break;
        }
        
        return tasks;
    }
    
    updateTaskList() {
        const tasks = this.getFilteredTasks();
        const taskList = this.elements.taskList;
        
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <li class="empty-state fade-in">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Nenhuma tarefa encontrada</h3>
                    <p>Tente alterar os filtros ou adicionar uma nova tarefa</p>
                </li>
            `;
            return;
        }
        
        taskList.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskList.appendChild(taskElement);
        });
        
        this.updateStats();
        this.updateProgress();
        this.updateTaskCount();
    }
    
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `fade-in ${task.completed ? 'completed' : ''} priority-${task.priority}`;
        li.dataset.id = task.id;
        li.draggable = true;
        
        // Ícones por categoria
        const categoryIcons = {
            'work': '💼',
            'personal': '👤',
            'shopping': '🛒',
            'health': '🏃',
            'study': '📚',
            'general': '📋'
        };
        
        // Cor por prioridade
        const priorityColors = {
            'high': 'danger',
            'medium': 'warning',
            'low': 'success'
        };
        
        // Status da data
        let dueDateStatus = '';
        if (task.dueDate) {
            const today = new Date().toISOString().split('T')[0];
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            
            if (task.dueDate < today && !task.completed) {
                dueDateStatus = 'overdue';
            } else if (task.dueDate === today) {
                dueDateStatus = 'today';
            }
        }
        
        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                ${task.completed ? '✓' : ''}
            </div>
            <div class="task-content">
                <div class="task-text ${task.completed ? 'completed' : ''}">
                    ${this.escapeHtml(task.text)}
                </div>
                <div class="task-meta">
                    <span class="task-category">
                        ${categoryIcons[task.category] || '📋'} ${this.getCategoryName(task.category)}
                    </span>
                    ${task.dueDate ? `
                        <span class="task-due-date ${dueDateStatus}">
                            <i class="far fa-calendar"></i>
                            ${this.formatDate(task.dueDate)}
                        </span>
                    ` : ''}
                    <span class="badge badge-${priorityColors[task.priority]}">
                        ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit" title="Editar tarefa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete" title="Excluir tarefa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Event listeners para os elementos da tarefa
        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.edit');
        const deleteBtn = li.querySelector('.delete');
        
        checkbox.addEventListener('click', () => this.toggleTaskComplete(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        return li;
    }
    
    toggleTaskComplete(taskId) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            const completed = !task.completed;
            this.updateTask(taskId, {
                completed: completed,
                completedAt: completed ? new Date().toISOString() : null
            });
            
            this.showToast(
                completed ? 'Tarefa concluída! 🎉' : 'Tarefa marcada como pendente',
                completed ? 'success' : 'info'
            );
        }
    }
    
    editTask(taskId) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            const newText = prompt('Editar tarefa:', task.text);
            if (newText !== null && newText.trim() !== '') {
                this.updateTask(taskId, { text: newText.trim() });
                this.showToast('Tarefa atualizada', 'success');
            }
        }
    }
    
    clearCompletedTasks() {
        if (!confirm('Tem certeza que deseja remover todas as tarefas concluídas?')) return;
        
        const tasks = this.getTasks();
        const incompleteTasks = tasks.filter(task => !task.completed);
        localStorage.setItem('taskflow_tasks', JSON.stringify(incompleteTasks));
        
        this.updateTaskList();
        this.showToast('Tarefas concluídas removidas', 'info');
    }
    
    toggleSelectAll() {
        const tasks = this.getFilteredTasks();
        const allCompleted = tasks.every(task => task.completed);
        
        tasks.forEach(task => {
            this.updateTask(task.id, { completed: !allCompleted });
        });
        
        this.showToast(
            allCompleted ? 'Todas as tarefas marcadas como pendentes' : 'Todas as tarefas marcadas como concluídas',
            'info'
        );
    }
    
    // ===== FILTROS E ORDENAÇÃO =====
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Atualizar botões ativos
        this.elements.filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.updateTaskList();
    }
    
    setPriority(priority) {
        this.currentPriority = priority;
        
        // Atualizar botões ativos
        this.elements.priorityButtons.forEach(btn => {
            if (btn.dataset.priority === priority) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // ===== EXPORTAR/IMPORTAR =====
    
    exportTasks() {
        const tasks = this.getTasks();
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `taskflow-tasks-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showToast('Tarefas exportadas com sucesso', 'success');
    }
    
    importTasks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = event => {
                try {
                    const importedTasks = JSON.parse(event.target.result);
                    
                    // Validar estrutura
                    if (!Array.isArray(importedTasks)) {
                        throw new Error('Formato inválido');
                    }
                    
                    // Mesclar com tarefas existentes
                    const currentTasks = this.getTasks();
                    const mergedTasks = [...currentTasks, ...importedTasks];
                    
                    // Remover duplicados (por ID)
                    const uniqueTasks = mergedTasks.filter((task, index, self) =>
                        index === self.findIndex(t => t.id === task.id)
                    );
                    
                    localStorage.setItem('taskflow_tasks', JSON.stringify(uniqueTasks));
                    this.updateTaskList();
                    
                    this.showToast(`${importedTasks.length} tarefas importadas com sucesso`, 'success');
                } catch (error) {
                    this.showToast('Erro ao importar tarefas. Verifique o formato do arquivo.', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // ===== ESTATÍSTICAS =====
    
    toggleStatsPanel() {
        this.elements.statsPanel.classList.toggle('hidden');
        if (!this.elements.statsPanel.classList.contains('hidden')) {
            this.updateStats();
            this.renderChart();
        }
    }
    
    updateStats() {
        const tasks = this.getTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const highPriority = tasks.filter(t => t.priority === 'high').length;
        
        this.elements.totalTasks.textContent = total;
        this.elements.completedTasks.textContent = completed;
        this.elements.pendingTasks.textContent = pending;
        this.elements.highPriorityTasks.textContent = highPriority;
    }
    
    renderChart() {
        const tasks = this.getTasks();
        const ctx = document.getElementById('tasksChart').getContext('2d');
        
        // Dados para o gráfico
        const categories = ['Geral', 'Trabalho', 'Pessoal', 'Compras', 'Saúde', 'Estudo'];
        const categoryCounts = categories.map(cat => 
            tasks.filter(t => this.getCategoryName(t.category) === cat).length
        );
        
        // Destruir gráfico anterior se existir
        if (window.tasksChart) {
            window.tasksChart.destroy();
        }
        
        // Criar novo gráfico
        window.tasksChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: categoryCounts,
                    backgroundColor: [
                        '#6d5dfc',
                        '#4fc3f7',
                        '#ff6b8b',
                        '#4caf50',
                        '#ff9800',
                        '#9c27b0'
                    ],
                    borderWidth: 2,
                    borderColor: 'var(--bg-primary)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-primary)',
                            padding: 20,
                            font: {
                                family: 'Inter'
                            }
                        }
                    }
                }
            }
        });
    }
    
    // ===== PROGRESSO =====
    
    updateProgress() {
        const tasks = this.getTasks();
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        this.elements.progressPercent.textContent = `${percentage}%`;
        this.elements.progressFill.style.width = `${percentage}%`;
    }
    
    updateTaskCount() {
        const tasks = this.getFilteredTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        
        this.elements.taskCount.textContent = `${total} tarefa${total !== 1 ? 's' : ''} (${completed} concluída${completed !== 1 ? 's' : ''})`;
    }
    
    // ===== TEMA =====
    
    setupTheme() {
        const savedTheme = localStorage.getItem('taskflow_theme') || 'light';
        const isDark = savedTheme === 'dark';
        
        document.body.classList.toggle('dark-theme', isDark);
        this.elements.themeToggle.checked = isDark;
    }
    
    toggleTheme() {
        const isDark = this.elements.themeToggle.checked;
        document.body.classList.toggle('dark-theme', isDark);
        localStorage.setItem('taskflow_theme', isDark ? 'dark' : 'light');
        
        this.showToast(`Tema ${isDark ? 'escuro' : 'claro'} ativado`, 'info');
    }
    
    // ===== DATA =====
    
    setupDate() {
        const today = new Date().toISOString().split('T')[0];
        this.elements.taskDueDate.min = today;
        this.elements.taskDueDate.value = today;
    }
    
    formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }
    
    // ===== ATALHOS DE TECLADO =====
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+F para buscar
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.elements.searchInput.focus();
                this.showToast('Campo de busca ativado', 'info');
            }
            
            // Escape para limpar
            if (e.key === 'Escape') {
                this.elements.searchInput.value = '';
                this.updateTaskList();
            }
            
            // Ctrl+Enter para tarefa rápida
            if (e.ctrlKey && e.key === 'Enter' && document.activeElement === this.elements.taskInput) {
                this.addQuickTaskFunc();
            }
        });
    }
    
    // ===== ARRASTAR E SOLTAR =====
    
    setupDragAndDrop() {
        let draggedItem = null;
        
        this.elements.taskList.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'LI') {
                draggedItem = e.target;
                setTimeout(() => {
                    draggedItem.classList.add('dragging');
                }, 0);
            }
        });
        
        this.elements.taskList.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
        });
        
        this.elements.taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(this.elements.taskList, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (afterElement == null) {
                this.elements.taskList.appendChild(draggable);
            } else {
                this.elements.taskList.insertBefore(draggable, afterElement);
            }
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    // ===== SERVICE WORKER =====
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registrado com sucesso:', registration.scope);
                    this.updateConnectionStatus(navigator.onLine);
                })
                .catch(error => {
                    console.log('Falha ao registrar o Service Worker:', error);
                });
        }
    }
    
    // ===== STATUS DE CONEXÃO =====
    
    updateConnectionStatus(isOnline) {
        const statusEl = this.elements.connectionStatus;
        const icon = statusEl.querySelector('i');
        
        if (isOnline) {
            statusEl.innerHTML = '<i class="fas fa-wifi"></i> Online';
            this.showToast('Conexão restaurada', 'success');
            this.elements.lastSync.textContent = 'Última sincronização: Agora mesmo';
        } else {
            statusEl.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
            this.showToast('Modo offline ativado', 'warning');
            this.elements.lastSync.textContent = 'Modo offline - sincronização pendente';
        }
    }
    
    // ===== NOTIFICAÇÕES =====
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${icons[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${this.getToastTitle(type)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Fechar toast
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
        
        // Mostrar toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
    
    getToastTitle(type) {
        const titles = {
            'success': 'Sucesso!',
            'error': 'Erro!',
            'warning': 'Atenção!',
            'info': 'Informação'
        };
        return titles[type] || 'Notificação';
    }
    
    // ===== MODAIS =====
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }
    
    // ===== RESETAR APP =====
    
    resetApp() {
        if (confirm('Tem certeza que deseja resetar o aplicativo? Todas as tarefas serão perdidas.')) {
            localStorage.removeItem('taskflow_tasks');
            localStorage.removeItem('taskflow_theme');
            
            this.showToast('Aplicativo resetado com sucesso', 'info');
            setTimeout(() => location.reload(), 1000);
        }
    }
    
    // ===== CARREGAR TAREFAS =====
    
    loadTasks() {
        this.updateTaskList();
        this.showToast('Tarefas carregadas com sucesso', 'success');
    }
    
    saveTasks() {
        // Atualizar último salvamento
        const now = new Date();
        this.elements.saveNotice.style.display = 'flex';
        
        setTimeout(() => {
            this.elements.saveNotice.style.display = 'none';
        }, 2000);
    }
    
    // ===== ATUALIZAR UI =====
    
    updateUI() {
        this.updateTaskList();
        this.updateProgress();
        this.updateTaskCount();
        this.updateConnectionStatus(navigator.onLine);
    }
    
    // ===== UTILITÁRIOS =====
    
    getCategoryName(categoryKey) {
        const categories = {
            'general': 'Geral',
            'work': 'Trabalho',
            'personal': 'Pessoal',
            'shopping': 'Compras',
            'health': 'Saúde',
            'study': 'Estudo'
        };
        return categories[categoryKey] || 'Geral';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===== INICIALIZAR APLICATIVO =====
document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskFlowApp();
    window.app = app; // Para debugging
});

// ===== ATUALIZAR SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration.scope);
            
            // Verificar atualizações
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Nova versão disponível
                        if (confirm('Nova versão disponível! Recarregar para atualizar?')) {
                            window.location.reload();
                        }
                    }
                });
            });
        })
        .catch(error => {
            console.log('Falha ao registrar o Service Worker:', error);
        });
    
    // Limpar caches antigos
    caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== 'taskflow-v2') {
                    return caches.delete(cacheName);
                }
            })
        );
    });
}