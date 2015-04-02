`fluxMixin`
===========

Access the Flux instance and subscribe to store updates. Refer to the [React integration guide](../guides/react-integration.md) for more information.

Note that fluxMixin is actually a function that returns a mixin, as the example below shows. The parameters are the same as those for `connectToStores()`, described below. On component initialization, `connectToStores()` is called and used to set the initial state of the component.

```js
import fluxMixin from 'flummox/mixin';

let MyComponent = React.createClass({

  mixins[fluxMixin(['storeA', 'storeB'])],

  ...
});
```

In general, [it's recommended to use FluxComponent instead of fluxMixin](../guides/why-flux-component-is-better-than-flux-mixin.md).

State getters
-------------

When connecting to stores with fluxMixin (and FluxComponent), you'll usually want to specify custom state getters.

A state getter is a function which returns a state object for a given store. The state object is merged into the component state using `setState()`.

The default state getter returns the entire store state. You can specify null as a state getter to use the default state getter.

Here's an example of a state getter map you would pass to either `fluxMixin()` or `connectToStores()`. The keys are store keys, and the values are state getter functions.

```js
fluxMixin({
  posts: (store, props) =>({
    storeA: store.getPost(props.post.id),
  }),
  comments: (store, props) => ({
    comments: store.getCommentsForPost(props.post.id),
  })
});
```

In some situations the data retrieved from one store depends on the state from another, you can use an array of store keys with a custom state getter to ensure the components state is updated when either store changes:

```js
fluxMixin(
  ['posts', 'session'],

  // An array of store instances are passed to the state getter; Instead of indexing
  // into the stores array, ES6 array destructuring is used to access each store
  // as a variable.
  ([postStore, sessionStore]) => ({
    posts: store.getPostForUser(sessionStore.getCurrentUserId())
  })
);
```

Access flux with `this.flux`
----------------------------

You can access the Flux instance with `this.flux`. For example, to perform an action:

```js
onClick(e) {
  e.preventDefault();
  this.flux.getActions('actionsKey').someAction();
}
```


Methods
-------

### connectToStores

```js
connectToStores(string storeKey [, function stateGetter])
connectToStores(Array<string> storeKeys [, function stateGetter])
connectToStores(object stateGetterMap [, function stateGetter])
```

Synchronize component state with state from Flux stores. Pass a single store key, an array of store keys, or a map of store keys to getter functions. You can also specify a custom state getter as the second argument, the default state getter will return the entire store state (a reduce is performed on the entire store state when using an array or store keys).

When using an array of store keys, the custom state getter is called with an array of store instances (same order as keys) as the first argument; An array is used instead of separate arguments to allow for future versions of flummox to pass additional arguments to the stateGetter eg. `props`.

Otherwise only a single store instance is passed to the custom state getter.

Returns the initial combined state of the specified stores.

**Usage note**: Generally, you should avoid calling this directly and instead pass arguments to `fluxMixin()`, which calls this internally.

### getStoreState

```
getStoreState()
```

Returns current combined state of connected stores.
