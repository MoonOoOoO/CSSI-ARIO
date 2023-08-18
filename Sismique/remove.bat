@echo off
docker stop ario_application
docker stop ario_classifier
docker stop ms-sql
docker rm ario_application
docker rm ario_classifier
docker rm ms-sql