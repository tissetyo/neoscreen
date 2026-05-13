#!/usr/bin/env bash

set -euo pipefail

REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-main}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$REPO_ROOT"

echo "==> Smart deploy: ${REMOTE}/${BRANCH}"

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Tracked production files have local changes. Commit or restore them before deploying."
    exit 1
fi

before="$(git rev-parse HEAD)"

git fetch "$REMOTE" "$BRANCH"
after="$(git rev-parse "${REMOTE}/${BRANCH}")"

if [[ "$before" == "$after" ]]; then
    echo "Already up to date: ${after}"
    exit 0
fi

changed_files="$(git diff --name-only "$before" "$after")"

git merge --ff-only "${REMOTE}/${BRANCH}"

needs_composer=false
needs_migrate=false
needs_config_cache=false
needs_route_cache=false
needs_view_cache=false

while IFS= read -r file; do
    [[ -z "$file" ]] && continue

    case "$file" in
        composer.json|composer.lock)
            needs_composer=true
            ;;
        database/migrations/*)
            needs_migrate=true
            ;;
        config/*)
            needs_config_cache=true
            ;;
        routes/*)
            needs_route_cache=true
            ;;
        resources/views/*)
            needs_view_cache=true
            ;;
    esac
done <<< "$changed_files"

if [[ "$needs_composer" == true ]]; then
    echo "==> Composer dependencies changed"
    composer install --no-dev --optimize-autoloader
else
    echo "==> Composer skipped"
fi

if [[ "$needs_migrate" == true ]]; then
    echo "==> Database migrations changed"
    php artisan migrate --force
else
    echo "==> Migrations skipped"
fi

if [[ "$needs_config_cache" == true ]]; then
    echo "==> Refreshing config cache"
    php artisan config:cache
else
    echo "==> Config cache skipped"
fi

if [[ "$needs_route_cache" == true ]]; then
    echo "==> Refreshing route cache"
    php artisan route:cache
else
    echo "==> Route cache skipped"
fi

if [[ "$needs_view_cache" == true ]]; then
    echo "==> Refreshing view cache"
    php artisan view:cache
else
    echo "==> View cache skipped"
fi

echo "==> Deployed ${before} -> ${after}"
