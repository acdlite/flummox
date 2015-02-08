API: `Store`
==============

Create stores by extending from the base `Store` class.

```js
class MessageStore extends Store {

  // Note that passing a flux instance to the constructor is not required;
  // we do it here so we have access to any action ids we're interested in.
  constructor(flux) {

    // Don't forget to call the super constructor
    super();

    // Register handlers with the dispatcher using action ids
    let messageActionIds = flux.getActionIds('messages');
    this.register(messageActionIds.newMessage, this.handleNewMessage);

    // Set initial state using assignment
    this.state = {};
  }

  // Define handlers as methods...
  handleNewMessage() { ... }

  // It's also useful to define accessor-style methods that can be used by
  // your views on state changes
  getMessage(id) { ... }
}
```

Managing state
--------------

In a Flux application, all application state is contained inside stores, and the state of a store only be changed by the store itself. The sole point of entry for data in a store is via the dispatcher, but even then, information sent through the dispatcher should be thought of as messages *describing* data, not data itself. This may seem like a distinction without a difference, but by sticking to this concept, it ensures that your stores remain isolated and free of the complicated dependencies you often find in MVC-style apps.

Because state is so crucial, Flummox is a little more opinionated than some other Flux libraries about how to manage it: the Store API is heavily influenced by the [React component API](http://facebook.github.io/react/docs/component-api.html). All state mutations must be made via `setState()`. `this.state` is used to access the current state, but it should **never** be mutated directly. Treat `this.state` as if it were immutable.

As in React +0.13, initial state is set by assignment in the constructor.

Methods
-------

### register

```js
register(Store store, function handler)
```

Register a handler for a specific action. The handler will be automatically bound to the store instance.

### setState

```js
setState(object nextState)
```

Shallow merges `nextState` with the current state, then emits a change event so views know to update themselves.

Similar to React, multiple calls to `setState()` within the same handler are batched and applied at the end. Accessing `this.state` after calling `setState()` will return the existing value, not the updated value.

### replaceState

```js
replaceState(object nextState)
```

Like `setState()` but deletes any pre-existing state keys that are not in nextState.


EventEmitter methods
--------------------

Flummox stores are EventEmitters — specifically [eventemitter3](https://github.com/primus/eventemitter3) — so you can use any of the EventEmitter methods, the important ones being `addListener()` and `removeListener()`. Use these in your controller-views to subscribe to changes.

**Usage note**: A `change` event is emitted automatically whenever state changes. Generally, this is the only event views should need to subscribe to. Unlike in MVC, Flux store events don't pass data around to different parts of your application; they merely broadcast that a change has occurred within a store, and interested parties should synchronize their state accordingly.

Dispatcher methods
------------------

### waitFor

```js
waitFor(Store store)
```

Within a handler, this waits for a different store to respond to the dispatcher before continuing. The operation is synchronous. E.g.

```js
someActionHandler() {
  this.waitFor(someStore);
  // someStore has completed, continue...
}
```

Internally, it calls [`Dispatcher#waitFor()`](http://facebook.github.io/flux/docs/dispatcher.html#content). Instead of a store, you could alternatively pass a dispatcher token.

Instead of passing a store, you can also pass a dispatcher token, or an array of tokens and stores.

**Usage note**: Because this method introduces dependencies between stores, try to avoid using this method whenever possible. Stores should be as isolated from the outside world as possible. If you find yourself relying on `waitFor()` often, consider rethinking how data flows through your app.
