import { Flummox, Store, Actions } from '../Flux';

describe('Examples:', () => {

  /**
   * A simple Flummox example
   */
  describe('Messages', () => {

    /**
     * To create some actions, create a new class that extends from the base
     * Actions class. Methods on the class's prototype will be converted into
     * actions, each with its own action id.
     *
     * In this example, calling `newMessage` will fire the dispatcher, with
     * a payload containing the passed message content. Easy!
     */
    class MessageActions extends Actions {
      newMessage(content) {

        // The return value from the action is sent to the dispatcher.
        return content;
      }
    }

    /**
     * Now we need to a Store that will receive payloads from the dispatcher
     * and update itself accordingly. Like before, create a new class that
     * extends from the Store class.
     *
     * Stores are automatically registered with the dispatcher, but rather than
     * using a giant `switch` statement to check for specific action types, we
     * register handlers with action ids, or with a reference to the action
     * itself.
     *
     * Stores have a React-inspired API for managing state. Use `this.setState`
     * to update state within your handlers. Multiple calls to `this.setState`
     * within the same handler will be batched. A change event will fire after
     * the batched updates are applied. Your view controllers can listen
     * for change events using the EventEmitter API.
     */
    class MessageStore extends Store {

      // Note that passing a flux instance to the constructor is not required;
      // we do it here so we have access to any action ids we're interested in.
      constructor(flux) {

        // Don't forget to call the super constructor
        super();

        const messageActions = flux.getActions('messages');
        this.register(messageActions.newMessage, this.handleNewMessage);
        this.messageCounter = 0;

        this.state = {};
      }

      handleNewMessage(content) {
        const id = this.messageCounter++;

        this.setState({
          [id]: {
            content,
            id,
          },
        });
      }
    }


    /**
     * Here's where it all comes together. Extend from the base Flummox class
     * to create a class that encapsulates your entire flux set-up.
     */
    class Flux extends Flummox {
      constructor() {
        super();

        // Create actions first so our store can reference them in
        // its constructor
        this.createActions('messages', MessageActions);

        // Extra arguments are sent to the store's constructor. Here, we're
        // padding a reference to this flux instance
        this.createStore('messages', MessageStore, this);
      }
    }

    /**
     * And that's it! No need for singletons or global references -- just create
     * a new instance.
     *
     * Now let's test it.
     */

    it('creates new messages', () => {
      const flux = new Flux();
      const messageStore = flux.getStore('messages');
      const messageActions = flux.getActions('messages');

      expect(messageStore.state).to.deep.equal({});

      messageActions.newMessage('Hello, world!');
      expect(messageStore.state).to.deep.equal({
        [0]: {
          content: 'Hello, world!',
          id: 0,
        },
      });
    });
  });

});
