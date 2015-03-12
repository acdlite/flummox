API: `FluxComponent`
===============

**In v3.0, FluxComponent requires React 0.13. If you're still on React 0.12, keep using Flummox 2.x until you're able to upgrade.**

Access the Flux instance and subscribe to store updates. Uses [FluxMixin](FluxMixin.md) under the hood. Refer to the [React integration guide](../react-integration.md) for more information.


```js
<FluxComponent key={this.props.post.id} connectToStores={{
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

In general, [it's recommended to use FluxComponent instead of FluxMixin](../why-flux-component-is-better-than-flux-mixin.md).

State getters
-------------

Refer to [FluxMixin](FluxMixin.md)


Use `key` to ensure stores stay in sync
---------------------------------------

Refer to [FluxMixin](FluxMixin.md)

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

With FluxComponent, state from your stores is automatically passed as props to its children. This is nice for simple cases, especially when there's only a single child. But for more complex cases, or if you want direct control over rendering, now you can pass a custom render function prop to FluxComponent:

```js
// Using children
<FluxComponent connectToStores={{
  posts: (store, props) => ({
    post: store.getPost(props.postId),
  })
}}>
  <InnerComponent />
</FluxComponent>

// Using custom `render` function
<FluxComponent
  connectToStores={{
    posts: (store, props) => ({
      post: store.getPost(props.postId),
    })
  }}
  render={props => {
    // Render whatever you want
    return <InnerComponent {...props} />;
  }}
/>
```

Props
-----

### `connectToStores`

This prop has the same effect as passing an argument to [FluxMixin](FluxMixin.md)'s `connectToStores()`.
