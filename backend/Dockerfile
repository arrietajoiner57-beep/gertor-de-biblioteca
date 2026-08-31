FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (aprovecha la caché de capas)
COPY package*.json ./
RUN npm ci --omit=dev

# Código de la aplicación
COPY . .

EXPOSE 4000

# Espera a la BD, crea el admin y arranca el servidor
CMD ["node", "dockerEntrypoint.js"]
