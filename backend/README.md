# TaskFlow Commercial Backend

Backend API para o TaskFlow Commercial Edition - uma plataforma completa de gerenciamento de tarefas com autenticação, sincronização em nuvem e recursos comerciais.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Prisma ORM** - Camada de acesso ao banco de dados
- **JWT** - Autenticação e autorização
- **Zod** - Validação de dados
- **Swagger** - Documentação da API
- **Bcrypt** - Hash de senhas

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 15+
- Docker (opcional)

## 🛠️ Instalação

### 1. Clonar o repositório e instalar dependências:

```bash
npm install
```

### 2. Configurar variáveis de ambiente:

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Configure as seguintes variáveis:
- `DATABASE_URL` - URL de conexão com o banco de dados PostgreSQL
- `JWT_SECRET` - Segredo para tokens JWT
- `JWT_REFRESH_SECRET` - Segredo para refresh tokens
- `CLIENT_URL` - URL do frontend
- `PORT` - Porta do servidor

### 3. Configurar o banco de dados:

Execute as migrations do Prisma:

```bash
npx prisma migrate dev
```

Ou, se estiver usando o banco pela primeira vez:

```bash
npx prisma db push
```

### 4. Iniciar o servidor:

```bash
npm run dev
```

O servidor iniciará em `http://localhost:5000`

## 📚 Documentação da API

A documentação da API está disponível em `http://localhost:5000/api-docs`

## 🧪 Testes

Executar os testes:

```bash
npm test
```

## 🐳 Docker

Para executar com Docker:

```bash
docker-compose up -d
```

## 🛡️ Segurança

- Validação de entrada com Zod
- Autenticação JWT
- Proteção contra SQL injection com Prisma
- Headers de segurança (Helmet.js)

## 📊 Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/     # Controladores MVC
│   ├── middleware/      # Middleware de autenticação e tratamento de erros
│   ├── models/          # Modelos Prisma (em schema.prisma)
│   ├── routes/          # Definições de rotas
│   ├── services/        # Lógica de negócios
│   ├── utils/           # Funções utilitárias
│   └── server.js        # Arquivo principal do servidor
├── prisma/              # Configuração do Prisma
├── tests/               # Testes unitários
├── docker-compose.yml   # Configuração do Docker Compose
├── Dockerfile           # Imagem Docker
└── package.json         # Dependências e scripts
```

## 🔐 Endpoints de Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Obter informações do usuário autenticado
- `PUT /api/auth/profile` - Atualizar perfil
- `POST /api/auth/logout` - Logout

## 📝 Endpoints de Tarefas

- `GET /api/tasks` - Obter todas as tarefas
- `POST /api/tasks` - Criar nova tarefa
- `GET /api/tasks/:id` - Obter tarefa específica
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Excluir tarefa
- `POST /api/tasks/sync` - Sincronizar tarefas (offline-first)

## 🔄 Sincronização Offline-First

O sistema implementa sincronização offline-first com controle de versão para resolver conflitos:

- Cada registro tem `syncVersion` e `lastSync`
- Endpoint `/api/tasks/sync` para operações em lote
- Resolução de conflitos com "last write wins"
- Salvar localmente e sincronizar quando online

## 🧩 Fases do Projeto

### Fase 1: Backend Básico (Concluída)
- API REST com autenticação JWT
- CRUD completo de tarefas
- Sincronização offline-first
- Documentação Swagger

### Fase 2: Segurança e Privacidade
- Criptografia de dados sensíveis
- Rate limiting
- Validação de entrada aprimorada

### Fase 3: Colaboração
- Compartilhamento de listas
- Permissões multiusuário
- Comentários em tarefas

### Fase 4: Monetização
- Planos de assinatura
- Integração com pagamentos

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Crie um Pull Request

## 📄 Licença

Este projeto está licenciado sob os termos da licença MIT - veja o arquivo LICENSE para detalhes.