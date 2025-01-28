#!/bin/bash

. ../.env

# Params:

POSTGRESCRIPTS_RPATH="../services/postgres"
POLICIES_RFILE="../shared/input/policy_data.csv"

# Main

echo "---- GK> Copying the sql script"
docker cp "${POSTGRESCRIPTS_RPATH}/import_policies.sql" "${PROJECT_NAME}_db_container:/"

echo "---- GK> Copying the csv"
docker cp "${POLICIES_RFILE}" ${PROJECT_NAME}_db_container:/tmp/policies.csv

echo "---- GK> Loading the csv"
docker exec -it \
   ${PROJECT_NAME}_db_container \
   psql \
      -h localhost \
      -U postgres \
      -d deli_db \
      -f import_policies.sql

