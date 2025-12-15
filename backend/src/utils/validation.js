const { z } = require('zod');

// Schema para registro de usuário
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para login de usuário
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema para atualização de perfil
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email('Email inválido').optional(),
  avatarUrl: z.string().url('URL inválida').optional().nullable(),
});

// Schema para criação de tarefa
const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(500),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.enum(['GENERAL', 'WORK', 'PERSONAL', 'SHOPPING', 'HEALTH', 'STUDY']).optional(),
  dueDate: z.string().datetime().optional(),
  reminder: z.string().datetime().optional(),
  listId: z.string().cuid().optional(),
  order: z.number().int().optional(),
});

// Schema para atualização de tarefa
const updateTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(500).optional(),
  description: z.string().max(2000).optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.enum(['GENERAL', 'WORK', 'PERSONAL', 'SHOPPING', 'HEALTH', 'STUDY']).optional(),
  dueDate: z.string().datetime().optional(),
  reminder: z.string().datetime().optional(),
  listId: z.string().cuid().optional().nullable(),
  order: z.number().int().optional(),
});

// Schema para criação de lista
const createListSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
});

// Schema para compartilhamento de lista
const shareListSchema = z.object({
  userId: z.string().cuid(),
  permission: z.enum(['READ', 'WRITE', 'ADMIN']),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createTaskSchema,
  updateTaskSchema,
  createListSchema,
  shareListSchema,
};