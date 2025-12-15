# Use a imagem oficial do Node.js
FROM node:18-alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código
COPY . .

# Gere o cliente do Prisma
RUN npx prisma generate

# Exponha a porta
EXPOSE 5000

# Comando para rodar o servidor
CMD ["npm", "run", "dev"]