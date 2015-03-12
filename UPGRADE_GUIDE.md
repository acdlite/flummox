Upgrade Guide
=============

Please refer to the [changelog](/CHANGELOG.md) for a full list of breaking changes.

2.x -> 3.x
----------

### Accessing props inside state getters

The biggest breaking change is that state getters passed to `connectToStores()` are no longer auto-bound to the component. Instead, `props` are passed as the second parameter:

```js
// Before: 2.x
<FluxComponent connectToStores={{
  posts: store => ({
    post: store.getPost(this.props.postId),
  })
}}>
  <InnerComponent />
</FluxComponent>

// After: 3.x
<FluxComponent connectToStores={{
  posts: (store, props) => ({
    post: store.getPost(props.postId),
  })
}}>
  <InnerComponent />
</FluxComponent>
```

Aside from being more a functional interface, this allows us to do optimizations at the library level, and prevents anti-patterns such using state inside a state getter.

### Directly-nested FluxComponents

Previously it was suggested that you could directly nest FluxComponents as a way to get store state based on other store state. This is now considered an anti-pattern. Use the `render` prop for custom rendering instead.

```js
// Before: 2.x
<FluxComponent connectToStores={{
  posts: store => ({
    mostRecentPost: store.getMostRecentPost(),
  })
}}>
  <FluxComponent connectToStores={{ // has prop "mostRecentPost"
    comments: function(store) {
      return {
        mostRecentComments: store.getMostRecentComments(this.props.mostRecentPost.id)
      };
    }
  }}>
    <ChildComponent /> // has props "mostRecentPosts" and "mostRecentComments"
  </FluxComponent>
</FluxComponent>

// After: 3.x
<FluxComponent
  connectToStores={{
    posts: store => ({
      mostRecentPost: store.getMostRecentPost(),
    })
  }}
  render={props =>
    <FluxComponent connectToStores={{
      comments: (store, props) => ({
        mostRecentComments: store.getMostRecentComments(props.mostRecentPost.id)
      })
    }}>
      <ChildComponent {...props} /> // has props "mostRecentPosts" and "mostRecentComments"
    </FluxComponent>
  }
/>
</FluxComponent>
```
