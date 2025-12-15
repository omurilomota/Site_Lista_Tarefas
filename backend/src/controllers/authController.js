const bcrypt = require('bcrypt');
const UserService = require('../services/userService');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { registerSchema, loginSchema } = require('../utils/validation');

class AuthController {
  static async register(req, res) {
    try {
      // Validação dos dados de entrada
      const validatedData = registerSchema.parse(req.body);
      
      // Criar o usuário
      const user = await UserService.createUser(validatedData);
      
      // Gerar token JWT
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      
      // Atualizar último login
      await UserService.updateUserLastLogin(user.id);
      
      res.status(201).json({
        success: true,
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        return res.status(400).json({
          error: 'Validation failed',
          details: [{ path: 'email', message: error.message }]
        });
      }
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req, res) {
    try {
      // Validação dos dados de entrada
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;
      
      // Encontrar o usuário pelo email
      const user = await UserService.findUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Verificar a senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Gerar tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      
      // Atualizar último login
      await UserService.updateUserLastLogin(user.id);
      
      // Remover senha do objeto retornado
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken
        }
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    try {
      const user = await UserService.findUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateProfile(req, res) {
    try {
      // Validação dos dados de entrada
      const validatedData = updateProfileSchema.parse(req.body);
      
      const updatedUser = await UserService.updateProfile(req.user.id, validatedData);
      
      res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async logout(req, res) {
    // Em um sistema real, você poderia invalidar o token
    // Neste exemplo, apenas enviamos uma resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

module.exports = AuthController;