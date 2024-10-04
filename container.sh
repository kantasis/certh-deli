#!/bin/bash

. .env
# . .private/mongo.env

# if [[ ! -z $1 ]]; then 
if [[ -z $1 ]]; then
   echo "Specify container"
fi

CONTAINER_NAME="${1}"
SHELL_NAME="${2:-bash}"

docker exec -ti \
   "${PROJECT_NAME}_${CONTAINER_NAME}_container" \
   "${SHELL_NAME}"



