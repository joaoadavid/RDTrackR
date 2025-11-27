# ===========================
# Stage 1 — Build da aplicação (Node)
# ===========================
FROM node:18 AS build
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia todo o projeto
COPY . .

# Gera o build de produção
RUN npm run build


# ===========================
# Stage 2 — Servindo via NGINX
# ===========================
FROM nginx:stable

# Remove a configuração default
RUN rm -rf /usr/share/nginx/html/*

# Copia o build gerado pelo Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a config do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
