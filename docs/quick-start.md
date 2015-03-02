Quick start
===========

This document will help you get up and running with Flummox. We'll walk through the process of creating a sample Flux application for sending messages.

Let's dive right in.

Installation
------------

This part's pretty crucial :)

```
$ npm install --save flummox
```

Overview
--------

There are three parts to Flummox: Actions, Stores, and Flux. Each is represented by a class, and you extend from the base class.

Here's how we'll approach this walkthrough. I like to go in order of Flux data flow, because that just makes sense.

1. Create some actions.
2. Create a store that responds to those actions.
3. Bring them together in a flux class.
4. Use it in a view.

### 1. Create some actions

Actions are groups of functions you call to send data through the dispatcher. (Sometimes these are actually referred to as *action creators*, while actions are the data structures that are sent through the dispatcher, but whatever. We're calling going to use *action* to mean the function that triggers the dispatch.)

To create actions, just extend from the base Actions class and add some methods:

```js

import { Actions } from 'flummox';

class MessageActions extends Actions {

  createMessage(messageContent) {
    return {
      content: messageContent,
      date: Date.now(),
    };
  }

}

```

That's it! Seriously. We just created a single action, `createMessage`, that takes in message content and returns an object with a message field and a date. The return value is then sent through the dispatcher automatically. (If you return undefined, Flummox skips the dispatch step.)

This is a pretty simple example, though. Often, your actions will need to perform some sort of async server operation before dispatching it to the stores. If you return a Promise, Flummox will wait for the Promise to resolve and then dispatch the unwrapped value. ES7's async-await pattern makes this easy. Let's update our example:

```js
class MessageActions extends Actions {

  async createMessage(messageContent) {
    try {
      return await serverCreateMessage(messageContent);
    } catch (error) {
      // handle error somehow
    }
  }

}
```
You can also do this longhand without async-await, but why would you ever want to? Anyway, you have the option.

You may have noticed that we haven't used any constants. "Hey, that's not idiomatic Flux!" Flummox *does* have constants, but they're treated as an implementation detail. Constants are generated for each action, and automatically sent through the dispatcher along with your payload. Because there's a one-to-one relationship between constants and actions, in Flummox we refer to them as *action ids*. Generally, the only time you do need to worry about action ids is when you're registering your stores to handle certain actions. Speaking of which...

### 2. Create a store that responds to those actions

Stores manage the state of your application. Usually, you have one store per resource or "thing" you want to keep track of — in our case, messages. The key thing to understand about stores is that they cannot (or rather, should not) be altered from the outside; they receive messages from the dispatcher and respond accordingly. If you're new to Flux, this may seem like a distinction without a difference, but it's crucial.

Here's how you create a store in Flummox. Like with Actions, create a class that extends from the base class:

```js
import { Store } from 'flummox';

class MessageStore extends Store {

  constructor(flux) {
    super(); // Don't forget this step

    let messageActionIds = flux.getActionIds('messages');
    this.register(messageActionIds.createMessage, this.handleNewMessage);

    this.state = {
      messages: [],
    };
  }

  handleNewMessage(message) {
    this.setState({
      messages: this.state.messages.concat([message]),
    });
  }

}
```

This should look very familiar to you if you've used ES6 classes to create components in React 0.13+:

* Like React, set initial state by assigning to `this.state` in the constructor.
* Like React, update state by using `this.setState()`, which shallow merges new state with old state.
* Like React, multiple calls to `this.setState()` are batched.

Stores are EventEmitters. This lets views listen for changes and stay in sync. A change event is emitted automatically whenever you call `this.setState()`. If you like, you can also emit events manually using the EventEmitter API (`this.emit()`), though it's recommended to just rely on `this.setState()`.

The one bit of API that's new is `this.register(actionId, handler)`. This registers a store method with the dispatcher. Actually, it will accept any function, not just methods... but you probably want to stick to methods (except for testing purposes).

In this example, the store's constructor expects a single argument, flux. This is not a required argument (notice we're not passing it to `super()`); it's a pattern we're using so we have access to our message action ids. I'll explain this in the next section.

### 3. Bring them together in a flux class

The Flux class unifies our stores and actions, along with a dispatcher, into a single, self-contained instance.

```js
import { Flux } from 'flummox';

class AppFlux extends Flux {

  constructor() {
    super();

    this.createActions('messages', MessageActions);

    // The extra argument(s) are passed to the MessageStore constructor
    this.createStore('messages', MessageStore, this);
  }

}
```

`createActions(key, ActionsClass, ...args)` and `createStore(key, StoreClass, ...args)` take a unique string key along with the classes we defined in the previous sections. There's not much magic going on here: under the hood, Flummox creates instances of your classes using the `new` operator, then stashes a reference to them internally.

You can access a Flux instance's actions and stores using `getActions(key)` and `getStore(key)`.

There's an additional method for accessing action ids: `getActionIds(key)`. This is the method we used in the MessageStore class we created above, in order to register the store's action handler. That's why we're passing our Flux instance to the constructor of MessageStore. To reiterate, this isn't a requirement; just a recommended pattern.

Each Flux instance comes with its own dispatcher. Like constants, the dispatcher is treated as an implementation detail. The closest you'll come to interacting with it in most cases is the `Store#register(actionId, handler)` method discussed above. However, if you want to access the dispatcher directly, you can reference the `dispatcher` property of the Flux instance.

So, now we have a class Flux that encapsulates our entire Flux set-up! Now we just create an instance:

```js
let flux = new AppFlux();
```

Because everything is self-contained, you can create as many independent instances as you want. The reason this is so cool is that you get isomorphism for free: just create a new instance for each request.

### 4. Use it in a view

(Flummox/Flux can be used with any view library, of course, but I'm going to assume you're cool and using React.)

So how do you use Flux in your view components? With a traditional Flux library, we'd use a singleton. And if you want to do that, that's perfectly fine. Just create a module that exports a Flux instance and you're good to go. But again, this won't do on the server, because you need a way to 1) deal with multiple requests, and 2) isolate user-specific data. Instead, with Flummox, we create a new Flux instance for every request.

However, manually passing your Flux instance as props down the component tree isn't the best solution. Instead, use fluxMixin and/or FluxComponent. Under the hood, they use React context to expose your Flux instance to arbitrarily nested views. They also make it stupidly easy to subscribe to store updates:

```js

class MessagesView extends React.Component {

  render() {
    return (
      <FluxComponent connectToStores={{
        messages: store => ({
          messages: store.messages
        })
      }}>
        // MessageList is injected with a `messages` prop by FluxContainer
        <MessageList />
      </FluxComponent>
    );
  }

}

```

Read more in the [React integration guide](react-integration.md).

And there you go! I hope this guide was helpful.
