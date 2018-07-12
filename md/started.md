## Getting Started

<p class="lead">
In order to get started writing your first DerbyJS app, you need to have Node.js and MongoDB installed. DerbyJS is written to support any database, but the MongoDB adapter is the most complete. If you don't have those, <a href="#environment">get setup!</a>
</p>

---

## Run Examples

There are several examples in the [derby-examples](https://github.com/derbyjs/derby-examples) repository.
You can clone the repo and install:
```bash
git clone https://github.com/derbyjs/derby-examples.git
cd ~/derby-examples
npm install
```

You can run each of the examples from their own directories:

```bash
cd ~/derby-examples/directory
node server.js
```

The examples written in CoffeeScript are meant to be run via the coffee command:

```bash
npm install -g coffeescript
cd ~/derby-examples/sink
coffee server.coffee
```

<!--
## Boilerplate

If you want to start from a blank slate, [generator-derby](https://github.com/derbyparty/generator-derby) is a handy tool for creating a DerbyJS boilerplate.

```bash
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
-->

---

## Reference

Be sure to check out the [Docs](docs) to get a deeper understanding of how DerbyJS makes developing apps easier!
See more links in the [Resources](resources) section.

---

## Environment

For Derby you need:
* [Node.js](https://nodejs.org)
* [MongoDB](https://www.mongodb.org/)
* [Redis](https://redis.io/) is optional. It can be used to scale pub/sub beyond one server process
