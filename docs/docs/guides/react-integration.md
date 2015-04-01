# React integration guide

If you're using Flummox, you're probably also using React. To make React integration incredibly simple, Flummox comes with some optional goodies: [FluxComponent](/flummox/docs/api/fluxcomponent) and [fluxMixin](/flummox/docs/api/fluxmixin). Both have essentially the same functionality — in fact, the component is mostly just a wrapper around the mixin. However, in the spirit of React, the component form is preferred. (Read more about [why FluxComponent is preferred](why-flux-component-is-better-than-flux-mixin).)

```js
import FluxComponent from 'flummox/component';
import fluxMixin from 'flummox/mixin';
```

This guide discusses how to use FluxComponent to integrate Flummox with React.

**In v3.0, FluxComponent requires React 0.13. If you're still on React 0.12, keep using Flummox 2.x until you're able to upgrade.**

## Accessing the Flux instance

**tl;dr** FluxComponent gives you easy access to your Flux instance from anywhere in your component tree using only components and props.

***

Unlike most other Flux libraries, Flummox doesn't rely on singletons, because singletons don't work well on the server. The one downside of this approach is that in order to access your stores and actions, you can't just require a module: you have to pass your Flux instance through your component tree. You could do this by manually passing props from one component to the next, but that's not a great solution for components that are nested more than a few levels down.

A better approach is to use context, which exposes data to arbitrarily deep components. Context in React is currently undocumented, but don't worry: it's a widely-used, safe part of React. (React Router uses context extensively.)

Context is kind of weird, though. It's awkward to use and easy to abuse, which is probably why it's as-yet undocumented.

FluxComponent treats context as an implementation detail, so you don't have to deal with it. Pass your Flux instance as a prop, and it will be added to the context of all its nested components.

Additionally, the immediate children of FluxComponent will be injected with a `flux` prop for easy access.

```js
<FluxComponent flux={flux}>
  // Immediate children have flux prop
  // flux has been added to context
</FluxComponent>
```

If flux is already part of the context, you can omit the flux prop on FluxComponent:

```js
<FluxComponent>
  // Same as last time: immediate children have flux prop
  // flux is already part of context, and remains so
</FluxComponent>
```

So if you pass a flux instance as a prop to a FluxComponent near the top of your app hierarchy, any FluxComponents further down the tree will automatically have access to it:

```js
React.render(
  <FluxComponent flux={flux}>
    <App />
  </FluxComponent>,
  document.getElementById('app')
)
```

Pretty simple, right?

## Subscribing to store updates

**tl;dr** FluxComponent synchronizes with the state of your Flux stores and injects the state into its children as props.
***

Stores are EventEmitters that emit change events whenever their state changes. To keep up to date, components must get the intial state, add an event listener, save a reference to the listener, and then remove the listener before unmounting to prevent memory leaks.

This sucks. And it's easy to mess up.

FluxComponent hides all of these concerns behind a simple component interface. The prop `connectToStores` specifies which stores you want to stay in sync with. FluxComponents's immediate children will be injected with props corresponding to the state of those stores.

```js
class OuterComponent extends React.Component {
  render() {
    return (
      // Pass an array of store keys
      <FluxComponent connectToStores={['storeA', 'storeB']}>
        <InnerComponent />
      </FluxComponent>
    );
  }
}
```

If `storeA` has state `{foo: 'bar'}` and `storeB` has state `{bar: 'baz'}`, then InnerComponent has props `foo="bar"` and `bar="baz"`. Whenever the stores change, so do the props.

`connectToStores` will accept a single store key, an array of store keys, or a map of store keys to getter functions. A getter function is a function which takes a single parameter, the store, and returns an object of props to be injected into the children of FluxComponent. If a null is specified as a getter, the default getter is used instead, which simply returns the entire store state (like in the example above).

So, in just a few short lines, we can specify the initialization logic, update logic, and listening/unlistening logic for our component.

```js
// Pass an object of store keys mapped to getter functions
<FluxComponent connectToStores={{
  posts: store => ({
    post: store.getPost(this.props.post.id),
  }),
  comments: store => ({
    comments: store.getCommentsForPost(this.props.post.id),
  })
}}>
  <InnerComponent />
</FluxComponent>
```

In this example, InnerComponent has props `post` and `comments`. If this auto-magic prop passing feels weird, or if you want direct control over rendering, you can pass a custom render function instead. Refer to the [FluxComponent](/flummox/docs/api/fluxcomponent) docs for more information.

## Using fluxMixin

**tl;dr** Just use FluxComponent. (Unless you don't want to. Up to you.) Read a longer explanation for [why FluxComponent is preferred](why-flux-component-is-better-than-flux-mixin).

***

FluxComponent is really just a wrapper around fluxMixin. (Seriously, check out the source.) But if you want to use fluxMixin directly, you can.

Like FluxComponent, fluxMixin expects that the component you're mixing it into has access to a Flux instance via either a prop or context. It adds the Flux instance to the child context.

Unlike FluxComponent, it does not inject props into its children. You can, however, access the instance with `this.flux`.

fluxMixin adds a single method, `connectToStores()`. This is exactly like the `connectToStores` prop of FluxComponent. You can pass a single store key, an array of store keys, or a map of store keys to getter functions. In the single store key form, you can also pass a getter function as the second argument. (This form is not available to FluxComponent because props are single values.)

fluxMixin does not inject store state as props into its children. Instead, it merges it into component state using `setState()`.

When you call `connectToStores()`, it returns the current combined state of the stores (as specified by the getters). This is so you can use it within `getInitialState()`.

However, there is a better way. fluxMixin is actually a function that returns a mixin object. Arguments passed to `fluxMixin()` are automatically sent to `connectToStores()` and used to set the initial state of the component.

```js

const MyComponent = React.createClass({

  // Remember, you can also use the single key or object forms
  mixins[fluxMixin(['storeA', 'storeB'])],

  ...
});

```

If `storeA` has state `{foo: 'bar'}` and `storeB` has state `{bar: 'baz'}`, then MyComponent has state `{foo: 'bar', bar: 'baz'}`. Whenever the stores change, so does MyComponent.
