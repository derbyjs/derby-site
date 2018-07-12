derby-site
=============
The [derbyjs.com](//derbyjs.com/) site, built with Derby.

Installation
------------

Clone this repository and install the dependencies:

```
npm install
```

Development
-----------

To run the site locally:

```
npm start
```

To run the entire stack locally, you can use `docker-compose`. To do this,
simply run `docker-compose up` from the `./deploy` directory. To change the
underlying versions of `derby-site` or `derby-examples`, simply adjust the tags
for the `image`.

Production
----------

The Derby site can operate using the Docker Compose or, more ideally, Docker
Swarm. The use Swarm, you must first initialize a swarm cluster. To do this,
simply run `docker swarm init`. If you are prompted to include the
`--advertise-addr` parameter, make sure this matches the instances **local** IP
address, **not** the public address. Once you have done this, you can run the
following command to create the stack from the `./deploy` directory:

```shell
docker stack deploy --compose-file docker-compose.yaml derbyjs
```

This will create all necessary resources. If you are making changes to the
configuration or want to update to a new version, you can simply edit the
`docker-compose.yaml` file and run the command listed above again. This will
initiate a rolling update.

Note that the only container utilizing rolling updates is the `derby-site`
container.
