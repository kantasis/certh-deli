#!/bin/bash

. ../.env

# Params:
POSTGRESCRIPTS_RPATH="../services/postgres"

# Copy the init script to the container
docker cp "${POSTGRESCRIPTS_RPATH}/init.sql" "${PROJECT_NAME}_db_container":/

# Run the init script
docker exec -it \
   "${PROJECT_NAME}_db_container" \
   psql \
      -h localhost \
      -U "${GLOBAL_POSTGRES_USER}" \
      -d "${GLOBAL_POSTGRES_DB}" \
      -f init.sql
