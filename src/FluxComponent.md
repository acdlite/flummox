API: `FluxComponent`
===============

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

Props
-----

### `connectToStores`

This prop has the same effect as passing an argument to [FluxMixin](FluxMixin.md)'s `connectToStores()`.
