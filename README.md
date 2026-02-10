ARIO - Automated Reconnaissance Image Organizer
===============================================

Deploy
------

### Database

[Install SQL Server and create a database on Ubuntu](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-ubuntu)

### Classification server

[Install TensorFlow on Ubuntu](https://www.tensorflow.org/install/install_linux)

Install packages
```bash
$ sudo apt install libopencv-dev python3-opencv
$ pip3 install opencv-python h5py Flask tqdm pandas sklearn
```

Clone the project
```bash
$ git clone http://hpcg.purdue.edu/git/civil.git
```

Install the classifier `SimpleClassifier/model_weights.h5`

Run the server
```bash
$ python3 classifier.py
```

### Web server

[Install Node.js on Ubuntu](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

[Install .NET Core SDK 2.0.3 on Ubuntu](https://www.microsoft.com/net/download/linux-package-manager/ubuntu16-04/sdk-2.0.3)

Install libgdiplus
```bash
$ sudo apt install libgdiplus
```

Clone the project
```bash
$ git clone http://hpcg.purdue.edu/git/civil.git
```

Change the connection string in `appsettings.json`
```
Server=xxx.xxx.xxx.xxx;Database=Sismique;User Id=SA;Password=Passw0rd;
```

Change the address of the classification server in `ReportController.cs`

[Publish the application on Ubuntu](https://docs.microsoft.com/en-us/dotnet/core/deploying/deploy-with-cli#simpleSelf)

```bash
$ npm install
$ dotnet publish -c Release -r ubuntu.16.04-x64
$ cd bin/Release/netcoreapp2.0/ubuntu.16.04-x64/publish
$ dotnet Sismique.dll
```

[[OPTIONAL] Change the .NET Core RID](https://docs.microsoft.com/en-us/dotnet/core/rid-catalog)

[Host the application on Ubuntu](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx)

[Add a basic authentication](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication)

Development configuration for nginx: /etc/nginx/sites-available/sismique
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    auth_basic           "ARIO";
    auth_basic_user_file /home/mgaillard/civil/.htpasswd;

    client_max_body_size 16M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $http_host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activate the new website
$ cd /etc/nginx/sites-enabled
$ sudo unlink default
$ sudo ln -s /etc/nginx/sites-available/sismique .
# Check syntax
$ sudo nginx -t
# Reload
$ sudo nginx -s reload
```

Upgrade to a newer version
```bash
$ git clean -dfx
$ git stash
$ git pull
$ git stash pop
$ dotnet publish -c Release -r ubuntu.16.04-x64
```

### NSF Award Link
https://www.nsf.gov/awardsearch/show-award?AWD_ID=1835473

Please cite the following publication when use this work
```
@inproceedings{Dyke2021ARIO,
  author    = {Dyke, Shirley J. and Liu, X. and Choi, J. and Yeum, C. M. and Park, J. and Midwinter, M. and Hacker, T.
               and Chu, Z. and Ramirez, J. and Poston, R. and Gaillard, M. and Benes, B. and Lenjani, A. and Zhang, X.},
  title     = {Learning from Earthquakes Using the Automatic Reconnaissance Image Organizer (ARIO)},
  booktitle = {Proceedings of the 17th World Conference on Earthquake Engineering},
  year      = {2021},
  month     = sep,
  url       = {https://par.nsf.gov/servlets/purl/10308795}
}
```

Dyke, S. J., Liu, X., Choi, J., Yeum, C. M., Park, J., Midwinter, M., Hacker, T., Chu, Z., Ramirez, J.,
Poston, R., Gaillard, M., Benes, B., Lenjani, A., & Zhang, X. (2021, September). Learning from
Earthquakes Using the Automatic Reconnaissance Image Organizer (ARIO). In Proceeding of the 17th
World Conference on Earthquake Engineering. https://par.nsf.gov/servlets/purl/10308795

