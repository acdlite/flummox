API: `Flux`
==============

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
let flux = new Flux();
```

(Note that there's nothing technically stopping you from using singletons if you wish, but why would you want to?)


Debugging
---------

Like Stores, Flux instances are EventEmitters. A `dispatch` event is emitted on every dispatch. Listeners are sent the dispatched payload. This can be used during development for debugging.

```js
flux.addListener('dispatch', payload => {
  console.log('Dispatch: ' + payload);
});
```

Methods
-------

### createActions

```js
createActions(string key, function ActionsClass [, ...constructorArgs])
```

Creates an instance of `ActionsClass` and saves a reference to it. `constructorArgs` are passed to the constructor of `ActionsClass` on creation.

### createStore

```js
createStore(string key, function StoreClass [, ...constructorArgs])
```

Creates an instance of `StoreClass`, registers the store's handlers with the dispatcher, and saves a reference to it. `constructorArgs` are passed to the constructor of `ActionsClass` on creation.

### getStore

```js
getStore(string key)
```

Gets an store instance by key.

### getActions

```js
getActions(string key)
```

Gets an actions instance by key.

### getActionIds

```js
getActionIds(string key)
```

Gets action ids for the given actions key. Internally calls `Actions#getActionIds`.

Also available as `getConstants()`.

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

Serialization/deserialization
-------------------------------

If you're building an isomorphic application, it's often a good idea pass the initial state of your application from the server to the client to avoid unecessary/duplicate HTTP requests. This is easy with Flux, since all of your application state is located in your stores.

This feature is opt-in on a store-by-store basis, and requires some additional set-up.

### serialize

```
serialize()
```

Returns a serialized string describing the entire state of your Flux application.

Internally, it passes each store's current state to the store's static method `Store.serialize()`. The return value must be a string representing the given state. If a store does not have a static method `serialize()`, or if it returns a non-string, it is ignored.

### deserialize

```
deserialize(string stateString)
```

Converts a serialized state string (as returned from `Flux#serialize()`) to application state and updates the stores.

Internally, it passes the state string for each store (as returned from `Store.serialize()`) to the store's static method `Store.deserialize()`. The return value must be a state object. It will be passed to `Store#replaceState()`. If a store does not have a static method `deserialize()`, it is ignored.
