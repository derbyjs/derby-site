# BUILD-USING: docker build -t derbyjs/derby-site .
# RUN-USING: docker run -p 4000:4000 --name derby-site --rm derbyjs/derby-site

# specify base docker image
FROM node:10

# copy over dependencies
WORKDIR /var
RUN mkdir derby-site

ADD package.json /var/derby-site/
ADD server.js /var/derby-site/

ADD md /var/derby-site/md
ADD public /var/derby-site/public
ADD src /var/derby-site/src
ADD styles /var/derby-site/styles
ADD views /var/derby-site/views

# npm install all the things
WORKDIR /var/derby-site
RUN npm_config_spin=false npm_config_loglevel=warn npm install --production

# expose any ports we need
EXPOSE 4000
ENV PORT 4000
# the command that gets run inside the docker container
CMD ["/usr/local/bin/node", "/var/derby-site/server.js"]
