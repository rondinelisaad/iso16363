#!/bin/sh
set -e

echo "Applying database migrations..."
prisma migrate deploy

echo "Seeding ISO 16363 taxonomy (idempotent)..."
prisma db seed

echo "Starting API server..."
exec node dist/main.js
