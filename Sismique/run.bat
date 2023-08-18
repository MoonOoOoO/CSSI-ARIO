@echo off
:: check docker service status
echo Checking Docker status for you ...
docker ps 1>NUL 2>NUL && (
    echo Docker is running, downloading container images. This might take a while...
) || (
    echo Docker is not running, please start docker first.
    pause
    exit /B %ERRORLEVEL%
)
:: if docker is running, pull the docker images
echo Downloading ARIO applicaiton image.
1>NUL 2>NUL docker pull geddes-registry.rcac.purdue.edu/cssi/ario:demo
if %ERRORLEVEL% EQU 0 echo Done! else (
    echo Failed to download application image.
    pause
    exit
)
echo Downloading ARIO classifier image.
1>NUL 2>NUL docker pull geddes-registry.rcac.purdue.edu/cssi/arioclassifier:latest
if %ERRORLEVEL% EQU 0 echo Done! else (
    echo Failed to download classifier image.
    pause
    exit
)
echo Downloading ARIO database image.
1>NUL 2>NUL docker pull mcr.microsoft.com/mssql/server:2017-latest
if %ERRORLEVEL% EQU 0 echo Done! else (
    echo Failed to download database image.
    pause
    exit
)

set ACA=ACCEPT_EULA=Y
set PWD=SA_PASSWORD=Passw0rd
:: create docker network for ario application
1>NUL 2>NUL docker network create --subnet=172.0.0.0/24 ario_net
echo Download finished, installing ARIO...
1>NUL 2>NUL docker run -d --net ario_net --ip 172.0.0.100 -p 1433:1433 --name ms-sql -e %ACA% -e %PWD% mcr.microsoft.com/mssql/server:2017-latest
if "%ERRORLEVEL%" NEQ "0" (
    echo Failed to create application container
    exit /B %ERRORLEVEL%
) else (
    echo Database service is installed.
    timeout /t 10 /nobreak > nul
)
1>NUL 2>NUL docker run -d --net ario_net --ip 172.0.0.10 -p 16000:16000 --name ario_classifier geddes-registry.rcac.purdue.edu/cssi/arioclassifier:latest
if "%ERRORLEVEL%" NEQ "0" (
    echo Failed to create classifier container
    exit /B %ERRORLEVEL%
) else (
    echo Classification service is installed.
    timeout /t 10 /nobreak > nul
)
1>NUL 2>NUL docker run -d --net ario_net -p 5000:5000 --name ario_application geddes-registry.rcac.purdue.edu/cssi/ario:demo
if "%ERRORLEVEL%" NEQ "0" (
    echo Failed to create database container
    exit /B %ERRORLEVEL%
) else (
    echo Application is installed.
)

:x
curl http://localhost:5000 1>NUL 2>NUL  && (
    echo ARIO can be accessed offline use at http://localhost:5000
) || (
    goto x
)