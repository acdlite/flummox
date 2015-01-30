'use strict';

import { Flux, Store, Actions } from '../Flux';

describe('Examples:', () => {

  it('Messages', () => {
    let flux = new Flux();

    class MessageActions extends Actions {
      newMessage(content) {
        return content;
      }
    }

    let messageActions = new MessageActions();
    flux.addActions('MessageActions', messageActions);
    let messageActionIds = flux.getActionIds('MessageActions');

    class MessageStore extends Store {
      constructor() {
        super({
          messages: {},
        });

        this.messageCounter = 0;

        this.register(messageActionIds.newMessage, this.handleNewMessage);
      }

      handleNewMessage(content) {
        let id = this.messageCounter++;

        this.state.messages[id] = {
          content,
          id,
        };

        this.emit('change');
      }
    }

    let messageStore = new MessageStore();
    flux.addStore('MessageStore', messageStore);

    expect(messageStore.getState().messages).to.deep.equal({});

    messageActions.newMessage('Hello, world!');
    expect(messageStore.getState().messages).to.deep.equal({
      [0]: {
        content: 'Hello, world!',
        id: 0,
      },
    });
  });

});
