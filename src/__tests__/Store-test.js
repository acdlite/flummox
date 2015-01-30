'use strict';

import Store from '../Store';
import sinon from 'sinon';

describe('Store', () => {
  class ExampleStore extends Store {}

  describe('#getState()', () => {

    let s = new ExampleStore({ foo: 'bar' });

    it('returns state object', () => {
      expect(s.getState()).to.deep.equal({ foo: 'bar' });
    });

    it('prevents mutations of state object', () => {
      let state = s.getState();
      state.foo = 'changed';

      expect(s.getState()).to.deep.equal({ foo: 'bar' })
    });
  });

  describe('#register()', () => {
    it('adds handler to internal collection of handlers', () => {
      let store = new ExampleStore();
      let handler = sinon.spy();
      let actionId = Symbol('fake action constant');
      store.register(actionId, handler);

      let mockArgs = ['foo', 'bar'];
      store._handlers.get(actionId)(...mockArgs);

      expect(handler.calledWith(...mockArgs)).to.be.true;
    });

    it('binds handler to store', () => {
      let store = new ExampleStore();
      store.foo = 'bar';

      function handler() {
        return this.foo;
      }

      let actionId = Symbol('fake action constant');
      store.register(actionId, handler);

      expect(store._handlers.get(actionId)()).to.equal('bar');
    });

  });

  describe('#handler()', () => {
    it('delegates dispatches to registered handlers', () => {
      let store = new ExampleStore();
      let handler = sinon.spy();
      let actionId = Symbol('fake action constant');
      store.register(actionId, handler);

      // Simulate dispatch
      let body = { foo: 'bar' };
      store.handler({ body, actionId });

      expect(handler.calledWith(body, actionId)).to.be.true;
    });
  });

});
