Flummox
=======

[![build status](https://img.shields.io/travis/acdlite/flummox.svg?style=flat-square)](https://travis-ci.org/acdlite/flummox)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/github/acdlite/flummox.svg?style=flat-square)](https://codeclimate.com/github/acdlite/flummox)
[![npm downloads](https://img.shields.io/npm/dm/flummox.svg?style=flat-square)](https://www.npmjs.com/package/flummox)
[![npm version](https://img.shields.io/npm/v/flummox.svg?style=flat-square)](https://www.npmjs.com/package/flummox)

Idiomatic, modular, testable, isomorphic Flux. No singletons required.

```
$ npm install --save flummox
```

Join the **#flummox** channel of the [Reactiflux](http://reactiflux.com/) Slack community.

[![Join the chat at https://gitter.im/acdlite/flummox](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/acdlite/flummox?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

* [API documentation](flummox/docs/api.md)
* [Quick start guide](flummox/docs/guides/quick-start.md)
* [React integration guide](flummox/docs/guides/react-integration.md)

Features
--------

- No singletons = isomorphism for free!
- Robust yet minimal API inspired by React and ES6
- Tiny. **~3.8kb (compressed and gzipped)**.
- The dispatcher and constants are implementation details — no need to interact with them unless you want to.
- Async actions [made simple with promises](flummox/docs/api/actions#asynchronous-actions). Pairs well with async-await, or your favorite promise library.
- Easy [integration with React](flummox/docs/guides/react-integration) via fluxMixin and FluxComponent.
- Support for [plain JavaScript class components](http://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html) in React 0.13.
- Serialization/deserialization of stores, for faster page loads.
- Centralized [debugging](flummox/docs/api/flux).
- "It's Just JavaScript" — supports CoffeeScript, TypeScript, and any other compile-to-JS language.

**Version 3.0 with official support for React 0.13 has been released! See the [changelog](https://github.com/acdlite/flummox/blob/master/CHANGELOG.md) and [upgrade guide](https://github.com/acdlite/flummox/blob/master/UPGRADE_GUIDE.md) for more information.**

**Pssst...** Want to see an example of an isomorphic Flummox app? You're looking at one right now! [Check out the source](https://github.com/acdlite/flummox/tree/master/docs) to see how it's made.

The big idea
------------

There are *sooo* many Flux libraries out there. What makes Flummox special?

Flummox allows you to encapsulate your entire Flux set-up — stores, actions, constants, and the dispatcher — into a single class, with **zero singletons or global references**. It's as easy as

```js
const flux = new Flux();
```

There are many benefits to this approach, but the biggest one is that it makes isomorphism (running the same code on both the server and the client) incredibly straightforward.

**Flummox is not a framework.** Rather than forcing a bunch of new concepts and complicated APIs upon you, Flummox embraces existing idioms from Flux, React, and ES6 — without being too prescriptive.

#### Simple example


```js
import { Actions, Store, Flummox } from 'flummox';

class MessageActions extends Actions {
  newMessage(content) {
    return content; // automatically dispatched
  }
}

class MessageStore extends Store {
  constructor(flux) {
    super();

    const messageActions = flux.getActions('messages');
    this.register(messageActions.newMessage, this.handleNewMessage);
    this.messageCounter = 0;

    this.state = {};
  }

  handleNewMessage(content) {
    const id = this.messageCounter++;

    this.setState({
      [id]: {
        content,
        id,
      },
    });
  }
}

class Flux extends Flummox {
  constructor() {
    super();

    this.createActions('messages', MessageActions);
    this.createStore('messages', MessageStore, this);
  }
}

const flux = new Flux();

// perform action
flux.getActions('messages').newMessage('Hello, world!');
```

### Idiomatic

If you know Flux, you know Flummox. If you're not familiar with Flux, there are [many](http://facebook.github.io/flux/docs/overview.html#content) [great](https://medium.com/brigade-engineering/what-is-the-flux-application-architecture-b57ebca85b9e) resources available to get you up to speed.

The primary goal of Flummox is reduce the boilerplate involved in setting up Flux for your application, so the API has been kept as minimal and predictable as possible. It uses Facebook's dispatcher under the hood. It encourages (but does not require) the use of ES6 classes. The state API for stores mirrors the state API for React components. Everything works as you'd probably expect.

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
  const flux = new Flux();

  res.send(
    React.renderToString(<App flux={flux} />)
  );
});
```

Flummox also gives you the ability to serialize the initial state of your application on the server, send it down to the client as a string, and deserialize it before the initial render. While not required for isomorphism, it helps make the initial page load snappy by reducing unnecessary AJAX requests to the server.

React integration
-----------------

Integrating Flummox with React is really easy. You can do it the long way by manually adding and removing event listeners, but that leads to a lot of boilerplate. Use FluxComponent and/or fluxMixin to subscribe to store changes.

Here's a basic example:

```js
import React from 'react';
import FluxComponent from 'flummox/component';

class OuterComponent extends React.Component {
  render() {
    return (
      // Pass an array of store keys, or a map of keys to state getters
      <FluxComponent connectToStores={['storeA', 'storeB']}>
        <InnerComponent />
      </FluxComponent>
    );
  }
}
```

You can subscribe to subsets of store state using custom state getters. Read all about it in the [React integration guide](flummox/docs/guides/react-integration).


Roadmap
-------

Flummox is still quite new, but the core features are already in place. A big focus right now is improving the documentation, writing guides, and providing examples. Since Flummox's core innovation is its approach to isomorphism, I would like to make it especially easy for newcomers to learn how to use Flummox to create isomorphic applications.

Feature requests and PRs are absolutely welcome, as long as they keep with the spirit of a minimal core API. Any additional features (e.g. undo-redo & versioning) are likely to be implemented as addons, rather than as part of the core.


Recommended libraries
---------------------

Flummox is just Flux. It has no opinion on the rest of your stack. You don't even have to be using React. But in case you're interested, here are some recommended tools and libraries that complement Flummox well:

* [React (of course!)](http://facebook.github.io/react/)
* [Immutable.js](http://facebook.github.io/immutable-js/) — Using immutable data in your applications not only makes your application more performant, but it also simplifies state management in your stores. No more defensive copying! It also helps ensure isolation between stores by reducing the likelihood that you'll accidentally mutate a dispatched payload.
* [React Router](https://github.com/rackt/react-router) — A complete routing solution for React, with excellent support for isomorphic applications.
* [Babel](https://babeljs.io/) — Use next-generation JavaScript (ES6, and even some ES7) today. Once you've tried it, it's the only way to write JavaScript. Babel also very conveniently supports JSX compilation.


Inspiration and thanks
----------------------

* Facebook, obviously.
* Pete Hunt's talk at React.js Conf 2015 ["Full Stack Flux"](https://www.youtube.com/watch?v=KtmjkCuV-EU). The idea of stores as essentially "a reduce() + a change event" was illuminating.
* [alt](https://github.com/goatslacker/alt), a similar Flux library from which I shamelessly copied (ideas, not code)

License
-------

MIT

Andrew Clark [@acdlite](https://twitter.com/acdlite)
