# Stage 1: Build the frontend assets
FROM node:20-alpine AS build

WORKDIR /usr/src/app

ARG VITE_API_URL
ARG VITE_PHOTO_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PHOTO_URL=${VITE_PHOTO_URL}

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx and PHP-FPM
FROM php:8.2-fpm-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    nginx \
    libpq-dev \
    mysql-client \
    git \
    supervisor \
    openssh-client \
    autoconf \
    g++

RUN docker-php-ext-install pdo pdo_mysql

# Set working directory
WORKDIR /var/www/html

# Copy the application files
COPY . .

# Copy built assets from the previous stage
COPY --from=build /usr/src/app/dist /var/www/html/public/build

# Copy Nginx and Supervisor configurations
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisor.conf /etc/supervisor/conf.d/supervisor.conf

# Expose port 80
EXPOSE 80

# Start Supervisor to run Nginx and PHP-FPM
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisor.conf"]