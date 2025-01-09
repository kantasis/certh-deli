#!/bin/bash

. ../.env

# Params:
POSTGRESCRIPTS_RPATH="../services/postgres"
POLICIES_RFILE="../shared/Fused_european_only_new.csv"

echo "---- GK> Copying the sql script"
docker cp "${POSTGRESCRIPTS_RPATH}/import_fused.sql" "${PROJECT_NAME}_db_container:/"

echo "---- GK> Copying the csv"
docker cp "${POLICIES_RFILE}" ${PROJECT_NAME}_db_container:/tmp/fused.csv

echo "---- GK> Copying the csv"
docker exec -it \
   deli_db_container \
   psql \
      -h localhost \
      -U postgres \
      -d deli_db \
      -f import_fused.sql

