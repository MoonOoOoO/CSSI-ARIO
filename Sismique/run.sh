#!/bin/bash

echo "setup appsettings.json"

test -d "/ARIO-app/wwwroot/images/archives"
if [[ $? == 1 ]]; then
  mkdir -p /ARIO-app/wwwroot/images/archives/
fi

test -d "/ARIO-app/wwwroot/images/bridges"
if [[ $? == 1 ]]; then
  mkdir -p /ARIO-app/wwwroot/images/bridges/
fi

cd /ARIO-app/
sed -i "s|<DB_SERVER_URL>|$DB_SERVER_URL|g" appsettings.json
sed -i "s|<CLF_SERVER_URL>|$CLF_SERVER_URL|g" appsettings.json
sleep 10
dotnet ARIO.dll
