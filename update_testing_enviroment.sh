#!/bin/sh

YELLOW='\033[00;33m'
GREEN='\033[1;92m'
NO_COLOR='\033[0m'
CURRENT_BRANCH=`git rev-parse --abbrev-ref HEAD`

echo -e "${YELLOW}======= Updating Code from branch ${GREEN}${CURRENT_BRANCH}${YELLOW} =======${NO_COLOR}"
git pull

echo -e "${YELLOW}======= Containers running =======${NO_COLOR}"
docker-compose ps

echo -e "${YELLOW}======= Stopping all containers =======${NO_COLOR}"
docker-compose stop

echo -e "${YELLOW}======= Building containers =======${NO_COLOR}"
docker-compose build

echo -e "${YELLOW}======= Update Images =======${NO_COLOR}"
docker-compose pull nima

echo -e "${YELLOW}======= Starting all containers =======${NO_COLOR}"
docker-compose up -d

echo -e "${YELLOW}======= Containers running =======${NO_COLOR}"
docker-compose ps

echo -e "${GREEN}======= Update completed =======${NO_COLOR}"