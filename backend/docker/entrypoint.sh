#!/bin/sh
set -e

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ "${WAIT_FOR_DB:-true}" = "true" ]; then
    php -r '
        if (getenv("DB_CONNECTION") !== "pgsql") {
            exit(0);
        }

        $host = getenv("DB_HOST") ?: "postgres";
        $port = getenv("DB_PORT") ?: "5432";
        $database = getenv("DB_DATABASE") ?: "saborexpress";
        $username = getenv("DB_USERNAME") ?: "saborexpress";
        $password = getenv("DB_PASSWORD") ?: "saborexpress";
        $dsn = "pgsql:host={$host};port={$port};dbname={$database}";

        for ($attempt = 1; $attempt <= 60; $attempt++) {
            try {
                new PDO($dsn, $username, $password);
                exit(0);
            } catch (Throwable $exception) {
                fwrite(STDOUT, "Waiting for PostgreSQL ({$attempt}/60)...\n");
                sleep(1);
            }
        }

        fwrite(STDERR, "PostgreSQL did not become available in time.\n");
        exit(1);
    '
fi

php artisan config:clear

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-true}" = "true" ]; then
    php artisan db:seed --force
fi

exec "$@"
