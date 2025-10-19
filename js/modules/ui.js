import { listaDeTarefas, filtroAtivo, termoBusca, ordenarPor, salvarNoLocalStorage } from './storage.js';
import { renderizarLista, adicionarTarefa } from './tarefas.js';

export function configurarFiltros() {
    document.querySelectorAll('.filtros button[data-status]').forEach(btn => {
        btn.addEventListener('click', () => {
            filtroAtivo = btn.dataset.status;
            renderizarLista();
        });
    });

    const btnLimpar = document.getElementById('limpar-concluidas');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            if (confirm('Limpar todas as tarefas concluídas?')) {
                const originalLength = listaDeTarefas.length;
                listaDeTarefas = listaDeTarefas.filter(t => t.status !== 'concluída');
                if (listaDeTarefas.length < originalLength) {
                    salvarNoLocalStorage();
                    renderizarLista();
                }
            }
        });
    }
}

export function configurarEventosInput() {
    const inputTarefa = document.querySelector('#input-tarefa');
    const selectCategoria = document.getElementById('categoria');

    if (!inputTarefa) return;

    function adicionarTarefaHandler() {
        const categoria = selectCategoria ? selectCategoria.value : 'Pessoal';
        adicionarTarefa(inputTarefa.value, categoria);
        inputTarefa.value = '';
        
        // Feedback visual
        inputTarefa.style.outline = '2px solid #4CAF50';
        setTimeout(() => inputTarefa.style.outline = '', 500);
    }

    inputTarefa.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            adicionarTarefaHandler();
        }
    });

    const btnAdicionar = document.getElementById('btn-adicionar');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', adicionarTarefaHandler);
    }
}

export function configurarBusca() {
    const inputBusca = document.getElementById('input-busca');
    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            termoBusca = e.target.value.toLowerCase();
            renderizarLista();
        });
    }
}

export function configurarOrdenacao() {
    const selectOrdenar = document.getElementById('ordenar-por');
    if (selectOrdenar) {
        selectOrdenar.addEventListener('change', (e) => {
            ordenarPor = e.target.value;
            renderizarLista();
        });
    }
}

export function configurarArrastarSoltar() {
    const lista = document.querySelector('#lista-tarefas');
    if (!lista) return;

    let draggedItem = null;

    // Esta função precisa ser chamada após cada renderização
    function configurarDragAndDrop() {
        lista.querySelectorAll('li').forEach(item => {
            item.setAttribute('draggable', true);

            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                setTimeout(() => item.classList.add('dragging'), 0);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedItem = null;
            });
        });

        lista.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(lista, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                if (afterElement == null) {
                    lista.appendChild(draggable);
                } else {
                    lista.insertBefore(draggable, afterElement);
                }
            }
        });
    }

    function getDragAfterElement(container, y) {
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

    // Reconfigurar drag and drop após cada renderização
    const originalRenderizarLista = renderizarLista;
    window.renderizarLista = function() {
        originalRenderizarLista();
        setTimeout(configurarDragAndDrop, 0);
    };
}