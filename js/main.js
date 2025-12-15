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
        this.setupReminderChecker();

        // Prevenir que eventos de clique se propagem para os modais
        document.addEventListener('click', (e) => {
            // Só fecha modais se clicar fora do conteúdo do modal
            const modal = e.target.closest('.modal');
            if (modal && e.target === modal) {
                this.hideAllModals();
            }
        });
    }
    
    cacheElements() {
        // Cache de todos os elementos importantes
        this.elements = {
            // Inputs
            taskInput: document.getElementById('taskInput'),
            taskCategory: document.getElementById('taskCategory'),
            taskDueDate: document.getElementById('taskDueDate'),
            taskReminderTime: document.getElementById('taskReminderTime'),
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
            totalSubtasks: document.getElementById('totalSubtasks'),
            completedSubtasks: document.getElementById('completedSubtasks'),
            pendingSubtasks: document.getElementById('pendingSubtasks'),
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
            if (e.key === 'Enter' && !e.ctrlKey) {
                // Apenas Enter (sem Ctrl) adiciona uma tarefa
                this.addTask();
            } else if (e.ctrlKey && e.key === 'Enter') {
                // Ctrl+Enter adiciona uma tarefa rápida
                e.preventDefault(); // Prevenir o comportamento padrão
                this.addQuickTaskFunc();
            }
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

        // Fechar modais - overlay (fundo escuro)
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                // Fechar modal apenas se clicar na overlay (fundo escuro)
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });

        // Fechar modais ao clicar no botão de fechar
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.hideAllModals();
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
            reminderTime: this.elements.taskReminderTime.value || null,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
            subtasks: [] // Array para armazenar subtarefas
        };
        
        this.saveTask(task);
        this.elements.taskInput.value = '';
        this.elements.taskDueDate.value = '';
        this.elements.taskReminderTime.value = '';
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
            // Preservar subtarefas se existirem
            const currentSubtasks = tasks[taskIndex].subtasks || [];
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                ...updates,
                subtasks: updates.subtasks || currentSubtasks // Preservar subtarefas se não forem fornecidas
            };
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
                    ${task.reminderTime ? `
                        <span class="task-reminder" title="Lembrete definido para ${task.reminderTime}">
                            <i class="far fa-bell"></i>
                            ${task.reminderTime}
                        </span>
                    ` : ''}
                    <span class="badge badge-${priorityColors[task.priority]}">
                        ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                    </span>
                </div>
                ${task.subtasks && task.subtasks.length > 0 ? `
                <div class="subtasks-container">
                    <div class="subtasks-header">
                        <span class="subtasks-title">Subtarefas (${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length})</span>
                    </div>
                    <ul class="subtask-list">
                        ${task.subtasks.map(subtask => `
                            <li class="subtask-item ${subtask.completed ? 'completed' : ''}" data-subtask-id="${subtask.id}">
                                <div class="subtask-checkbox ${subtask.completed ? 'checked' : ''}"></div>
                                <span class="subtask-text ${subtask.completed ? 'completed' : ''}">${this.escapeHtml(subtask.text)}</span>
                                <div class="subtask-actions">
                                    <button class="subtask-action-btn edit-subtask" title="Editar subtarefa" data-task-id="${task.id}" data-subtask-id="${subtask.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="subtask-action-btn delete-subtask" title="Excluir subtarefa" data-task-id="${task.id}" data-subtask-id="${subtask.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>` : ''}
                <div class="add-subtask-form">
                    <input type="text" class="subtask-input" placeholder="Adicionar uma subtarefa...">
                    <button class="add-subtask-btn">
                        <i class="fas fa-plus"></i>
                    </button>
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
        const addSubtaskBtn = li.querySelector('.add-subtask-btn');
        const subtaskInput = li.querySelector('.subtask-input');

        checkbox.addEventListener('click', () => this.toggleTaskComplete(task.id));
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // IMPORTANTE: prevenir propagação
            this.editTask(task.id);
        });
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        // Event listeners para subtarefas
        if (addSubtaskBtn && subtaskInput) {
            addSubtaskBtn.addEventListener('click', () => {
                const subtaskText = subtaskInput.value.trim();
                if (subtaskText) {
                    this.addSubtask(task.id, subtaskText);
                    subtaskInput.value = '';
                }
            });

            subtaskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const subtaskText = subtaskInput.value.trim();
                    if (subtaskText) {
                        this.addSubtask(task.id, subtaskText);
                        subtaskInput.value = '';
                    }
                }
            });
        }

        // Event listeners para subtarefas existentes - usando data-* attributes para segurança
        const allSubtaskElements = li.querySelectorAll('.subtask-item');
        allSubtaskElements.forEach((subtaskElement) => {
            const subtaskDataId = subtaskElement.getAttribute('data-subtask-id');
            const originalSubtask = task.subtasks.find(st => st.id === subtaskDataId);

            if (originalSubtask) {
                const subtaskCheckbox = subtaskElement.querySelector('.subtask-checkbox');
                const editSubtaskBtn = subtaskElement.querySelector('.edit-subtask');
                const deleteSubtaskBtn = subtaskElement.querySelector('.delete-subtask');

                if (subtaskCheckbox) {
                    subtaskCheckbox.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.toggleSubtask(task.id, originalSubtask.id);
                    });
                }

                if (editSubtaskBtn) {
                    // Usando arrow function para manter o contexto correto de 'this'
                    editSubtaskBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevenir que o evento afete outros elementos
                        const taskId = editSubtaskBtn.getAttribute('data-task-id');
                        const subtaskId = editSubtaskBtn.getAttribute('data-subtask-id');
                        this.editSubtaskInline(taskId, subtaskId, subtaskElement);
                    });
                }

                if (deleteSubtaskBtn) {
                    deleteSubtaskBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevenir que o evento afete outros elementos
                        const taskId = deleteSubtaskBtn.getAttribute('data-task-id');
                        const subtaskId = deleteSubtaskBtn.getAttribute('data-subtask-id');
                        if (confirm('Tem certeza que deseja excluir esta subtarefa?')) {
                            this.deleteSubtask(taskId, subtaskId);
                        }
                    });
                }
            }
        });

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
        console.log('editTask chamado para taskId:', taskId); // DEBUG

        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            // Criar um modal de edição
            this.showEditTaskModal(task);
        }
    }

    showEditTaskModal(task) {
        // Remover modal anterior se existir
        const existingModal = document.getElementById('editTaskModal');
        if (existingModal) existingModal.remove();

        // Criar modal de edição
        const modal = document.createElement('div');
        modal.id = 'editTaskModal';
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Editar Tarefa</h3>
                    <button class="modal-close" id="closeEditTaskModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="edit-task-form">
                        <div class="form-group">
                            <label for="editTaskText">Texto da Tarefa</label>
                            <input type="text" id="editTaskText" value="${task.text}" placeholder="O que precisa ser feito?">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="editTaskCategory">Categoria</label>
                                <select id="editTaskCategory">
                                    <option value="general" ${task.category === 'general' ? 'selected' : ''}>📋 Geral</option>
                                    <option value="work" ${task.category === 'work' ? 'selected' : ''}>💼 Trabalho</option>
                                    <option value="personal" ${task.category === 'personal' ? 'selected' : ''}>👤 Pessoal</option>
                                    <option value="shopping" ${task.category === 'shopping' ? 'selected' : ''}>🛒 Compras</option>
                                    <option value="health" ${task.category === 'health' ? 'selected' : ''}>🏃 Saúde</option>
                                    <option value="study" ${task.category === 'study' ? 'selected' : ''}>📚 Estudo</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="editTaskPriority">Prioridade</label>
                                <select id="editTaskPriority">
                                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Baixa</option>
                                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Média</option>
                                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Alta</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="editTaskDueDate">Data de Vencimento</label>
                                <input type="date" id="editTaskDueDate" value="${task.dueDate || ''}">
                            </div>

                            <div class="form-group">
                                <label for="editTaskReminderTime">Horário do Lembrete</label>
                                <input type="time" id="editTaskReminderTime" value="${task.reminderTime || ''}">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="padding: var(--spacing-lg); border-top: 1px solid var(--border-color);">
                    <button id="saveTaskChanges" class="add-task-btn" style="margin-right: 10px;">
                        <i class="fas fa-save"></i> Salvar Alterações
                    </button>
                    <button id="cancelEditTask" class="danger-btn">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Adicionar eventos
        document.getElementById('closeEditTaskModal').addEventListener('click', () => this.closeEditTaskModal());
        document.getElementById('cancelEditTask').addEventListener('click', () => this.closeEditTaskModal());

        document.getElementById('saveTaskChanges').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevenir propagação

            const newText = document.getElementById('editTaskText').value.trim();
            const newCategory = document.getElementById('editTaskCategory').value;
            const newPriority = document.getElementById('editTaskPriority').value;
            const newDueDate = document.getElementById('editTaskDueDate').value;
            const newReminderTime = document.getElementById('editTaskReminderTime').value;

            if (newText === '') {
                this.showToast('O texto da tarefa não pode estar vazio', 'warning');
                return;
            }

            this.updateTask(task.id, {
                text: newText,
                category: newCategory,
                priority: newPriority,
                dueDate: newDueDate || null,
                reminderTime: newReminderTime || null
            });

            this.closeEditTaskModal();
            this.showToast('Tarefa atualizada com sucesso', 'success');
        });

        // Fechar ao pressionar ESC
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                this.closeEditTaskModal();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);

        // Fechar ao clicar fora do modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEditTaskModal();
            }
        });
    }

    closeEditTaskModal() {
        const modal = document.getElementById('editTaskModal');
        if (modal) {
            modal.remove();
        }
    }

    saveTaskChanges(taskId) {
        const newText = document.getElementById('editTaskText').value.trim();
        const newCategory = document.getElementById('editTaskCategory').value;
        const newPriority = document.getElementById('editTaskPriority').value;
        const newDueDate = document.getElementById('editTaskDueDate').value;
        const newReminderTime = document.getElementById('editTaskReminderTime').value;

        if (newText === '') {
            this.showToast('O texto da tarefa não pode estar vazio', 'warning');
            return;
        }

        this.updateTask(taskId, {
            text: newText,
            category: newCategory,
            priority: newPriority,
            dueDate: newDueDate || null,
            reminderTime: newReminderTime || null
        });

        this.closeEditTaskModal();
        this.showToast('Tarefa atualizada com sucesso', 'success');
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
        try {
            this.elements.statsPanel.classList.toggle('hidden');
            if (!this.elements.statsPanel.classList.contains('hidden')) {
                this.updateStats();
                this.renderChart();
            }
        } catch (error) {
            console.error('Erro ao alternar painel de estatísticas:', error);
            // Ocultar o painel em caso de erro para evitar que fique travado
            if (this.elements.statsPanel) {
                this.elements.statsPanel.classList.add('hidden');
            }
        }
    }
    
    updateStats() {
        const tasks = this.getTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const highPriority = tasks.filter(t => t.priority === 'high').length;

        // Contar subtarefas
        let totalSubtasks = 0;
        let completedSubtasks = 0;

        tasks.forEach(task => {
            if (task.subtasks && task.subtasks.length > 0) {
                task.subtasks.forEach(subtask => {
                    totalSubtasks++;
                    if (subtask.completed) {
                        completedSubtasks++;
                    }
                });
            }
        });

        this.elements.totalTasks.textContent = total;
        this.elements.completedTasks.textContent = completed;
        this.elements.pendingTasks.textContent = pending;
        this.elements.highPriorityTasks.textContent = highPriority;

        // Adicionar estatísticas de subtarefas ao painel de estatísticas
        if (this.elements.totalSubtasks) {
            this.elements.totalSubtasks.textContent = totalSubtasks;
        }
        if (this.elements.completedSubtasks) {
            this.elements.completedSubtasks.textContent = completedSubtasks;
        }
        if (this.elements.pendingSubtasks) {
            this.elements.pendingSubtasks.textContent = totalSubtasks - completedSubtasks;
        }
    }
    
    renderChart() {
        try {
            const tasks = this.getTasks();
            const chartCanvas = document.getElementById('tasksChart');

            // Verificar se o canvas existe antes de tentar criar o gráfico
            if (!chartCanvas) {
                console.warn('Canvas do gráfico não encontrado');
                return;
            }

            const ctx = chartCanvas.getContext('2d');

            // Verificar se o contexto foi obtido com sucesso
            if (!ctx) {
                console.warn('Não foi possível obter o contexto 2D do canvas');
                return;
            }

            // Dados para o gráfico
            const categories = ['Geral', 'Trabalho', 'Pessoal', 'Compras', 'Saúde', 'Estudo'];
            const categoryCounts = categories.map(cat =>
                tasks.filter(t => this.getCategoryName(t.category) === cat).length
            );

            // Contar subtarefas por categoria
            const subtasksByCategory = {};
            tasks.forEach(task => {
                if (task.subtasks && task.subtasks.length > 0) {
                    const category = this.getCategoryName(task.category);
                    if (!subtasksByCategory[category]) {
                        subtasksByCategory[category] = 0;
                    }
                    subtasksByCategory[category] += task.subtasks.length;
                }
            });

            // Converter em array para exibir no gráfico
            const subtaskCategoryCounts = categories.map(cat => subtasksByCategory[cat] || 0);

            // Destruir gráfico anterior se existir
            if (window.tasksChart) {
                window.tasksChart.destroy();
            }

            // Calcular total de subtarefas completas e pendentes
            let completedSubtasks = 0;
            let pendingSubtasks = 0;

            tasks.forEach(task => {
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(subtask => {
                        if (subtask.completed) {
                            completedSubtasks++;
                        } else {
                            pendingSubtasks++;
                        }
                    });
                }
            });

            // Criar novo gráfico
            window.tasksChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Tarefas', 'Subtarefas Completas', 'Subtarefas Pendentes'],
                    datasets: [{
                        data: [tasks.length, completedSubtasks, pendingSubtasks],
                        backgroundColor: [
                            '#6d5dfc',      // Tarefas principais
                            '#4caf50',      // Subtarefas completas
                            '#ff9800'       // Subtarefas pendentes
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
        } catch (error) {
            console.error('Erro ao renderizar o gráfico:', error);
            // Não deixar o erro travar a aplicação
        }
    }
    
    // ===== PROGRESSO =====
    
    updateProgress() {
        const tasks = this.getTasks();
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Obter horário atual
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        // Atualizar o texto do progresso com o horário
        this.elements.progressPercent.innerHTML = `${percentage}% <span class="current-time">(${currentTime})</span>`;
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
        try {
            const modal = document.getElementById(modalId);
            if (modal) {
                // Primeiro, esconder todos os outros modais
                this.hideAllModals();

                // Adicionar classe 'modal-open' ao body para evitar scroll
                document.body.classList.add('modal-open');

                // Remover a classe 'hidden' e adicionar 'show'
                modal.classList.remove('hidden');

                // Pequeno delay para garantir a animação
                setTimeout(() => {
                    modal.classList.add('show');

                    // Focar no primeiro elemento interativo
                    const focusable = modal.querySelector('button, input, select, textarea');
                    if (focusable) {
                        focusable.focus();
                    }
                }, 10);
            }
        } catch (error) {
            console.error(`Erro ao mostrar modal ${modalId}:`, error);
        }
    }

    hideAllModals() {
        try {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
                // Adicionar um pequeno delay antes de adicionar 'hidden' para permitir animação
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
            });

            // Remover classe 'modal-open' do body
            document.body.classList.remove('modal-open');
        } catch (error) {
            console.error('Erro ao ocultar modais:', error);
        }
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

    // ===== LEMBRETES =====

    checkReminders() {
        const tasks = this.getTasks();
        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
        const today = now.toISOString().split('T')[0];

        tasks.forEach(task => {
            if (!task.completed && task.dueDate && task.reminderTime) {
                if (task.dueDate === today && task.reminderTime === currentTime) {
                    this.showTaskReminder(task);
                }
            }
        });
    }

    showTaskReminder(task) {
        // Check if notifications are supported and enabled
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.displayNotification(task);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.displayNotification(task);
                    }
                });
            }
        }

        // Fallback to toast notification if browser notification is not granted
        this.showToast(`Lembrete: ${task.text}`, 'info');
    }

    displayNotification(task) {
        const notification = new Notification('Lembrete de Tarefa', {
            body: task.text,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-72.png',
            tag: task.id
        });

        // Close notification after 10 seconds
        setTimeout(() => {
            if (notification) {
                notification.close();
            }
        }, 10000);

        // Open task app when notification is clicked
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }

    setupReminderChecker() {
        // Check for reminders every minute
        setInterval(() => {
            this.checkReminders();
        }, 60000); // Check every minute

        // Initial check
        this.checkReminders();
    }

    // ===== SUBTAREFAS =====

    addSubtask(taskId, subtaskText) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1) {
            const newSubtask = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Criar ID único
                text: subtaskText,
                completed: false,
                createdAt: new Date().toISOString()
            };

            tasks[taskIndex].subtasks.push(newSubtask);
            localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
            this.updateTaskList();
            this.showToast('Subtarefa adicionada com sucesso', 'success');
        }
    }

    toggleSubtask(taskId, subtaskId) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            const subtask = task.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                subtask.completed = !subtask.completed;
                subtask.completedAt = subtask.completed ? new Date().toISOString() : null;

                localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
                this.updateTaskList();

                this.showToast(
                    subtask.completed ? 'Subtarefa concluída! 🎉' : 'Subtarefa marcada como pendente',
                    subtask.completed ? 'success' : 'info'
                );
            }
        }
    }

    deleteSubtask(taskId, subtaskId) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);
            localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
            this.updateTaskList();
            this.showToast('Subtarefa removida', 'info');
        }
    }

    editSubtask(taskId, subtaskId, newText, newCompleted = null) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            const subtask = task.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                subtask.text = newText;
                if (newCompleted !== null) {
                    subtask.completed = newCompleted;
                    subtask.completedAt = newCompleted ? new Date().toISOString() : null;
                }
                localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
                this.updateTaskList();
                this.showToast('Subtarefa atualizada', 'success');
            }
        }
    }

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
    
    editSubtaskInline(taskId, subtaskId, subtaskElement) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);
        const subtask = task ? task.subtasks.find(st => st.id === subtaskId) : null;

        if (!subtask) {
            console.error('Subtarefa não encontrada');
            return;
        }

        // Substituir texto por input de edição
        const subtaskTextElement = subtaskElement.querySelector('.subtask-text');
        const currentText = subtask.text;

        // Criar container para edição inline
        const editContainer = document.createElement('div');
        editContainer.className = 'inline-edit-container';

        // Manter o checkbox
        const checkbox = subtaskElement.querySelector('.subtask-checkbox').cloneNode(true);
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSubtask(taskId, subtaskId);
        });

        // Input de edição
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-subtask-input';
        input.value = currentText;

        // Botões de ação
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'subtask-actions';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'subtask-action-btn save-subtask';
        saveBtn.innerHTML = '<i class="fas fa-check"></i>';
        saveBtn.title = 'Salvar';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'subtask-action-btn cancel-subtask';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
        cancelBtn.title = 'Cancelar';

        actionsDiv.appendChild(saveBtn);
        actionsDiv.appendChild(cancelBtn);

        // Montar container
        editContainer.appendChild(checkbox);
        editContainer.appendChild(input);
        editContainer.appendChild(actionsDiv);

        // Substituir o conteúdo
        subtaskElement.innerHTML = '';
        subtaskElement.appendChild(editContainer);

        // Focar no input
        input.focus();
        input.select();

        // Função para salvar
        const saveChanges = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                this.editSubtask(taskId, subtaskId, newText);
            } else {
                // Restaurar visualização original
                this.updateTaskList();
            }
        };

        // Função para cancelar
        const cancelEdit = () => {
            this.updateTaskList();
        };

        // Event listeners
        saveBtn.addEventListener('click', saveChanges);
        cancelBtn.addEventListener('click', cancelEdit);

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveChanges();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });

        // Salvar ao perder foco
        input.addEventListener('blur', () => {
            setTimeout(saveChanges, 100);
        });
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