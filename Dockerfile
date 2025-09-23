# ===== Stage 1: Build Frontend =====
FROM node:20-alpine AS frontend-build
WORKDIR /app

# copy package.json untuk frontend
COPY package*.json vite.config.ts ./
COPY resources ./resources
COPY components.json ./components.json

RUN npm install
RUN npm run build

# ===== Stage 2: Backend =====
FROM php:8.3-fpm-alpine AS backend
WORKDIR /var/www

# Install dep PHP
RUN apk add --no-cache bash curl git unzip \
    libzip-dev icu-dev oniguruma-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip intl

# Copy composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy backend files
COPY . .

# Install dep Laravel
RUN composer install --no-dev --optimize-autoloader
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Copy hasil build frontend ke Laravel public
COPY --from=frontend-build /app/dist /var/www/public

# ===== Stage 3: Nginx + PHP =====
FROM nginx:stable-alpine
WORKDIR /var/www

# Copy backend
COPY --from=backend /var/www /var/www

# Hapus default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Tambah config custom
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
