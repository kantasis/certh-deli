#!/bin/bash

# . .env
docker compose stop

# I know the container should be responsible for the compilation
# But this completes it much faster
if [ -d "./app-spring" ]; then
   echo "--- GK> Compiling spring application"
   pushd ./app-spring
   ./mvnw clean package
   popd
fi

docker compose up \
   --build \
   -d 

   # --remove-orphans \