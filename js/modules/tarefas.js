import { listaDeTarefas, filtroAtivo, termoBusca, ordenarPor, salvarNoLocalStorage } from './storage.js';
import { gerarId, dataHoje } from './helpers.js';

export function adicionarTarefa(descricao, categoria = 'Pessoal') {
    if (descricao.trim() === '') return;
    
    listaDeTarefas.push({
        id: gerarId(),
        descricao: descricao.trim(),
        status: 'pendente',
        categoria: categoria,
        data: dataHoje(),
    });
    salvarNoLocalStorage();
    renderizarLista();
}

export function renderizarLista() {
    const lista = document.querySelector('#lista-tarefas');
    if (!lista) return;
    
    lista.innerHTML = '';

    let tarefasFiltradas = listaDeTarefas.filter(t =>
        filtroAtivo === 'todos' || t.status === filtroAtivo
    );

    // Filtro por busca
    tarefasFiltradas = tarefasFiltradas.filter(t =>
        t.descricao.toLowerCase().includes(termoBusca.toLowerCase())
    );

    // Ordenação
    tarefasFiltradas.sort((a, b) => {
        if (ordenarPor === 'data') {
            return new Date(b.data) - new Date(a.data);
        } else if (ordenarPor === 'categoria') {
            return a.categoria.localeCompare(b.categoria);
        } else if (ordenarPor === 'status') {
            const statusOrder = { 'pendente': 1, 'em andamento': 2, 'concluída': 3 };
            return statusOrder[a.status] - statusOrder[b.status];
        }
        return 0;
    });

    tarefasFiltradas.forEach(tarefa => {
        const item = document.createElement('li');
        item.setAttribute('data-status', tarefa.status);
        item.setAttribute('data-categoria', tarefa.categoria);

        const spanDescricao = document.createElement('span');
        spanDescricao.textContent = `${tarefa.descricao} (${tarefa.data}) [${tarefa.categoria}]`;
        spanDescricao.className = 'descricao-tarefa';

        // Edição por duplo clique
        spanDescricao.addEventListener('dblclick', () => {
            const novoTexto = prompt('Editar tarefa:', tarefa.descricao);
            if (novoTexto !== null && novoTexto.trim() !== '') {
                const tarefaEditada = listaDeTarefas.find(t => t.id === tarefa.id);
                if (tarefaEditada) {
                    tarefaEditada.descricao = novoTexto.trim();
                    salvarNoLocalStorage();
                    renderizarLista();
                }
            }
        });

        const selectStatus = document.createElement('select');
        ['pendente', 'em andamento', 'concluída'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            if (status === tarefa.status) option.selected = true;
            selectStatus.appendChild(option);
        });

        selectStatus.addEventListener('change', (e) => {
            const tarefaEditada = listaDeTarefas.find(t => t.id === tarefa.id);
            if (tarefaEditada) {
                tarefaEditada.status = e.target.value;
                salvarNoLocalStorage();
                renderizarLista();

                // Notificação ao concluir
                if (tarefaEditada.status === 'concluída') {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Tarefa concluída!', { 
                            body: `"${tarefa.descricao}" foi marcada como concluída.` 
                        });
                    }
                }
            }
        });

        const botaoRemover = document.createElement('button');
        botaoRemover.textContent = '🗑️';
        botaoRemover.className = 'btn-remover';
        botaoRemover.setAttribute('aria-label', `Remover tarefa: ${tarefa.descricao}`);
        botaoRemover.addEventListener('click', () => {
            if (confirm('Remover esta tarefa?')) {
                const index = listaDeTarefas.findIndex(t => t.id === tarefa.id);
                if (index !== -1) {
                    listaDeTarefas.splice(index, 1);
                    salvarNoLocalStorage();
                    renderizarLista();
                }
            }
        });

        const containerBotoes = document.createElement('div');
        containerBotoes.className = 'container-botoes';
        containerBotoes.appendChild(selectStatus);
        containerBotoes.appendChild(botaoRemover);

        item.appendChild(spanDescricao);
        item.appendChild(containerBotoes);
        lista.appendChild(item);
    });
}