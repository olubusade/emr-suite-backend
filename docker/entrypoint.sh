#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -e

echo "[entrypoint] ENV=$ENV NODE_ENV=$NODE_ENV"


 # DATABASE READINESS CHECK
 # Ensures the Express server doesn't crash by attempting to connect 
 # to a Postgres instance that is still initializing.
 
if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "localhost" ]; then
  echo "[entrypoint] Waiting for database at $DB_HOST:${DB_PORT:-5432}..."
  i=0
  # We use pg_isready (installed via postgresql-client in the Dockerfile)
  until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" >/dev/null 2>&1; do
    i=$((i+1))
    if [ $i -ge 30 ]; then
      echo "[entrypoint] Timeout waiting for Postgres at $DB_HOST"
      exit 1
    fi
    echo "[entrypoint] Database not ready, retrying ($i/30)..."
    sleep 2
  done
  echo "[entrypoint] Database is reachable!"
fi


 # DATABASE SCHEMA MANAGEMENT
 # Automatically syncs the database schema and populates essential data 
 # (like clinical roles or admin accounts) before the server starts.
 
echo "[entrypoint] Running migrations..."
npm run migrate || echo "[entrypoint] migrate failed or no migrations"

echo "[entrypoint] Running seeders..."
npm run seed || echo "[entrypoint] seed failed or no seeders"


 # APPLICATION STARTUP
 # We use 'exec' so that the Node.js process inherits PID 1.
 # This allows the container to handle OS signals (like SIGTERM) correctly.
 
echo "[entrypoint] Starting server..."
exec npm run start