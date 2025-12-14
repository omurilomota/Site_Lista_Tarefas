# TaskFlow - Aplicativo Avançado de Lista de Tarefas

TaskFlow é um aplicativo web progressivo (PWA) de lista de tarefas com funcionalidades avançadas e design moderno, desenvolvido para oferecer uma experiência de produtividade premium.

## ✨ Funcionalidades Principais

### 📋 Gerenciamento de Tarefas
- **Adição inteligente** de tarefas com categorias e prioridades
- **Marcação de conclusão** com animações suaves
- **Edição e exclusão** de tarefas individualmente
- **Datas de vencimento** com indicadores visuais
- **Categorização** (Trabalho, Pessoal, Compras, Saúde, Estudo, Geral)

### 🎨 Interface Moderna
- **Tema claro/escuro** com persistência
- **Design responsivo** para todos os dispositivos
- **Animações e transições** suaves
- **Progresso visual** das tarefas do dia
- **Estatísticas** com gráficos interativos

### 🔍 Filtros e Busca
- **Filtros inteligentes** (Todas, Pendentes, Completas, Hoje, Alta Prioridade)
- **Busca em tempo real** nas tarefas
- **Ordenação** por data, prioridade ou alfabética

### ⚡ Recursos Avançados
- **Funcionamento offline** (PWA)
- **Sincronização automática**
- **Exportação/importação** de tarefas (JSON)
- **Atalhos de teclado** para produtividade
- **Arrastar e soltar** para reorganizar tarefas
- **Notificações toast** para feedback

### 📊 Estatísticas Visuais
- **Gráfico de categorias** em formato doughnut
- **Contadores** de tarefas (totais, completas, pendentes, alta prioridade)
- **Progresso diário** com barra visual

## 🚀 Como Usar

1. **Adicionar Tarefa**: Digite a tarefa, selecione categoria e prioridade, clique em "Adicionar"
2. **Marcar como Concluída**: Clique no círculo ao lado da tarefa
3. **Editar/Excluir**: Use os botões de ação (lápis/lixeira)
4. **Filtrar**: Use os botões de filtro acima da lista
5. **Buscar**: Digite no campo de busca no cabeçalho
6. **Alternar Tema**: Use o interruptor no canto superior direito
7. **Ver Estatísticas**: Clique no botão de gráfico no cabeçalho

## ⌨️ Atalhos de Teclado

- `Enter` - Adicionar tarefa
- `Ctrl + Enter` - Adicionar tarefa rápida
- `Ctrl + F` - Focar na busca
- `Escape` - Limpar busca/seleção
- `Espaço` - Marcar/desmarcar tarefa selecionada

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com variáveis CSS
- **JavaScript (ES6+)** - Lógica do aplicativo
- **Chart.js** - Gráficos e estatísticas
- **Font Awesome** - Ícones
- **Google Fonts** - Tipografia moderna
- **Service Workers** - Funcionalidade offline

## 📱 Instalação como PWA

1. Abra o TaskFlow em um navegador moderno (Chrome, Edge, Safari)
2. Clique no ícone de instalação na barra de endereços
3. Ou use o menu do navegador para "Instalar aplicativo"

## 🔧 Personalização

O TaskFlow é altamente personalizável através das variáveis CSS no arquivo `style.css`:

```css
:root {
    --primary-color: #6d5dfc;
    --bg-primary: #ffffff;
    --text-primary: #212529;
    /* ... outras variáveis */
}

📄 Licença

Este projeto é de código aberto e pode ser utilizado para fins educacionais e comerciais.
👨‍💻 Desenvolvido por

TaskFlow foi desenvolvido como um projeto de demonstração de PWA avançado com foco em UX/UI moderna.

Versão: 2.0
Status: Em produção
Última atualização: 2024


## 7. Estrutura de pastas recomendada:

taskflow-app/
├── index.html
├── manifest.json
├── sw.js
├── README.md
├── css/
│ └── style.css
├── js/
│ └── main.js
├── icons/
│ ├── icon-72.png
│ ├── icon-96.png
│ ├── icon-128.png
│ ├── icon-144.png
│ ├── icon-152.png
│ ├── icon-192.png
│ ├── icon-384.png
│ ├── icon-512.png
│ ├── add-task-192.png
│ ├── today-192.png
│ └── favicon.ico
└── images/
└── screenshot.png


## Características principais implementadas:

1. **Design Moderno**: Interface limpa com tema claro/escuro, animações suaves e design responsivo
2. **Funcionalidades Avançadas**:
   - Categorias de tarefas
   - Níveis de prioridade (alta, média, baixa)
   - Datas de vencimento com indicadores
   - Busca e filtros avançados
   - Ordenação por múltiplos critérios
   - Estatísticas visuais com gráficos
   - Progresso diário visual

3. **Produtividade**:
   - Atalhos de teclado
   - Tarefas rápidas
   - Arrastar e soltar
   - Seleção em massa
   - Exportação/importação JSON

4. **Experiência do Usuário**:
   - Notificações toast
   - Feedback visual imediato
   - Status de conexão
   - Salvamento automático
   - Modais informativos

5. **Tecnologia**:
   - PWA completo (offline-first)
   - Service Worker com cache inteligente
   - LocalStorage para persistência
   - Chart.js para gráficos
   - Design system com variáveis CSS

Este aplicativo está pronto para uso e pode ser facilmente implantado em qualquer servidor web. Para uma experiência completa, recomendo criar os ícones nas dimensões especificadas no manifest.json.