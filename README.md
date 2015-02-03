[![build status](https://img.shields.io/travis/parisleaf/parisleaf.com.svg?style=flat-square)](https://travis-ci.org/acdlite/flummox)

Flummox
=======

**API docs are coming soon.**

```
$ npm install --save flummox
```

Idiomatic, modular, testable, isomorphic Flux.

The big idea
------------

There are *sooo* many Flux libraries out there. What makes Flummox special?

Flummox allows you to encapsulate your entire Flux set-up — stores, actions, constants, and the dispatcher — into a single class, with **zero singletons or global references**. It's as easy as

```js
let flux = new Flux();
```

**tl;dr Show me the code!!!** No problem. Check out a full example from Flummox's [test suite](https://github.com/acdlite/flummox/blob/master/src/__tests__/exampleFlux-test.js).

### Idiomatic

If you know Flux, you know Flummox. If you're not familiar with Flux, there are [many](http://facebook.github.io/flux/docs/overview.html#content) [great](https://medium.com/brigade-engineering/what-is-the-flux-application-architecture-b57ebca85b9e) resources available to get you up to speed.

The primary goal of Flummox is reduce the boilerplate involved in setting up Flux for your application, so the API has been kept as minimal and predictable as possible. It uses Facebook's dispatcher under the hood. It encourages (but does not require) the use of ES6 classes. The state API for stores mirrors the state API for React components. Everything works as you'd probably expect. And like React, Flummox prints a helpful warning messages to keep you on track. For instance, if you call `Store#setState()` from outside a store's action handler, you this warning:

```
Store#setState() called from outside an action handler. This is likely a mistake. Flux stores should manage their own state.
```

### Modular

There are three classes in Flummox: Store, Actions, and Flux. They are completely independent from each other. For example, you can create a new Store without ever touching Flux or Actions. You can extend them, modify them, add mixins — if it's possible with JavaScript, you can do it.

Examples in this document use ES6 class notation, but that's a pattern, not a requirement: underneath the hood, it's just JavaScript prototypical inheritance. It's compatible with CoffeeScript, TypeScript, and regular ES5 right out of the box.

### Testable

Because Flummox does not rely on singletons, and each of the different classes can be instantiated independently from the others, it's really easy to write tests. A good example can be found in Flummox's own [test suite](https://github.com/acdlite/flummox/blob/master/src/__tests__/Store-test.js).

### Isomorphic

This is a big one, and one of the biggest motivating factors for creating this library. Isomorphism is tricky or impossible in many other Flux libraries because they rely on singleton objects, spread out across multiple modules. Often they force you to use a separate API.

Again, because Flummox does not rely on singletons, you get isomorphism for free: just create a new Flux instance on each request! Here's a very basic example how that might look using Express and React:

```js

// shared/Flux.js
class Flux extends Flummox { ... }

// server/app.js
app.get("/", function(req, res) {
  let flux = new Flux();

  res.send(
    React.renderToString(<App flux={flux} />)
  );
});
```

Roadmap
-------

The biggest feature that's currently not implemented the ability to "dehydrate" the entire state into string on the server, then "rehydrate" it on the client. This will be straightforward to implement; I just haven't gotten to it yet.

Number one priority right now is writing the API docs.

Inspiration and thanks
----------------------

* Facebook, obviously.
* [alt](https://github.com/goatslacker/alt), a similar Flux library from which I shamelessly copied (ideas, not code)

License
-------

MIT

Andrew Clark [@acdlite](https://twitter.com/acdlite)
