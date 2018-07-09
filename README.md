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

Deployment
--------------

You can use `docker-compose` to run the entire Derby site. To do this,
simply run `docker-compose up` from the `./deploy` directory. To change the
underlying versions of `derby-site` or `derby-examples`, you can either set
your environment variables or update the `.env` file in the same directory.

For example, to update the `derby-site` to `2018-07-08`, you could run the
following command:

```shell
$ DERBY_SITE_TAG=2018-07-08 docker-compose up
deploy_derby_examples_1 is up-to-date
Recreating deploy_derby_site_1 ...
deploy_traefik_1 is up-to-date
deploy_redis_1 is up-to-date
deploy_mongo_1 is up-to-date
Recreating deploy_derby_site_1 ... done
```

Alternatively, you can edit the value of `DERBY_SITE_TAG` in the `.env` file,
then run `docker-compose up -d`.
