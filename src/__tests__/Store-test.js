'use strict';

import { Store, Flux } from '../Flux';
import sinon from 'sinon';

describe('Store', () => {
  class ExampleStore extends Store {
    constructor() {
      super();
      this.state = { foo: 'bar' };
    }
  }

  let actionId = Symbol('fake action id');

  describe('#getState()', () => {

    let s = new ExampleStore();

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

      store.register(actionId, handler);

      expect(store._handlers.get(actionId)()).to.equal('bar');
    });

  });

  describe('#handler()', () => {
    it('delegates dispatches to registered handlers', () => {
      let store = new ExampleStore();
      let handler = sinon.spy();
      store.register(actionId, handler);

      // Simulate dispatch
      let body = { foo: 'bar' };
      store.handler({ body, actionId });

      expect(handler.calledWith(body, actionId)).to.be.true;
    });
  });

  describe('#waitFor()', () => {
    it('waits for other stores', () => {
      let flux = new Flux();
      let result = [];

      class Store1 extends Store {
        constructor() {
          super();

          this.register(actionId, function() {
            this.waitFor(store2);
            result.push(1);
          });
        }
      }

      class Store2 extends Store {
        constructor() {
          super();

          this.register(actionId, () => {
            result.push(2);
          })
        }
      }

      flux.createStore('store1', Store1);
      flux.createStore('store2', Store2);

      let store2 = flux.getStore('store2');

      flux.dispatch(actionId, 'foobar');

      expect(result).to.deep.equal([2, 1]);
    });
  });

  describe('#setState()', () => {
    it('shallow merges old state with new state', () => {
      let store = new ExampleStore();

      store.register(actionId, function(body) {
        this.setState({ bar: body });
      });

      // Simulate dispatch
      store.handler({ actionId, body: 'baz' });

      expect(store.state).to.deep.equal({
        foo: 'bar',
        bar: 'baz',
      });
    });

    it('emits change event', () => {
      let store = new ExampleStore();
      let listener = sinon.spy();
      store.addListener('change', listener);

      store.setState({ foo: 'bar' });

      expect(listener.calledOnce).to.be.true;
    });

    it('batches multiple state updates within action handler', () => {
      let store = new ExampleStore();
      let listener = sinon.spy();
      store.addListener('change', listener);

      store.register(actionId, function() {
        this.setState({ bar: 'baz' });

        expect(this.state).to.deep.equal({ foo: 'bar' });
        expect(listener.called).to.be.false;

        this.setState({ baz: 'foo' });
      });

      // Simulate dispatch
      store.handler({ actionId, body: 'foobar' });

      expect(listener.calledOnce).to.be.true;
      expect(store.state).to.deep.equal({ foo: 'bar', bar: 'baz', baz: 'foo' });
    });
  });

});
