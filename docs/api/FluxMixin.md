API: `fluxMixin`
===============

Access the Flux instance and subscribe to store updates. Refer to the [React integration guide](../react-integration.md) for more information.

Note that fluxMixin is actually a function that returns a mixin, as the example below shows. The parameters are the same as those for `connectToStores()`, described below. On component initialization, `connectToStores()` is called and used to set the initial state of the component.

```js
import fluxMixin from 'flummox/mixin';

let MyComponent = React.createClass({

  mixins[fluxMixin(['storeA', 'storeB'])],

  ...
});
```

In general, [it's recommended to use FluxComponent instead of fluxMixin](../why-flux-component-is-better-than-flux-mixin.md).

State getters
-------------

When connecting to stores with fluxMixin (and FluxComponent), you'll usually want to specify custom state getters.

A state getter is a function which returns a state object for a given store. The state object is merged into the component state using `setState()`.

The default state getter returns the entire store state. You can specify null as a state getter to use the default state getter.

Here's an example of a state getter map you would pass to either `fluxMixin()` or `connectToStores()`. The keys are store keys, and the values are state getter functions.

```js
fluxMixin({
  // Can't use arrow functions because we need `this` to be bound to component
  // Yet another reason FluxComponent is better :)
  posts: function(store) (
    return {
      storeA: store.getPost(this.props.post.id),
    };
  ),
  comments: function(store) (
    return {
      comments: store.getCommentsForPost(this.props.post.id),
    };
  )
});
```

Use `key` to ensure stores stay in sync
---------------------------------------

State getters are bound to the component instance, so you can reference props the normal way as `this.props`. When a prop change is detected (by doing a shallow comparison of props in `componentDidUpdate()`), the state from the stores is updated.

The same cannot be said for `this.state` — there's no reliable way to sync store state in response to component state changes without causing an infinite update cycle (at least that I know of).

To solve this problem and ensure that stores always stay in sync, specify a unique `key` prop on the component, which will signal React to mount a new instance whenever the key changes (which shouldn't be often, if you're worried about performance issues).

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
connectToStores(Array<string> storeKeys)
connectToStores(object stateGetterMap)
```

Synchronize component state with state from Flux stores. Pass a single store key, an array of store keys, or a map of store keys to getter functions. In the single store key form, you can also specific a custom state getter as the second argument.

Returns the initial combined state of the specified stores.

**Usage note**: Generally, you should avoid calling this directly and instead pass arguments to `fluxMixin()`, which calls this internally.

### getStoreState

```
getStoreState()
```

Returns current combined state of connected stores.
