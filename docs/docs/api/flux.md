`Flux`
======

Create Flux containers by extending from the base `Flux` (or `Flummox`) class.

```js
class Flux extends Flummox {
  constructor() {
    super();

    // Create actions first so our store can reference them in
    // its constructor
    this.createActions('messages', MessageActions);

    // Extra arguments are sent to the store's constructor. Here, we're
    // passing a reference to this Flux instance
    this.createStore('messages', MessageStore, this);
  }
}
```

Encapsulate your stores and actions
-------------------------------------

Flummox is designed to be used without singletons. Instead, create a Flux class that encapsulates the creation of all your application's stores and actions, so that you can create new instances on the fly.

```js
const flux = new Flux();
```

(Note that there's nothing technically stopping you from using singletons if you wish, but why would you want to?)


Debugging
---------

Like Stores, Flux instances are EventEmitters. A `dispatch` event is emitted on every dispatch. Listeners are sent the dispatched payload. This can be used during development for debugging.

```js
flux.addListener('dispatch', payload => {
  console.log('Dispatch: ', payload);
});
```

Additionally, an `error` event is emitted when errors occur as a result of an async action. This is both for convenience and to prevent error gobbling.

Methods
-------

### createActions

```js
Actions createActions(string key, function ActionsClass [, ...constructorArgs])
```

Creates an instance of `ActionsClass` and saves a reference to it. `constructorArgs` are passed to the constructor of `ActionsClass` on creation.

### createStore

```js
Store createStore(string key, function StoreClass [, ...constructorArgs])
```

Creates an instance of `StoreClass`, registers the store's handlers with the dispatcher, and saves a reference to it. `constructorArgs` are passed to the constructor of `ActionsClass` on creation.

### getStore

```js
Store getStore(string key)
```

Gets an store instance by key.

### removeStore

```js
Store removeStore(string key)
```

Deletes an instance of `StoreClass`, unregisters the store's handlers from dispatcher, and removes all store listeners.

### getActions

```js
Actions getActions(string key)
```

Gets an actions instance by key.

### getActionIds

```js
Actions getActionIds(string key)
```

Gets action ids for the given actions key. Internally calls `Actions#getActionIds`.

Also available as `getConstants()`.

### removeActions

```js
Actions removeActions(string key)
```

Deletes an actions instance by key.

Dispatcher methods
------------------

Every Flux instance has its own dispatcher. You should try to avoid interacting with the dispatcher directly, but it is available (primarily for testing purposes) as `this.dispatcher`. Some convenience methods are also provided:

### dispatch
```
dispatch(string actionId [, * body])
```

Similar to the `dispatch()` method of the dispatcher itself, except instead of passing a payload, the payload is constructed for you, in the form:

```js
{
  actionId,
  body
}
```

This is used internally by Flummox: the `actionId` field is used to identify the source action, and `body` contains the value passed to store handlers. In your tests, you can use it to simulate a dispatch to your stores.

### waitFor

```
waitFor(Store store)
```

Similar to the `waitFor()` method of the dispatcher itself, this can be used within a handler to wait for a different store to respond to the dispatcher before continuing. The operation is synchronous.

Instead of passing a store, you can also pass a dispatcher token, or an array of tokens and stores.

Using a custom dispatcher
-------------------------

**tl;dr** Flummox uses the flux dispatcher from Facebook, but you can switch out whatever api compatible dispatcher you want.

***

Usually the dispatcher provided by Facebook is sufficient, but you aren't limited to using it if you find you need more than it provides.  If you want to have custom behavior when dispatching actions, you can provide a wrapper for the Facebook dispatcher that does what you want.  Or use something else entirely.  It's up to you.

To substitute a different dispatcher object just change the `constructor()` function of your flux object like this:

```js

class Flux extends Flummox {
  constructor() {
    super();

    this.dispatcher = new MyCustomDispatcher();
  }
}

```

Just remember, whatever object you provide has to follow the same api as the dispatcher from Facebook.  The easiest way to do that is to extend the Facebook dispatcher in a new class, and then provide whatever alternate or extended functionality you desire.

For instance, say you want to allow the dispatcher to receive actions for dispatching while it is in the middle of another action dispatch.  The standard dispatcher will complain that you cannot dispatch an action during another action.  There are good reasons for this, but perhaps you just want to queue up that action and have it execute when the current action is completed.  One easy way to do this would be to use `setTimeout()`.  To do this you would provide a dispatcher with slightly different dispatch functionality, like this:

```js

class MyCustomDispatcher extends Dispatcher {
  dispatch(...args) {
    if (!this.isDispatching()) {
      super.dispatch(...args); // This will execute the Facebook dispatcher's dispatch function.
    } else {
      setTimeout(() => { // We are currently dispatching, so delay this action using setTimeout
        super.dispatch(...args);
      }, 0);
    }
  }
}

```

Serialization/deserialization
-------------------------------

If you're building an isomorphic application, it's often a good idea pass the initial state of your application from the server to the client to avoid unecessary/duplicate HTTP requests. This is easy with Flux, since all of your application state is located in your stores.

This feature is opt-in on a store-by-store basis, and requires some additional set-up.

### serialize

```
string serialize()
```

Returns a serialized string describing the entire state of your Flux application.

Internally, it passes each store's current state to the store's static method `Store.serialize()`. The return value must be a string representing the given state. If a store does not have a static method `serialize()`, or if it returns a non-string, it is ignored.

### deserialize

```
deserialize(string stateString)
```

Converts a serialized state string (as returned from `Flux#serialize()`) to application state and updates the stores.

Internally, it passes the state string for each store (as returned from `Store.serialize()`) to the store's static method `Store.deserialize()`. The return value must be a state object. It will be passed to `Store#replaceState()`. If a store does not have a static method `deserialize()`, it is ignored.
