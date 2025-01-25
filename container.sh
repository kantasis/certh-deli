#!/bin/bash

. .env
# . .private/mongo.env

# if [[ ! -z $1 ]]; then 
if [[ -z $1 ]]; then
   echo "Specify container"
fi

CONTAINER_NAME="${1}"
SHELL_NAME="${2:-bash}"

if [[ ${CONTAINER_NAME} == 'db' ]]; then
   
   docker exec -it \
      "${PROJECT_NAME}_${CONTAINER_NAME}_container" \
      psql \
         -h localhost \
      -U "${GLOBAL_POSTGRES_USER}" \
      -d "${GLOBAL_POSTGRES_DB}"

   exit 0;
fi

docker exec -ti \
   "${PROJECT_NAME}_${CONTAINER_NAME}_container" \
   "${SHELL_NAME}"



