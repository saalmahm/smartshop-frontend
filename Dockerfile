# Étape 1 : Build de l'application
FROM node:20-alpine AS build

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code et build
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx pour la production
FROM nginx:stable-alpine

# Copie de la config Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers buildés depuis l'étape 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]