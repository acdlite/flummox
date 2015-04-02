`Actions`
=========

Create actions by extending from the base `Actions` class.

```js
class MessageActions extends Actions {

  // Methods on the prototype are automatically converted into actions
  newMessage(content) {

    // The return value from the action is sent to the dispatcher.
    // It is also returned to the caller.
    return content;
  }

  // Asynchronous functions are also supported: just return a promise
  // This is easy using async-await
  async createMessage(messageContent) {
    const response = await serverCreateMessage(messageContent);
    return await response.json();
  }

}
```

You can also use a plain JavaScript object. When passed to `flux.createActions`, it will be converted into an Actions class.

```js
// Same as previous example
const MessageActions = {
  newMessage(content) {
    return content;
  },

  async createMessage(messageContent) {
    const response = await serverCreateMessage(messageContent);
    return await response.json();
  }
}
```

Testing
-------

The return value of an action is dispatched automatically. It's also returned to the caller. This means it's possible to test actions completely independently from a Flux or Store instance. Here's how you'd test the example MessageActions from above:

```js
// Using mocha and chai-as-promised
const actions = new MessageActions();

expect(actions.newMessage('Hello world!')).to.equal('Hello world');

// Assuming `serverCreateMessage()` has been mocked
expect(actions.createMessage('Hello world!')).to.eventually.deep.equal({
  id: 1,
  content: 'Hello world!',
});
```


Asynchronous actions
--------------------

Asynchronous actions are actions that return promises. Unlike synchronous actions, async actions fire the dispatcher twice: at the beginning and at the end of the action. Refer to the [Store API](store.md) for information on how to register handlers for asynchronous actions.

Methods
-------

### getActionIds

```js
object getActionIds()
```

Returns an object of action ids, keyed by action name. (In most cases, it's probably more convenient to use `Flux#getActionIds()` instead.)


Also available as `getConstants()`
