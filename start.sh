#!/bin/sh
set -e

host="$DB_HOST"
port="$DB_PORT"

echo "Waiting for Postgres at $host:$port..."

until nc -z $host $port; do
  sleep 1
done

echo "Postgres is up - starting NestJS"
exec "$@"
