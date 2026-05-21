FROM php:8.3-apache

# Instalar dependências do sistema e extensões do PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    git \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Ativar o mod_rewrite do Apache (essencial para as rotas do Laravel)
RUN a2enmod rewrite

# Apontar o DocumentRoot do Apache diretamente para a pasta public do Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Copiar os arquivos do backend para o container
WORKDIR /var/www/html
COPY . /var/www/html

# Instalar o Composer e as dependências do Laravel
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# Configurar as permissões necessárias para o storage do Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80
