`FluxComponent`
===============

**In v3.0, FluxComponent requires React 0.13. If you're still on React 0.12, keep using Flummox 2.x until you're able to upgrade.**

Access the Flux instance and subscribe to store updates. Refer to the [React integration guide](../guides/react-integration.md) for more information.


```js
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

In general, [it's recommended to use FluxComponent instead of fluxMixin](../guides/why-flux-component-is-better-than-flux-mixin.md).

State getters
-------------

The `stateGetter` prop can be used to control how state from stores are transformed into props:

```js
<FluxComponent
  connectToStores={['posts', 'session']}
  stateGetter={([postStore, sessionStore]) => ({
    posts: store.getPostForUser(sessionStore.getCurrentUserId())
  })}
}}>
  <InnerComponent />
</FluxComponent>
```

The `stateGetter` prop behaves differently depending on the value passed to the `connectToStores` prop, refer to [fluxMixin](fluxmixin.md) for more details.


Access flux with `this.props.flux`
----------------------------------

In the child component, you can access the Flux instance with `this.props.flux`. For example, to perform an action:

```js
onClick(e) {
  e.preventDefault();
  this.props.flux.getActions('actionsKey').someAction();
}
```

Custom rendering
----------------

With FluxComponent, state from your stores is automatically passed as props to its children. This is nice for simple cases, especially when there's only a single child. But for more complex cases, or if you want direct control over rendering, you can pass a custom render function prop to FluxComponent:

```js
// Using children
<FluxComponent connectToStores={{
  posts: store => ({
    post: store.getPost(this.props.postId),
  })
}}>
  <InnerComponent />
</FluxComponent>

// Using custom `render` function
<FluxComponent
  connectToStores={{
    posts: store => ({
      post: store.getPost(this.props.postId),
    })
  }}
  render={storeState => {
    // Render whatever you want
    return <InnerComponent {...storeState} />;
  }}
/>
```

Props
-----

### `flux`

Indicates the [Flux instance](flux.md) to be used. It will be added to the context of all its nested components. If unset, it'll try to infer it from the context.

### `connectToStores`

This prop has the same effect as passing the first argument to [fluxMixin](fluxmixin.md)'s `connectToStores()`.

### `stateGetter`

This prop has the same effect as passing the second argument to [fluxMixin](fluxmixin.md)'s `connectToStores()`.

### `render`

Optionally overrides the rendering function, useful to control what state is passed down as props to components.
