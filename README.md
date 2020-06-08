# In Court Presentation API


### Run locally
Setup dependencies using Docker Compose:
```
$ az login
$ az acr login --name hmctspublic && az acr login --name hmctsprivate
$ docker-compose -f docker-compose-dependencies.yml pull
$ docker-compose -f docker-compose-dependencies.yml up
```

Once the Docker containers have started, open another terminal and start the Node js server:
```
$ npm start
```
