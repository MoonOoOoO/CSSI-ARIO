FROM ubuntu:16.04 AS base
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y curl libgdiplus libc6-dev\
    && curl -s https://deb.nodesource.com/setup_12.x | bash - \
    && curl https://packages.microsoft.com/config/ubuntu/16.04/packages-microsoft-prod.deb -o packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && apt-get update && apt-get install -y nodejs dotnet-sdk-2.0.3 \
    && rm packages-microsoft-prod.deb \ 
    && apt-get clean && apt-get autoremove --purge

FROM base AS builder
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
COPY . /ARIO
WORKDIR /ARIO
RUN npm install && npm audit fix\
    && dotnet publish -c Release -r ubuntu.16.04-x64 

FROM ubuntu:16.04 AS runtime
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y curl libgdiplus libc6-dev\
    && curl -s https://deb.nodesource.com/setup_12.x | bash - \
    && curl https://packages.microsoft.com/config/ubuntu/16.04/packages-microsoft-prod.deb -o packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && apt-get update && apt-get install -y nodejs dotnet-runtime-2.0.3 \
    && rm packages-microsoft-prod.deb \ 
    && apt-get clean && apt-get autoremove --purge

FROM runtime as app
ENV DB_SERVER_URL=${DB_SERVER_URL}
ENV CLF_SERVER_URL=${CLF_SERVER_URL}
COPY --from=builder /ARIO/bin/Release/netcoreapp2.0/ubuntu.16.04-x64/publish /ARIO-app
# COPY wwwroot/images /ARIO-app/wwwroot/images
COPY run.sh /usr/local/bin
RUN chmod +x /usr/local/bin/run.sh
EXPOSE 5000
ENTRYPOINT ["run.sh"]

FROM app as final

# docker run -it --rm -p 80:5000 -e DB_SERVER_URL=10.210.210.50 -e CLF_SERVER_URL=http://10.210.210.54:16000/predict ario:build