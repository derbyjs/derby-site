# BUILD-USING: docker build -t derbyjs/derby-site .
# RUN-USING: docker run -p 80:80 --name derby-site --rm derbyjs/derby-site

# specify base docker image
FROM dockerfile/nodejs

# copy over dependencies
WORKDIR /var
RUN mkdir derby-site

ADD package.json /var/derby-site/
ADD server.js /var/derby-site/
ADD config /var/derby-site/config
ADD public /var/derby-site/public
ADD src /var/derby-site/src
ADD styles /var/derby-site/styles
ADD views /var/derby-site/views
ADD md /var/derby-site/md
ADD components /var/derby-site/components
ADD server /var/derby-site/server

# npm install all the things
WORKDIR /var/derby-site
RUN npm install

# expose any ports we need
EXPOSE 80
ENV PORT 80
# the command that gets run inside the docker container
CMD ["/usr/local/bin/node", "/var/derby-site/server.js"]
