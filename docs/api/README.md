Flummox API
===========

Flummox has three exports:

* [`Actions`](Actions.md)
* [`Store`](Store.md)
* [`Flux`](Flux.md) (also available as `Flummox`) This is the default export.

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

* [`FluxMixin`](FluxMixin.md)
* [`FluxComponent`](FluxComponent.md)
* [`TestUtils`](TestUtils.md)

Refer to the [React integration guide](../react-integration.md) for details on how to use FluxComponent and FluxMixin in your application.

```js
import FluxMixin from 'flummox/mixin';
import FluxComponent from 'flummox/component';
import * as FluxTestUtils from 'flummox/test-utils';
```
