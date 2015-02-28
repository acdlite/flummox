API: `Actions`
==============

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
    try {
      return await serverCreateMessage(messageContent);
    } catch (error) {
      // handle error somehow
    }
  }

}
```

Testing
-------

The return value of an action is dispatched automatically. It's also returned to the caller. This means it's possible to test actions completely independently from a Flux or Store instance.

Asynchronous actions
--------------------

Asynchronous actions are actions that return promises. Unlike synchronous actions, async actions fire the dispatcher twice: at the beginning and at the end of the action. Refer to the [Store API](Store.md) for information on how to register handlers for asynchronous actions.

The reason that asynchronous actions return a promises that resolve to undefined is so the caller can know when the action is complete and it's safe to continue. On the server, you can use this feature to wait for data fetching operations to finish before rendering your app.

Methods
-------

### getActionIds

```js
getActionIds()
```

Returns an object of action ids, keyed by action name. (In most cases, it's probably more convenient to use `Flux#getActionIds()` instead.)


Also available as `getConstants()`
