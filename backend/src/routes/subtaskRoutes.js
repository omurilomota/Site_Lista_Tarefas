const express = require('express');
const router = express.Router();
const SubtaskController = require('../controllers/subtaskController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Subtasks
 *   description: API de gerenciamento de subtarefas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Subtask:
 *       type: object
 *       required:
 *         - title
 *         - taskId
 *       properties:
 *         id:
 *           type: string
 *           description: ID único da subtarefa
 *           example: "cln9876543210"
 *         title:
 *           type: string
 *           description: Título da subtarefa
 *           example: "Comprar ingredientes"
 *         completed:
 *           type: boolean
 *           description: Status de conclusão da subtarefa
 *           example: false
 *         taskId:
 *           type: string
 *           description: ID da tarefa à qual pertence
 *           example: "cln1234567890"
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
 *     CreateSubtask:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: "Nova subtarefa"
 *         completed:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * /api/subtasks/task/{taskId}:
 *   post:
 *     summary: Criar uma nova subtarefa para uma tarefa específica
 *     tags: [Subtasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubtask'
 *     responses:
 *       201:
 *         description: Subtarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subtask'
 *       404:
 *         description: Tarefa não encontrada ou não pertence ao usuário
 */
router.post('/subtask/task/:taskId', authenticateToken, SubtaskController.createSubtask);

/**
 * @swagger
 * /api/subtasks/task/{taskId}:
 *   get:
 *     summary: Obter todas as subtarefas de uma tarefa específica
 *     tags: [Subtasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Lista de subtarefas
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
 *                     $ref: '#/components/schemas/Subtask'
 *       404:
 *         description: Tarefa não encontrada ou não pertence ao usuário
 */
router.get('/subtask/task/:taskId', authenticateToken, SubtaskController.getSubtasks);

/**
 * @swagger
 * /api/subtasks/task/{taskId}/subtask/{subtaskId}:
 *   get:
 *     summary: Obter subtarefa por ID
 *     tags: [Subtasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da subtarefa
 *     responses:
 *       200:
 *         description: Subtarefa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subtask'
 *       404:
 *         description: Subtarefa não encontrada
 */
router.get('/subtask/task/:taskId/subtask/:subtaskId', authenticateToken, SubtaskController.getSubtask);

/**
 * @swagger
 * /api/subtasks/task/{taskId}/subtask/{subtaskId}:
 *   put:
 *     summary: Atualizar subtarefa por ID
 *     tags: [Subtasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da subtarefa
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Subtarefa atualizada"
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Subtarefa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subtask'
 *       404:
 *         description: Subtarefa não encontrada
 */
router.put('/subtask/task/:taskId/subtask/:subtaskId', authenticateToken, SubtaskController.updateSubtask);

/**
 * @swagger
 * /api/subtasks/task/{taskId}/subtask/{subtaskId}:
 *   delete:
 *     summary: Excluir subtarefa por ID
 *     tags: [Subtasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da subtarefa
 *     responses:
 *       200:
 *         description: Subtarefa excluída com sucesso
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
 *                   example: "Subtask deleted successfully"
 *       404:
 *         description: Subtarefa não encontrada
 */
router.delete('/subtask/task/:taskId/subtask/:subtaskId', authenticateToken, SubtaskController.deleteSubtask);

module.exports = router;