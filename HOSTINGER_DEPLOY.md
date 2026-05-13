# Hostinger Deployment Guide

This repository is the Laravel + Inertia + React v2 application. Deploy the project root to Hostinger, and point the website document root to the `public` directory.

## Server Requirements

- PHP 8.2 or newer
- Composer
- MySQL or PostgreSQL
- Node.js 18+ if building assets on the server. Hostinger shared SSH may not include `npm`, so this repository tracks `public/build` assets for deployment.
- SSH access is recommended

## First Deploy

```bash
git clone https://github.com/tissetyo/neoscreen.git neoscreen
cd neoscreen

composer install --no-dev --optimize-autoloader

cp .env.example .env
php artisan key:generate
```

Edit `.env` with production values:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

OPENWEATHER_API_KEY=
AVIATIONSTACK_API_KEY=
VITE_GOOGLE_MAPS_EMBED_KEY=
```

Then finish setup:

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

If `php artisan storage:link` fails because PHP `exec` is disabled, create the symlink directly:

```bash
ln -s ../storage/app/public public/storage
```

If `public/storage` already exists, skip that command.

## Hostinger Panel Setup

Set the domain or subdomain document root to:

```text
neoscreen/public
```

Do not point the domain to the repository root. Laravel must serve from `public`.

## Updating Production

Fast path for normal updates:

```bash
scripts/hostinger-smart-deploy.sh
```

The smart deploy script pulls `origin/main`, checks which files changed, and only runs the expensive steps when needed:

- `composer install` only when `composer.json` or `composer.lock` changed.
- `php artisan migrate --force` only when `database/migrations/*` changed.
- `php artisan config:cache` only when `config/*` changed.
- `php artisan route:cache` only when `routes/*` changed.
- `php artisan view:cache` only when `resources/views/*` changed.

For frontend-only updates where `public/build` is already committed, this usually becomes just a fast Git pull.

Full manual deploy path:

```bash
cd neoscreen
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Useful Demo Routes

- Superadmin: `/admin`
- Product portal: `/portal`
- Front office: `/grand-neoscreen/frontoffice`
- Room TV: `/d/grand-neoscreen/101/main`
- STB setup: `/tv/setup`

## Demo Login

Only seed demo users in staging/demo environments.

```text
Superadmin: admin@neoscreen.site / admin123
Frontoffice: fo@grand-neoscreen.com / staff123
Manager: manager@grand-neoscreen.com / manager123
```
