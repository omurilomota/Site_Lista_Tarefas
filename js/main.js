const botao = document.getElementById('addTaskButton');

botao.addEventListener('click', function () {
    const tarefaInput = document.getElementById('taskInput');
    const tarefaTexto = tarefaInput.value.trim();

    if (tarefaTexto !== '') {
        const listaTarefas = document.getElementById('taskList');

        const novaTarefa = document.createElement('li');
        novaTarefa.textContent = tarefaTexto;

        listaTarefas.appendChild(novaTarefa);

        tarefaInput.value = '';
    } else {
        alert('Por favor, insira uma tarefa válida.');
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/json/sw.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    }
    );
}


const filtroInput = document.getElementById('searchInput');

filtroInput.addEventListener('input', function () {
    const filtroTexto = filtroInput.value.toLowerCase();
    const listaTarefas = document.getElementById('taskList');
    const tarefas = listaTarefas.getElementsByTagName('li');

    Array.from(tarefas).forEach(function (tarefa) {
        const tarefaTexto = tarefa.textContent.toLowerCase();
        if (tarefaTexto.includes(filtroTexto)) {
            tarefa.style.display = '';
        } else {
            tarefa.style.display = 'none';
        }
    });
});

const limparButton = document.getElementById('clearTasksButton');
limparButton.addEventListener('click', function () {
    const listaTarefas = document.getElementById('taskList');
    listaTarefas.innerHTML = '';
});

const toggleThemeButton = document.getElementById('toggleThemeButton');
toggleThemeButton.addEventListener('click', function () {
    document.body.classList.toggle('dark-theme');
});

const taskInput = document.getElementById('taskInput');
taskInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        botao.click();
    }
});

const salvarButton = document.getElementById('saveTasksButton');

salvarButton.addEventListener('click', function () {
    const listaTarefas = document.getElementById('taskList');
    const tarefas = listaTarefas.getElementsByTagName('li');
    const tarefasArray = Array.from(tarefas).map(tarefa => tarefa.textContent);
    localStorage.setItem('tarefas', JSON.stringify(tarefasArray));
}
);

window.addEventListener('load', function () {
    const tarefasSalvas = localStorage.getItem('tarefas');
    if (tarefasSalvas) {
        const tarefasArray = JSON.parse(tarefasSalvas);
        const listaTarefas = document.getElementById('taskList');
        tarefasArray.forEach(tarefaTexto => {
            const novaTarefa = document.createElement('li');
            novaTarefa.textContent = tarefaTexto;
            listaTarefas.appendChild(novaTarefa);
        });
    }
}
);

const importarButton = document.getElementById('importTasksButton');
importarButton.addEventListener('click', function () {
    const arquivoInput = document.createElement('input');
    arquivoInput.type = 'file';
    arquivoInput.accept = '.json';

    arquivoInput.addEventListener('change', function () {
        const arquivo = arquivoInput.files[0];
        const leitor = new FileReader();

        leitor.onload = function (e) {
            try {
                const tarefasArray = JSON.parse(e.target.result);
                const listaTarefas = document.getElementById('taskList');
                tarefasArray.forEach(tarefaTexto => {
                    const novaTarefa = document.createElement('li');
                    novaTarefa.textContent = tarefaTexto;
                    listaTarefas.appendChild(novaTarefa);
                });
            } catch (error) {
                alert('Erro ao importar tarefas: arquivo inválido.');
            }
        };

        leitor.readAsText(arquivo);
    });

    arquivoInput.click();
});
const exportarButton = document.getElementById('exportTasksButton');

exportarButton.addEventListener('click', function () {
    const listaTarefas = document.getElementById('taskList');
    const tarefas = listaTarefas.getElementsByTagName('li');
    const tarefasArray = Array.from(tarefas).map(tarefa => tarefa.textContent);
    const tarefasJSON = JSON.stringify(tarefasArray, null, 2);

    const blob = new Blob([tarefasJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'tarefas.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
);

// Fim do arquivo js/main.js