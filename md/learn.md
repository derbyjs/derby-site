## Getting Started

In order to get started writing your first DerbyJS app, you need to have node.js, MongoDB and Redis installed. If you don't have those, [get setup!](#environment)


## Examples

https://github.com/derbyjs/derby-examples  
TODO: walk thru installing, running and playing with the examples

## Boilerplate

https://github.com/derbyparty/generator-derby  
TODO: explain this and link to a tutorial that uses it

## Tutorials

For more in-depth tutorials, see the [Tutorials section]().
TODO: call out 
* derby-starter
* chat
* todos

## Referrence

Be sure to check out the [Docs](docs) to get a deeper understanding of how DerbyJS makes developing apps easier!

## Environment

For Derby you need: [Node](http://nodejs.org) (>=0.10), [MongoDB](http://www.mongodb.org/), [Redis](http://redis.io/) (>=2.6).

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
