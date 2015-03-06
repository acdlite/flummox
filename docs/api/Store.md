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

    // Register handlers with the dispatcher using action ids, or the
    // actions themselves
    let messageActions = flux.getActions('messages');
    this.register(messageActions.newMessage, this.handleNewMessage);

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

In a Flux application, all application state is contained inside stores, and the state of a store can only be changed by the store itself. The sole point of entry for data in a store is via the dispatcher, but information sent through the dispatcher should be thought of not as data, but as messages *describing* data. This may seem like a distinction without a difference, but by sticking to this concept, it ensures that your stores remain isolated and free of the complicated dependencies you often find in MVC-style apps.

Because state is so crucial, Flummox is a little more opinionated than some other Flux libraries about how to manage it: for instance, all state must be stored in the `this.state` object. That being said, Flummox places no restrictions on the types of data you store, so interoperability with libraries like Immutable.js is a non-issue. If this sounds familiar, it's because the store API is heavily influenced by the [React component API](http://facebook.github.io/react/docs/component-api.html):

* All state mutations must be made via `setState()`.
* `this.state` is used to access the current state, but it should **never** be mutated directly. Treat `this.state` as if it were immutable.
* As in React +0.13, initial state is set by assignment in the constructor.

Performing optimistic updates
-----------------------------

A common pattern when performing server operations is to update the application's UI optimistically — before receiving a response from the server — then responding appropriately if the server returns an error. Use the method `registerAsync` to register separate handlers for the beginning of an asynchronous action and on success and failure. See below for details.


Methods
-------

### register

```js
register(function action | string actionId , function handler)
```

Register a handler for a specific action. The handler will be automatically bound to the store instance.

You can register using either the action id or the action itself.

**Usage note**: `register()` works for both async and sync actions. In the case of async actions, it receives the resolved value of the promise returned by the action.

### registerAsync

```js
registerAsync(function action | string actionId [, function begin, function success, function failure])
```

A register handler specifically for asynchronous actions (actions that return promises).

- `beginHandler` is called at the beginning of the asynchronous action. It receives same arguments that were passed to the action.

- `successHandler` works the same as if you registered an async action with `register()`: it is called if and when the asynchronous action resolves. It receives the resolved value of the promise returned by the action.

- `failureHandler` is called if and when the asynchronous action is rejected. It receives the rejected value of the promise returned by the action (by convention, an error object).

This makes it easy perform to perform optimistic UI updates.

If any of the passed handlers are not functions, they are ignored.

**Usage note**: `registerAsync(null, handler, null)` is functionally equivalent to `register(handler)`. If you don't need to respond to the beginning of an async action or respond to errors, then just use `register()`.

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

### forceUpdate

```js
forceUpdate()
```

Emits change event.

**Usage note**: If you can, use `setState()` instead.


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

Internally, it calls [`Dispatcher#waitFor()`](http://facebook.github.io/flux/docs/dispatcher.html#content).

Instead of passing a store, you can also pass a dispatcher token, or an array of tokens and stores.

**Usage note**: Because this method introduces dependencies between stores, you should generally try to avoid using it. Stores should be as isolated as possible from the outside world. If you find yourself relying on `waitFor()` often, consider rethinking how data flows through your app.
