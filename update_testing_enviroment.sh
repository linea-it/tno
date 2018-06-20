#!/bin/sh

YELLOW='\033[00;33m'
GREEN='\033[1;92m'
NO_COLOR='\033[0m'
CURRENT_BRANCH=`git rev-parse --abbrev-ref HEAD`

echo "${YELLOW}======= Updating Code from branch ${GREEN}${CURRENT_BRANCH}${YELLOW} =======${NO_COLOR}"
git pull

echo "${YELLOW}======= Containers running =======${NO_COLOR}"
docker-compose ps

echo "${YELLOW}======= Stopping all containers =======${NO_COLOR}"
docker-compose stop

echo "${YELLOW}======= Building containers =======${NO_COLOR}"
docker-compose build

echo "${YELLOW}======= Starting all containers =======${NO_COLOR}"
docker-compose up -d

echo "${YELLOW}======= Containers running =======${NO_COLOR}"
docker-compose ps

echo "${GREEN}======= Update completed =======${NO_COLOR}"