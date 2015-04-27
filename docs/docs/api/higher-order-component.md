Higher-order Flux Component
===========================

*"A higher-order component is just a function that takes an existing component and returns another component that wraps it."*

**Requires React 0.13. If you're still on React 0.12, use FluxComponent instead.**

Subscribes to store updates. A higher-order component form of [FluxComponent](fluxcomponent.md).

```js
/*
 * connectToStores: returns a wrapped BaseComponent with Store(s)
 * state as props injected into it.
 *
 * BaseComponent: a React Component to wrap.
 *
 * stores: a string or an array of strings of Store keys, or
 *   an object of store keys mapped to state getters.
 *
 * stateGetter: a function that takes the store as a parameter and
 *   returns the state that should be passed to the component's
 *   `setState()`. If no state getter is specified, the default getter is
 *   used, which simply returns the entire store state.
 */
connectToStores(BaseComponent, stores, stateGetter);
```

It's main advantage is that it makes it possible for components to co-locate it's data requirements declaratively while mantaining composability; so that you keep a component's behaivior/render logic and data needs encapsulated on itself. Refer to the [React integration guide](../guides/react-integration.md) for more information.

Here's an example from the quickstart:

```js
class MessagesView extends React.Component {

  render() {
    let messageList = this.props.messages.map( message => {(
                        <li>
                          <Message author={message.author} body={message.body} key={message.id} />
                        </li>
                      )});
    return (
      <ul className="message-list">
        {messageList}
      </ul>
    );
  }
}

/* Wrap your Component with 'connectToStores' HoC
 * connectToStores connects to 'messages' store
 * connectToStores injects 'messages' store state into wrapped component(s) props
 * MessagesView is injected with a `messages` prop
 */
MessagesView = connectToStores(MessagesView, {
  messages: store => ({
    messages: store.getMessages()
  })
});

export default MessagesView; // export the Wrapped Component
```

State getters
-------------
The `stateGetter` prop can be used to control how state from stores are transformed into props. For example in some situations the data retrieved from one store depends on the state from another, you can use an array of store keys with a custom state getter to ensure the components state is updated when either store changes:

```js
connectToStores(SomeComponent,
  ['posts', 'session'],

  // An array of store instances are passed to the state getter; Instead of indexing
  // into the stores array, ES6 array destructuring is used to access each store
  // as a variable.
  ([postStore, sessionStore]) => ({
    posts: store.getPostForUser(sessionStore.getCurrentUserId())
  })
);
```

The `stateGetter` param behaves differently depending on the value passed to the `stores` param, you can refer to [fluxMixin](fluxmixin.md) for more details.

**Note**: FluxComponent, fluxMixin, and the higher-order component implement the same [interface](https://github.com/acdlite/flummox/blob/master/src/addons/reactComponentMethods.js). Eventually the docs will updated to make this clearer.
