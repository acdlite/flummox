API
===

Flummox has three exports:

* [Actions](api/actions.md)
* [Store](api/store.md)
* [Flux](api/flux.md) (also available as `Flummox`) This is the default export.

If you're using ES6 module syntax:

```js
import { Flux } from 'flummox';
```

Or multiple classes at once:

```js
import { Flux, Store, Actions } from 'flummox';
```

Addons
------

Flummox also comes with some addons. These are not part of the main export. That way, if you don't use them, they won't increase the size of your bundle.

* [FluxComponent](api/fluxcomponent.md)
* [fluxMixin](api/fluxmixin.md)
* [Higher-order component](api/higher-order-component.md)

Refer to the [React integration guide](../guides/react-integration.md) for details.

```js
import fluxMixin from 'flummox/mixin';
import FluxComponent from 'flummox/component';
import connectToStores from 'flummox/connect';
```
