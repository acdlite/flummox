API: `Actions`
==============

Create actions by extending from the base `Actions` class.

```js
class MessageActions extends Actions {

  // Methods on the prototype are automatically converted into actions
  newMessage(content) {

    // The return value from the action is sent to the dispatcher.
    // To enforce unidirectional data flow, it is *not* returned to the caller.
    return content;
  }

}
```

Methods
-------

### getActionIds

```js
getActionIds()
```

Returns the action ids for the Actions instance, keyed by action name. (In most cases, it's probably more convenient to use `Flux#getActionIds()` instead.)


Also available as `#getConstants()`
