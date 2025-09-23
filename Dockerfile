# ===== Stage 1: Backend + Frontend build =====
FROM php:8.3-fpm-alpine AS build
WORKDIR /app

# Install deps untuk PHP + Node
RUN apk add --no-cache \
    bash curl git unzip \
    libzip-dev icu-dev oniguruma-dev \
    freetype-dev libjpeg-turbo-dev libpng-dev libwebp-dev \
    nodejs npm \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install pdo pdo_mysql mbstring zip intl gd

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

# === Composer caching step ===
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy semua source (baru sekarang artisan ikut ke-copy)
COPY . .

# Jalankan ulang composer supaya artisan available
RUN composer install --no-dev --optimize-autoloader

# Install frontend deps dan build
COPY package.json package-lock.json ./
RUN npm install
RUN npm run build

# ===== Stage 2: Production runtime =====
FROM nginx:stable-alpine
WORKDIR /var/www

# Copy hasil dari build stage
COPY --from=build /app /var/www

# Hapus default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Tambah config custom
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
