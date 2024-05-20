derby-site
=============
The [derbyjs.com](//derbyjs.com/) site, built with Derby.

Installation
------------

Clone this repository and install the dependencies:

```shell
npm install
```

Development
-----------

To run the site locally:

```shell
npm start
```

To run the entire stack locally, you can use `docker-compose`. To do this,
simply run:

```shell
npm run compose-up
```

Similarly, `npm run compose-stop` will stop all containers and
`npm run compose-down` will stop and remove all containers and networks created.

You can also use Docker Compose directly by running the following command:

```shell
SWARM_MODE=false docker-compose -f ./deploy/docker-compose.yaml up
```

To change the underlying versions of `derby-site` or `derby-examples`, simply
adjust the tags for the `image`.

Production
----------

The Derby site can operate using the Docker Compose or, more ideally, Docker
Swarm. The use Swarm, you must first initialize a swarm cluster. To do this,
simply run `docker swarm init`. If you are prompted to include the
`--advertise-addr` parameter, make sure this matches the instances **local** IP
address, **not** the public address. Once you have done this, you can run the
following command to create the stack from the `./deploy` directory:

```shell
npm run deploy
```

Alternatively, you can run this directly using the Docker CLI with the following
command:

```shell
SWARM_MODE=true docker stack deploy --compose-file docker-compose.yaml derbyjs
```

This will create all necessary resources. If you are making changes to the
configuration or want to update to a new version, you can simply edit the
`docker-compose.yaml` file and run the command listed above again. This will
initiate a rolling update.

Note that the only container utilizing [rolling updates](https://docs.docker.com/engine/swarm/swarm-tutorial/rolling-update/) is the `derby-site`
container.


Build and Deploy
----------------

To build the DerbyJS Site, clone this repo locally as described above.

Build a docker image with a tag containing today's date, push to Docker Hub, and cleanup the local copy of the image:
```
docker build --platform linux/amd64 . --tag "derbyjs/derby-site:$(date +%Y-%m-%d)"
docker push "derbyjs/derby-site:$(date +%Y-%m-%d)"
docker rmi "derbyjs/derby-site:$(date +%Y-%m-%d)"
```


Next, update the deployed tag specified in [/deploy/docker.compose.yaml](https://github.com/derbyjs/derby-site/blob/master/deploy/docker-compose.yaml). The tag is defined in `services: derbysite: image: derbyjs/derby-site:YYYY-MM-DD`, and it should be updated to the current date. Commit and push your changes to GitHub.

Finally, SSH to the derby-site server:
```
ssh derbyjs-01.droplet.derbyjs.com
```
and run the command to update:
```
cd ~/derby-site/deploy/ && git pull && npm run deploy
```
