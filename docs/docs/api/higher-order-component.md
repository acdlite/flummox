Higher-order Flux Component
===========================

**Requires React 0.13. If you're still on React 0.12, use FluxComponent instead.**

A higher-order component form of [FluxComponent](fluxcomponent.md). Here's an example from the [Flummox documentation app](https://github.com/acdlite/flummox/blob/master/docs/src/shared/components/HomeHandler.js#L15-L19):

```js
class HomeHandler extends React.Component {
  render() {
    const { doc } = this.props;

    if (!doc) return <span />;

    return <Doc doc={doc} />;
  }
}

HomeHandler = connectToStores(HomeHandler, {
  docs: store => ({
    doc: store.getDoc('index')
  })
});
```

**Note**: FluxComponent, fluxMixin, and the higher-order component implement the same [interface](https://github.com/acdlite/flummox/blob/master/src/addons/reactComponentMethods.js). Eventually the docs will updated to make this clearer.
