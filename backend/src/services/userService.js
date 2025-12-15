const bcrypt = require('bcrypt');
const prisma = require('../utils/database');

class UserService {
  static async createUser(userData) {
    const { name, email, password } = userData;
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });
    
    // Remover a senha do objeto retornado
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  static async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }
  
  static async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }
  
  static async updateUserLastLogin(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() }
    });
  }
  
  static async updateProfile(userId, profileData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: profileData
    });
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = UserService;