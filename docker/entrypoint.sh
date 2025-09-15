#!/bin/sh
set -e

echo "[entrypoint] ENV=$ENV NODE_ENV=$NODE_ENV"

# If DB_HOST is remote/container, wait for it to become ready
if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "localhost" ]; then
  echo "[entrypoint] Waiting for database at $DB_HOST:$DB_PORT..."
  i=0
  until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" >/dev/null 2>&1; do
    i=$((i+1))
    if [ $i -ge 30 ]; then
      echo "[entrypoint] Timeout waiting for Postgres at $DB_HOST"
      exit 1
    fi
    sleep 2
  done
fi

echo "[entrypoint] Running migrations..."
npm run migrate || echo "[entrypoint] migrate failed or no migrations"

echo "[entrypoint] Running seeders..."
npm run seed || echo "[entrypoint] seed failed or no seeders"

echo "[entrypoint] Starting server..."
# exec so process gets PID 1
exec npm run start
