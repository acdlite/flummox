Flummox
=======

Idiomatic, modular, testable, isomorphic Flux. No singletons required.

[![build status](https://img.shields.io/travis/parisleaf/parisleaf.com.svg?style=flat-square)](https://travis-ci.org/acdlite/flummox)
[![Code Climate](https://img.shields.io/codeclimate/github/acdlite/flummox.svg?style=flat-square)](https://codeclimate.com/github/acdlite/flummox)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/github/acdlite/flummox.svg?style=flat-square)](https://codeclimate.com/github/acdlite/flummox)
[![npm](https://img.shields.io/npm/dm/flummox.svg?style=flat-square)](https://www.npmjs.com/package/flummox)

* [API documentation](https://github.com/acdlite/flummox/blob/master/docs/api)
* [Quick start guide](https://github.com/acdlite/flummox/blob/master/docs/quick-start.md)

Here's a WIP demo of an isomorphic app using Flummox, [React Router](https://github.com/rackt/react-router), and [Immutable.js](facebook.github.io/immutable-js) (still needs some work, but feel free to check it out):

https://github.com/acdlite/flummox-isomorphic-demo

```
$ npm install --save flummox
```


The big idea
------------

There are *sooo* many Flux libraries out there. What makes Flummox special?

Flummox allows you to encapsulate your entire Flux set-up — stores, actions, constants, and the dispatcher — into a single class, with **zero singletons or global references**. It's as easy as

```js
let flux = new Flux();
```

There are many benefits to this approach, but the biggest one is that it makes isomorphism (running the same code on the server as well as the client) incredibly straightforward.

**Flummox is not a framework.** The Flummox philosophy is that Flux is a great architecture already, so rather than forcing a bunch of new concepts and complicated APIs upon you, it embraces existing idioms from Flux, React, and ES6 — without being too prescriptive.

**tl;dr Show me the code!!!** No problem. Check out a full example from Flummox's [test suite](https://github.com/acdlite/flummox/blob/master/src/__tests__/exampleFlux-test.js).

### Idiomatic

If you know Flux, you know Flummox. If you're not familiar with Flux, there are [many](http://facebook.github.io/flux/docs/overview.html#content) [great](https://medium.com/brigade-engineering/what-is-the-flux-application-architecture-b57ebca85b9e) resources available to get you up to speed.

The primary goal of Flummox is reduce the boilerplate involved in setting up Flux for your application, so the API has been kept as minimal and predictable as possible. It uses Facebook's dispatcher under the hood. It encourages (but does not require) the use of ES6 classes. The state API for stores mirrors the state API for React components. Everything works as you'd probably expect. And like React, Flummox prints helpful warning messages to keep you on track. For instance, if you call `Store#setState()` from outside a store's action handler, you get this warning:

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

Flummox also gives you the ability to serialize the initial state of your application on the server, send it down to the client as a string, and deserialize it before the initial render. While not required for isomorphism, it helps make the initial page load snappy by reducing unnecessary AJAX requests to the server.

Roadmap
-------

Flummox is still quite new, but most of the core features that I originally set out to implement are completed. My main concern right now is improving the documentation, writing guides, and providing examples.

Since Flummox's core innovation is its approach to isomorphism, I would like to make it especially easy for newcomers to learn how to use Flummox to create isomorphic applications.

Feature requests and PRs are absolutely welcome, as long as they keep with the spirit of a minimal core API. Any additional features (e.g. undo-redo & versioning) are likely to be implemented as mixins.


Recommended libraries
---------------------

Flummox is just Flux. It has no opinion on the rest of your stack. You don't even have to be using React. But in case you're interested, here are some recommended tools and libraries that complement Flummox well:

* [React (of course!)](http://facebook.github.io/react/)
* [Immutable.js](http://facebook.github.io/immutable-js/) — Using immutable data in your applications not only makes your application more performant, but it also simplifies state management in your stores. No more defensive copying! It also helps ensure isolation between stores by reducing the likelihood that you'll accidentally mutate a dispatched payload.
* [React Router](https://github.com/rackt/react-router) — A complete routing solution for React, with excellent support for isomorphic applications.
* [superagent](https://github.com/visionmedia/superagent) — An isomorphic AJAX library. Use it for all your data fetching.
* [6to5](http://6to5.org/) — Use next-generation JavaScript (ES6, and even some ES7) today. Once you've tried it, you'll see that it's the only way to write JavaScript. 6to5 also very conveniently supports JSX compilation.


Inspiration and thanks
----------------------

* Facebook, obviously.
* Pete Hunt's talk at React.js Conf 2015 ["Full Stack Flux"](https://www.youtube.com/watch?v=KtmjkCuV-EU). The idea of stores as essentially "a reduce() + a change event" was illuminating.
* [alt](https://github.com/goatslacker/alt), a similar Flux library from which I shamelessly copied (ideas, not code)

License
-------

MIT

Andrew Clark [@acdlite](https://twitter.com/acdlite)
