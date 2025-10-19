// Variáveis globais compartilhadas
export let listaDeTarefas = [];
export let filtroAtivo = 'todos';
export let termoBusca = '';
export let ordenarPor = 'data';

export function salvarNoLocalStorage() {
    try {
        localStorage.setItem('listaDeTarefas', JSON.stringify(listaDeTarefas));
    } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
        alert('Espaço de armazenamento cheio ou erro ao salvar.');
    }
}

export function carregarDoLocalStorage() {
    try {
        const dados = localStorage.getItem('listaDeTarefas');
        if (dados) {
            const parsed = JSON.parse(dados);
            if (Array.isArray(parsed)) {
                listaDeTarefas = parsed.map(t => ({
                    id: t.id || gerarId(),
                    descricao: t.descricao || 'Tarefa sem nome',
                    status: t.status || 'pendente',
                    categoria: t.categoria || 'Pessoal',
                    data: t.data || dataHoje()
                }));
            }
        }
    } catch (e) {
        console.error('Erro ao carregar do localStorage:', e);
        alert('Erro ao carregar tarefas. Dados corrompidos.');
        listaDeTarefas = [];
    }
}