const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Placeholder para rotas de lista
// Será implementado na Fase 3

/**
 * @swagger
 * tags:
 *   name: Lists
 *   description: API de gerenciamento de listas de tarefas
 */

/**
 * @swagger
 * /api/lists:
 *   get:
 *     summary: Obter todas as listas do usuário
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de listas do usuário
 */
router.get('/', authenticateToken, (req, res) => {
  res.status(200).json({ 
    success: true, 
    data: [],
    message: 'Endpoint de listas será implementado na Fase 3'
  });
});

/**
 * @swagger
 * /api/lists:
 *   post:
 *     summary: Criar uma nova lista
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Lista criada com sucesso
 */
router.post('/', authenticateToken, (req, res) => {
  res.status(201).json({ 
    success: true, 
    message: 'Endpoint de criação de lista será implementado na Fase 3'
  });
});

module.exports = router;