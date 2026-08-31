# --- Etapa 1: build de la aplicacion React ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

# En produccion (docker) la API es relativa -> nginx hace proxy a /api
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .
RUN npm run build

# --- Etapa 2: servidor estatico con nginx ---
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
