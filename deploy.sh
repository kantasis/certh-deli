#!/bin/bash

docker-compose stop

# pushd springboot-service
# ./mvnw clean package || exit
# popd

docker-compose up --build -d