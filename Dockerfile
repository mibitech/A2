# Dockerfile para aplicação React (Vite)
FROM node:20-alpine AS build
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar arquivos de dependências (inclui .npmrc para shamefully-hoist)
COPY package.json pnpm-lock.yaml .npmrc ./

# Instalar dependências com pnpm (frozen-lockfile garante versões exatas)
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Copiar arquivo .env para build
COPY .env .env

# Build da aplicação
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
