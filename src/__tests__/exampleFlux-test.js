'use strict';

import { Flummox, Store, Actions } from '../Flux';
import { TestActions } from '../addons/TestUtils';

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

        let messageActions = flux.getActions('messages');
        this.register(messageActions.newMessage, this.handleNewMessage);
        this.messageCounter = 0;

        this.state = {};
      }

      handleNewMessage(content) {
        let id = this.messageCounter++;

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
      let flux = new Flux();
      let messageStore = flux.getStore('messages');
      let messageActions = flux.getActions('messages');

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

  /**
   * An example testing using the TestActions util
   */
  describe('MessageStore async', () => {
    class MessageStore extends Store {

      // Note that passing a flux instance to the constructor is not required;
      // we do it here so we have access to any action ids we're interested in.
      constructor(flux) {

        // Don't forget to call the super constructor
        super();

        let messageActions = flux.getActions('messages');

        this.registerAsync(
          messageActions.newMessage, 
          this.handleNewMessageBegin,
          this.handleNewMessageComplete,
          this.handleNewMessageFailed
        );

        this.register(messageActions.clear, this.handleClearMessages);

        this.messageCounter = 0;
        this.state = {
          saving: false,
          messages: {}
        };
      }

      handleClearMessages() {
        this.replaceState({
          saving: false,
          messages: {}
        });
      }

      handleNewMessageBegin() {
        this.setState({
          saving: true,
          error: null
        });
      }

      handleNewMessageComplete(content) {
        let state = this.getState();
        let id = this.messageCounter++;

        state.saving = false;
        state.messages[id] = { id, content };

        this.setState(state);
      }

      handleNewMessageFailed(error) {
        this.setState({
          saving: false,
          error: error
        });
      }
    }

    describe('#newMessage action', () => {
      beforeEach(function() {
        this.flux = new Flummox();
        this.messageActions = this.flux.createActions('messages', TestActions(['newMessage'], {
          clear: true
        }));
        this.messageStore = this.flux.createStore('messages', MessageStore, this.flux);
      });

      it('sets saving true', function () {
        let action = this.messageActions.newMessage();
        expect(this.messageStore.state.saving).to.be.true;
      });

      it('creates new message on success', function () {
        let action = this.messageActions.newMessage();
        action.success('Hello, world!');

        expect(this.messageStore.state.saving).to.be.false;
        expect(this.messageStore.state.messages).to.deep.equal({
          [0]: {
            content: 'Hello, world!',
            id: 0,
          },
        });
      });

      it('sets error on failure', function () {
        let action = this.messageActions.newMessage();
        action.fail('failed to create message.');
        
        expect(this.messageStore.state.saving).to.be.false;
        expect(this.messageStore.state.error).to.equal('failed to create message.');
      });

      it('clears messages', function () {
        let action = this.messageActions.newMessage();
        action.success('Hello, world!');

        this.messageActions.clear();

        expect(this.messageStore.state.saving).to.be.false;
        expect(this.messageStore.state.messages).to.deep.equal({});
      });
    });
  });

});
