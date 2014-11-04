## Getting Started

<p class="lead">
In order to get started writing your first DerbyJS app, you need to have node.js, MongoDB and Redis installed. If you don't have those, <a href="#environment">get setup!</a>
</p>

---

## Run Examples

There are several examples in the [derby-examples](https://github.com/derbyjs/derby-examples) repository.
You can clone the repo and install:
```
git clone https://github.com/derbyjs/derby-examples.git
cd ~/derby-examples
npm install
```

You can run each of the examples from their own directories:

```
$ cd ~/derby-examples/directory
$ node server.js
```

The examples written in CoffeeScript are meant to be run via the coffee command:

```
$ npm install -g coffee-script
$ cd ~/derby-examples/sink
$ coffee server.coffee
```

## Boilerplate

If you want to start from a blank slate, [generator-derby](https://github.com/derbyparty/generator-derby) is a handy tool for creating a DerbyJS boilerplate.

```
# install yeoman
npm install -g yo
# install the generator
npm install -g generator-derby

mkdir myapp
cd myapp
# create a javascript based app:
yo derby
# or create a coffeescript based app:
yo derby --coffee
```

---

## Reference

Be sure to check out the [Docs](docs) to get a deeper understanding of how DerbyJS makes developing apps easier!
See more links in the [Resources](resources) section.


## Tutorials

[Introductory tutorials](http://decisionmapper.com/tutorials) take you from getting started to a multi-player game.

[Add authentication](http://www.glkn.ru/blog/2014/10/26/creating-private-todos-app/) to a simple Todo app.

---

## Environment

For Derby you need: [Node](http://nodejs.org) (>=0.10), [MongoDB](http://www.mongodb.org/), [Redis](http://redis.io/) (>=2.6) - it's optional.

### Mac OS

We recommend installing node.js from [the official site](http://nodejs.org)
You can install mongodb and redis using [homebrew](http://brew.sh/)

```bash
brew update
brew install mongodb
brew install redis
```

### Debian

Same for all Debian family: Debian, Ubuntu, Mint, etc.
For Node and Redis we will use the chris-lea repository, Mongo has an official repo.

```bash
# Add the repository
# node.js
sudo add-apt-repository -y ppa:chris-lea/node.js
# redis
sudo add-apt-repository -y ppa:chris-lea/redis-server
# mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
sudo echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/10gen.list

# Update the apt-get
sudo apt-get -y update

# Set
sudo apt-get -y install nodejs
sudo apt-get -y install mongodb-10gen
sudo apt-get -y install redis-server
```


### Windows

We currently recommend developing in a *nix environment.
You can use a free VM like [VirtualBox](https://www.virtualbox.org/) to run a Linux environment or tools like [Vagrant](http://www.vagrantup.com/) or [Docker](http://www.docker.com/).
