Upgrade Guide
=============

Please refer to the [changelog](/CHANGELOG.md) for a full list of breaking changes.

2.x -> 3.x
----------

### Upgrade to React 0.13

FluxComponent and fluxMixin have seen some significant updates, and now require React 0.13. If you're still on React 0.12, keep using Flummox 2.13.1 until you're able to upgrade.

### Accessing props inside state getters

State getters passed to `connectToStores()` are no longer auto-bound to the component. Instead, `props` are passed as the second parameter:

```js
// Before: 2.x
const MyComponent = React.createClass({
  mixins: [fluxMixin({
    posts: function(store) {
      return {
        post: store.getPost(this.props.postId),
      };
    }
  })]
});

// After: 3.x
// Or, you know, just use FluxComponent :)
const MyComponent = React.createClass({
  mixins: [fluxMixin({
    posts: (store, props) => ({
      post: store.getPost(props.postId),
    })
  })]
})
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
  render={storeState =>
    <FluxComponent connectToStores={{
      comments: store => ({
        mostRecentComments: store.getMostRecentComments(storeState.mostRecentPost.id)
      })
    }}>
      <ChildComponent {...storeState} /> // has props "mostRecentPosts" and "mostRecentComments"
    </FluxComponent>
  }
/>
</FluxComponent>
```
