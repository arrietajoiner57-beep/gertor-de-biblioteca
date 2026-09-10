FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (aprovecha la caché de capas)
COPY package*.json ./
RUN npm ci --omit=dev

# Código de la aplicación
COPY . .

# Directorio de archivos digitales (PDF/EPUB)
RUN mkdir -p /app/uploads

EXPOSE 4000

# Espera a la BD, crea el admin y arranca el servidor
CMD ["node", "dockerEntrypoint.js"]
