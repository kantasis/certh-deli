#!/bin/bash


# Copy the init script to the container
docker cp init.sql deli_db_container:/
# Copy the data
docker cp ../../shared/Fused_european_only_new.csv deli_db_container:/tmp/dataset.csv
# Copy the loading script
docker cp import.sql deli_db_container:/

# Run the init script
docker exec -it \
   deli_db_container \
   psql \
      -h localhost \
      -U postgres \
      -f init.sql

# Run the import script
docker exec -it \
   deli_db_container \
   psql \
      -h localhost \
      -U postgres \
      -d deli_db \
      -f import.sql

