# React integration guide

If you're using Flummox, you're probably also using React. To make React integration incredibly simple, Flummox comes with some optional goodies: [connectToStores HoC](/flummox/docs/api/higher-order-component) and [FluxComponent](/flummox/docs/api/fluxcomponent). Both have similar functionality — in fact, they both implement the same [interface](https://github.com/acdlite/flummox/blob/master/src/addons/reactComponentMethods.js). However, the **connectToStores** Higher order Component enables you to co-locate components and its data dependencies much like [Facebook's Relay](https://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html) does. (Read more about [why connectToStores HoC is preferred](why-hoc-better-than-fluxcomponent).)

```js
import connectToStores from 'flummox/connect';
import FluxComponent from 'flummox/component';
```

This guide discusses how to use **connectToStores HoC** to integrate Flummox with React.

**connectToStores HoC requires React 0.13. If you're still on React 0.12, use FluxComponent and Flummox 2.x exclusively until you're able to upgrade.**

## Accessing the Flux instance

**tl;dr** Currently you must use FluxComponent to inject your Flux instance into your component tree, so that you can have easy access to stores via connectToStores HoC.

***

Unlike most other Flux libraries, Flummox doesn't rely on singletons, because singletons don't work well on the server. The one downside of this approach is that in order to access your stores and actions, you can't just require a module: you have to pass your Flux instance through your component tree. You could do this by manually passing props from one component to the next, but that's not a great solution for components that are nested more than a few levels down.

A better approach is to use context, which exposes data to arbitrarily deep components. Context in React is currently undocumented, but don't worry: it's a widely-used, safe part of React. (React Router uses context extensively.)

Context is kind of weird, though. It's awkward to use and easy to abuse, which is probably why it's as-yet undocumented.

**FluxComponent** treats context as an implementation detail, so you don't have to deal with it. Pass your Flux instance as a prop, and it will be added to the context of all its nested components. You can learn more about context [here](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html)

Additionally, the immediate children of FluxComponent will be injected with a `flux` prop for easy access.

```js
<FluxComponent flux={flux}>
  // IMMEDIATE children have flux prop
  // flux has been added to context
</FluxComponent>
```

So if you pass a flux instance as a prop to a FluxComponent wrapping your app's top component, all components further down the tree will automatically have access to it:

```js
React.render(
  <FluxComponent flux={flux}>
    <App />
  </FluxComponent>,
  document.getElementById('app')
)
```

Pretty simple, right?

## Accesing the Flux instance in context

Like we just learned, FluxComponent injects the flux instance as a prop to its **immediate** children; but what if we need to access our flux instance in an arbitrary component down the tree?.

Since our Flux instance is passed down from the top component through context, we can always access it like this:

```js
class MyComponent extends React.Component {
  render() {
    return (
      console.log(this.context.flux);
      // ...
    );
  }
}

/* Make the flux context accessible though 'this.context.flux' */
MyComponent.contextTypes = {
  flux: React.PropTypes.object
};

export default MyComponent;
```

When we declare a Component's 'contextTypes' we make those contexts accesible to the Component itself via 'this.context'. If you want to learn more about how context works [here](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html) is a good article by Dave King.

## Subscribing to store updates

**tl;dr** connectToStores HoC synchronizes with the state of your Flux stores and injects the state into wrapped component(s) as props.
***

Stores are [EventEmitters](https://github.com/primus/eventemitter3) that emit change events whenever their state changes. To keep up to date, components must get the intial state, add an event listener, save a reference to the listener, and then remove the listener before unmounting to prevent memory leaks.

This sucks. And it's easy to mess up.

**connectToStores HoC** hides all of these concerns behind a simple component interface. connectToStores specifies which stores you want to stay in sync with. connectToStores immediate children will be injected with props corresponding to the state of those stores.

```js
class MyComponent extends React.Component {
  render() {
    return (
      <SomeOtherComponent />
    );
  }
}

/* Wraping MyComponent with 'connectToStores' HoC :
 * connectToStores connects to 'storeA' and 'storeB' stores and
 *   injects MyComponent with both store states as props
 */
MyComponent = connectToStores(MyComponent, ['storeA', 'storeB']);

export default MyComponent; // export the Wrapped Component
```

If `storeA` has state `{foo: 'bar'}` and `storeB` has state `{bar: 'baz'}`, then MyComponent has props `foo="bar"` and `bar="baz"`. Whenever the stores change, so do the props.

**connectToStores** will accept a single store key, an array of store keys, or a map of store keys to getter functions. A getter function is a function which takes a single parameter, the store, and returns an object of props to be injected into the children of FluxComponent. If a null is specified as a getter, the default getter is used instead, which simply returns the entire store state (like in the example above).

So, in just a few short lines, we can specify the initialization logic, update logic, and listening/unlistening logic for our component.

```js
class MyComponent extends React.Component {
  render() {
    let commentList = this.props.comments.map( comment => {(
                        <li>
                          <Comment author={comment.author} body={comment.body} key={comment.id} />
                        </li>
                      )});
    return (
      <p>{this.props.postBody}</p>
      <ul>
        {commentList}
      </ul>
    );
  }
}

// Pass an object of store keys mapped to getter functions
MyComponent = connectToStores(MyComponent, {  
  posts: store => ({
    postBody: store.getPostBody(this.props.post.id),
  }),
  comments: store => ({
    comments: store.getCommentsForPost(this.props.post.id),
  })
});

export default MyComponent; // export the Wrapped Component
```

In this example, MyComponent has props `postBody` and `comments`. If this auto-magic prop passing feels weird, or if you want direct control over rendering, you can pass a custom render function instead. Refer to the [connectToStores](/flummox/docs/api/higher-order-component) docs for more information.

## Using fluxMixin

**tl;dr** Mixins are on a fast lane to deprecation on React, Just use connectToStores HoC and/or FluxComponent. (Unless you don't want to. Up to you.) Read a longer explanation for [why connectToStores HoC is preferred](why-hoc-better-than-fluxcomponent).

***

connectToStores HoC and FluxComponent are really just a wrapper around fluxMixin. (Seriously, check out the source.) But if you want to use fluxMixin directly, you can.

Like connectToStores HoC and FluxComponent, fluxMixin expects that the component you're mixing it into has access to a Flux instance via either a prop or context. It adds the Flux instance to the child context.

Unlike FluxComponent, it does not inject props into its children. You can, however, access the instance with `this.flux`.

fluxMixin adds a single method, `connectToStores()`. This is actually where the basics of connectToStores HoC and (the prop of FluxComponent) come from. You can pass a single store key, an array of store keys, or a map of store keys to getter functions. In the single store key form, you can also pass a getter function as the second argument. (This form is not available to connectToStores HoC and FluxComponent because props are single values.)

like connectToStores HoC and as opossed to FluxComponent, fluxMixin does not inject store state as props into its children. Instead, it merges it into component state using `setState()`.

When you call fluxMixin's `connectToStores()`, it returns the current combined state of the stores (as specified by the getters). This is so you can use it within `getInitialState()`.

However, there is a better way. fluxMixin is actually a function that returns a mixin object. Arguments passed to `fluxMixin()` are automatically sent to `connectToStores()` and used to set the initial state of the component.

```js

const MyComponent = React.createClass({

  // Remember, you can also use the single key or object forms
  mixins[fluxMixin(['storeA', 'storeB'])],

  ...
});

```

If `storeA` has state `{foo: 'bar'}` and `storeB` has state `{bar: 'baz'}`, then MyComponent has state `{foo: 'bar', bar: 'baz'}`. Whenever the stores change, so does MyComponent.
