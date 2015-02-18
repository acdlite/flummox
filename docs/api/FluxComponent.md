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

Access flux with `this.props.flux`
----------------------------------

In the child component, you can access the Flux instance with `this.props.flux`. For example, to perform an action:

```js
onClick(e) {
  e.preventDefault();
  this.props.flux.getActions('actionsKey').someAction();
}
```

Nested FluxComponents
---------------------

In addition to injecting store state as props into its children, FluxComponent also injects its own props:

```js
<FluxComponent someProp="hello">
  <Innercomponent /> // has "someProp" prop equal to "hello"
</FluxComponent>
```

The practical upshot of this that is it allows you to nest FluxComponents:

```js
// Example: get the most recent comments on the most recent post
<FluxComponent connectToStores={{
  posts: store => ({
    mostRecentPost: store.getMostRecentPost(),
  })
}}>
  <FluxComponent connectToStores={{ // has prop "mostRecentPost"
    comments: function(store) { // can't use arrow function because we want `this` to refer to nested component
      return {
        mostRecentComments: store.getMostRecentComments(this.props.mostRecentPost.id)
      };
    }
  }}>
    <ChildComponent /> // has props "mostRecentPosts" and "mostRecentComments"
  </FluxComponent>
</FluxComponent>
```

You may not want to rely on this pattern too heavily, but it's available as an option.

Props
-----

### `connectToStores`

This prop has the same effect as passing an argument to [FluxMixin](FluxMixin.md)'s `connectToStores()`.
