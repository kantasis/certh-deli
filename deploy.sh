#!/bin/bash

set -euo pipefail

MODE=${1:-dev}  # default to dev if nothing is passed

# Compose files
if [ "$MODE" == "prod" ]; then
    COMPOSE_FILES="-f docker-compose.yaml -f docker-compose.prod.yml"
else
    COMPOSE_FILES="-f docker-compose.yaml"
fi

echo "--- GK> Stopping containers if needed"
docker compose $COMPOSE_FILES stop || true

# Compile Spring application if it exists
if [ -d "./app-spring" ]; then
    echo "--- GK> Compiling Spring application"
    pushd ./app-spring
    ./mvnw clean package
    popd
fi

echo "--- GK> Building images"
docker compose $COMPOSE_FILES build --no-cache

echo "--- GK> Bringing up containers without recreating existing ones"
docker compose $COMPOSE_FILES up -d 

echo "--- GK> Deployment finished"
