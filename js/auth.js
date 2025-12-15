// taskflow-auth.js
// Funções de autenticação e gerenciamento de perfil para o TaskFlow

class TaskFlowAuth {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Eventos globais
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUI();
        });

        // Eventos para login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Eventos para registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Eventos para recuperação de senha
        const recoveryCodeBtn = document.getElementById('verifyCode');
        if (recoveryCodeBtn) {
            recoveryCodeBtn.addEventListener('click', (e) => this.handleRecoveryCode(e));
        }

        // Eventos para perfil
        const profileSaveBtn = document.querySelector('.btn-save');
        if (profileSaveBtn) {
            profileSaveBtn.addEventListener('click', (e) => this.handleProfileSave(e));
        }

        // Eventos para configurações
        const themeToggle = document.getElementById('darkThemeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => this.toggleTheme(e.target.checked));
        }
    }

    updateUI() {
        // Atualiza a interface com base no estado do usuário
        const userMenu = document.getElementById('userMenu');
        if (userMenu && this.currentUser) {
            userMenu.innerHTML = `
                <span>${this.currentUser.name}</span>
                <img src="${this.currentUser.avatar || 'icons/user-default.png'}" alt="Avatar" class="user-avatar">
            `;
        }
    }

    getCurrentUser() {
        // Em implementação real, isso viria de um token ou sessão
        const user = localStorage.getItem('taskflow_user');
        return user ? JSON.parse(user) : null;
    }

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // Simular requisição de login
            const response = await this.simulateLoginRequest(email, password);
            
            if (response.success) {
                // Armazenar informações do usuário
                this.currentUser = response.user;
                localStorage.setItem('taskflow_user', JSON.stringify(response.user));
                localStorage.setItem('taskflow_token', response.token);
                
                // Redirecionar para a página principal
                window.location.href = 'index.html';
            } else {
                this.showAuthError('loginError', response.message || 'Email ou senha inválidos');
            }
        } catch (error) {
            this.showAuthError('loginError', 'Erro ao conectar com o servidor');
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Validação
        if (password !== confirmPassword) {
            this.showAuthError('registerError', 'As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('registerError', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            // Simular requisição de registro
            const response = await this.simulateRegisterRequest(name, email, password);
            
            if (response.success) {
                // Armazenar informações do usuário
                this.currentUser = response.user;
                localStorage.setItem('taskflow_user', JSON.stringify(response.user));
                localStorage.setItem('taskflow_token', response.token);
                
                // Redirecionar para a página principal
                window.location.href = 'index.html';
            } else {
                this.showAuthError('registerError', response.message || 'Erro ao registrar');
            }
        } catch (error) {
            this.showAuthError('registerError', 'Erro ao conectar com o servidor');
        }
    }

    async handleRecoveryCode() {
        const code = document.getElementById('recoveryCode').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            this.showAuthError('recoveryError3', 'As senhas não coincidem');
            return;
        }

        if (newPassword.length < 6) {
            this.showAuthError('recoveryError3', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            // Simular redefinição de senha
            const response = await this.simulatePasswordReset(code, newPassword);
            
            if (response.success) {
                document.getElementById('recoverySuccess').style.display = 'block';
                document.getElementById('resetPassword').textContent = 'Ir para login';
                document.getElementById('resetPassword').onclick = () => {
                    window.location.href = 'login.html';
                };
            } else {
                this.showAuthError('recoveryError3', response.message || 'Código inválido');
            }
        } catch (error) {
            this.showAuthError('recoveryError3', 'Erro ao redefinir senha');
        }
    }

    async handleProfileSave(event) {
        event.preventDefault();
        
        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            bio: document.getElementById('bio').value,
            timezone: document.getElementById('timezone').value,
            language: document.getElementById('language').value
        };

        try {
            // Simular atualização de perfil
            const response = await this.simulateProfileUpdate(userData);
            
            if (response.success) {
                // Atualizar usuário local
                this.currentUser = {...this.currentUser, ...userData};
                localStorage.setItem('taskflow_user', JSON.stringify(this.currentUser));
                
                this.showToast('Perfil atualizado com sucesso!', 'success');
            } else {
                this.showToast('Erro ao atualizar perfil', 'error');
            }
        } catch (error) {
            this.showToast('Erro ao conectar com o servidor', 'error');
        }
    }

    toggleTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('taskflow_theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('taskflow_theme', 'light');
        }
    }

    showAuthError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Esconder após 5 segundos
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    showToast(message, type = 'info') {
        // Remover toasts existentes
        const existingToast = document.querySelector('.auth-toast');
        if (existingToast) existingToast.remove();

        // Criar novo toast
        const toast = document.createElement('div');
        toast.className = `auth-toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        // Cores por tipo
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            info: '#2196F3',
            warning: '#FF9800'
        };
        toast.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(toast);

        // Remover após 3 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Funções de simulação (em implementação real, seriam chamadas à API)
    simulateLoginRequest(email, password) {
        // Simular delay de rede
        return new Promise((resolve) => {
            setTimeout(() => {
                if (email === 'user@example.com' && password === 'password') {
                    resolve({
                        success: true,
                        user: {
                            id: 'user123',
                            name: 'Usuário Exemplo',
                            email: email,
                            plan: 'premium',
                            avatar: null
                        },
                        token: 'fake-jwt-token'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Email ou senha inválidos'
                    });
                }
            }, 1000);
        });
    }

    simulateRegisterRequest(name, email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    user: {
                        id: 'user456',
                        name: name,
                        email: email,
                        plan: 'free',
                        avatar: null
                    },
                    token: 'fake-jwt-token'
                });
            }, 1000);
        });
    }

    simulatePasswordReset(code, newPassword) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (code === '123456') {  // Código de exemplo
                    resolve({
                        success: true
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Código inválido'
                    });
                }
            }, 1000);
        });
    }

    simulateProfileUpdate(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true
                });
            }, 1000);
        });
    }

    // Funções de utilidade
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    logout() {
        localStorage.removeItem('taskflow_user');
        localStorage.removeItem('taskflow_token');
        this.currentUser = null;
        window.location.href = 'login.html';
    }
}

// Inicializar a classe quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.taskFlowAuth = new TaskFlowAuth();
});

// Animações CSS (adicionadas via JavaScript para não precisar de um arquivo adicional)
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);