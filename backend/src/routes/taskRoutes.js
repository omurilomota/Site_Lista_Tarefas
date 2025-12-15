const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: API de gerenciamento de tarefas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: ID único da tarefa
 *           example: "cln1234567890"
 *         title:
 *           type: string
 *           description: Título da tarefa
 *           example: "Comprar mantimentos"
 *         description:
 *           type: string
 *           description: Descrição da tarefa
 *           example: "Ir ao supermercado comprar frutas e legumes"
 *         completed:
 *           type: boolean
 *           description: Status de conclusão da tarefa
 *           example: false
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *           description: Prioridade da tarefa
 *           example: "HIGH"
 *         category:
 *           type: string
 *           enum: [GENERAL, WORK, PERSONAL, SHOPPING, HEALTH, STUDY]
 *           description: Categoria da tarefa
 *           example: "SHOPPING"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Data de vencimento da tarefa
 *           example: "2023-12-25T10:00:00.000Z"
 *         reminder:
 *           type: string
 *           format: date-time
 *           description: Horário do lembrete
 *           example: "2023-12-25T09:00:00.000Z"
 *         userId:
 *           type: string
 *           description: ID do usuário proprietário
 *           example: "cln0987654321"
 *         listId:
 *           type: string
 *           description: ID da lista à qual a tarefa pertence
 *           example: "cln1122334455"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *           example: "2023-12-01T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *           example: "2023-12-01T11:00:00.000Z"
 *         syncVersion:
 *           type: integer
 *           description: Versão para sincronização
 *           example: 1
 *         lastSync:
 *           type: string
 *           format: date-time
 *           description: Última sincronização
 *           example: "2023-12-01T10:00:00.000Z"
 *     CreateTask:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: "Nova tarefa"
 *         description:
 *           type: string
 *           example: "Descrição da tarefa"
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *           example: "MEDIUM"
 *         category:
 *           type: string
 *           enum: [GENERAL, WORK, PERSONAL, SHOPPING, HEALTH, STUDY]
 *           example: "WORK"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2023-12-25T10:00:00.000Z"
 *         reminder:
 *           type: string
 *           format: date-time
 *           example: "2023-12-25T09:00:00.000Z"
 *         listId:
 *           type: string
 *           example: "cln1122334455"
 *         order:
 *           type: integer
 *           example: 0
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Criar uma nova tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 */
router.post('/', authenticateToken, TaskController.createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obter lista de tarefas do usuário
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filtrar por tarefas completas ou incompletas
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Filtrar por prioridade
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [GENERAL, WORK, PERSONAL, SHOPPING, HEALTH, STUDY]
 *         description: Filtrar por categoria
 *       - in: query
 *         name: dueDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de vencimento
 *       - in: query
 *         name: listId
 *         schema:
 *           type: string
 *         description: Filtrar por ID da lista
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *     responses:
 *       200:
 *         description: Lista de tarefas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     pages:
 *                       type: integer
 *                       example: 1
 */
router.get('/', authenticateToken, TaskController.getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obter tarefa por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Tarefa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarefa não encontrada
 */
router.get('/:id', authenticateToken, TaskController.getTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Atualizar tarefa por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarefa não encontrada
 */
router.put('/:id', authenticateToken, TaskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Excluir tarefa por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Tarefa excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task deleted successfully"
 *       404:
 *         description: Tarefa não encontrada
 */
router.delete('/:id', authenticateToken, TaskController.deleteTask);

/**
 * @swagger
 * /api/tasks/sync:
 *   post:
 *     summary: Sincronizar tarefas (offline-first)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tasks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Task'
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp da sincronização
 *     responses:
 *       200:
 *         description: Sincronização concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
router.post('/sync', authenticateToken, TaskController.syncTasks);

module.exports = router;