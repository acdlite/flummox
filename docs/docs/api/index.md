API
===

Flummox has three exports:

* [`Actions`](/flummox/api/actions)
* [`Store`](/flummox/api/store)
* [`Flux`](/flummox/api/flux) (also available as `Flummox`) This is the default export.

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

* [`FluxComponent`](/flummox/api/fluxcomponent)
* [`fluxMixin`](/flummox/api/fluxmixin)

Refer to the [React integration guide](/flummox/guides/react-integration) for details on how to use FluxComponent and fluxMixin in your application.

```js
import fluxMixin from 'flummox/mixin';
import FluxComponent from 'flummox/component';
```
