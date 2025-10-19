import { carregarDoLocalStorage } from './storage.js';
import { renderizarLista } from './tarefas.js';
import { 
    configurarFiltros, 
    configurarEventosInput, 
    configurarBusca, 
    configurarOrdenacao, 
    configurarArrastarSoltar 
} from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados
    carregarDoLocalStorage();
    
    // Configurar interface
    configurarFiltros();
    configurarEventosInput();
    configurarBusca();
    configurarOrdenacao();
    configurarArrastarSoltar();
    
    // Renderizar lista inicial
    renderizarLista();

    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Permissão de notificação:', permission);
        });
    }

    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../json/sw.js', { scope: '../' })
            .then(reg => console.log('Service Worker registrado:', reg.scope))
            .catch(err => console.log('Erro no Service Worker:', err));
    }
});