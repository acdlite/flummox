'use strict';

import { Store, Flux, Actions } from '../Flux';
import sinon from 'sinon';

describe('Store', () => {
  class ExampleStore extends Store {
    constructor() {
      super();
      this.state = { foo: 'bar' };
    }
  }

  let actionId = 'actionId';

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
      store._handlers[actionId](...mockArgs);

      expect(handler.calledWith(...mockArgs)).to.be.true;
    });

    it('binds handler to store', () => {
      let store = new ExampleStore();
      store.foo = 'bar';

      function handler() {
        return this.foo;
      }

      store.register(actionId, handler);

      expect(store._handlers[actionId]()).to.equal('bar');
    });

    it('accepts actions instead of action ids', () => {
      class ExampleActions extends Actions {
        getFoo() {
          return 'foo';
        }
      }

      let actions = new ExampleActions();
      let store = new ExampleStore();
      let handler = sinon.spy();
      store.register(actions.getFoo, handler);

      let mockArgs = ['foo', 'bar'];
      store._handlers[actions.getFoo._id](...mockArgs);

      expect(handler.calledWith(...mockArgs)).to.be.true;
    });

  });

  describe('#registerAsync()', () => {
    it('registers handlers for begin, success, and failure of async action', async function() {
      let error = new Error();

      class ExampleActions extends Actions {
        async getFoo(message, success = true) {
          if (!success) throw error;

          return message + ' success';
        }

        async getBar(message) {
          return message;
        }
      }

      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', ExampleActions);
          this.createStore('example', ExampleStore);
        }
      }

      let flux = new ExampleFlux();
      let actions = flux.getActions('example');
      let store = flux.getStore('example');


      let handler = sinon.spy();
      store.register(actions.getBar, handler);

      await actions.getBar('bar');
      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args).to.deep.equal(['bar']);

      let begin = sinon.spy();
      let success = sinon.spy();
      let failure = sinon.spy();
      store.registerAsync(actions.getFoo, begin, success, failure);

      await actions.getFoo('foo', true);
      expect(begin.calledOnce).to.be.true;
      expect(begin.firstCall.args).to.deep.equal(['foo', true]);
      expect(success.calledOnce).to.be.true;
      expect(success.firstCall.args[0]).to.equal('foo success');
      expect(failure.called).to.be.false;

      try {
        await actions.getFoo('bar', false);
      } catch (e) {

      } finally {
        expect(begin.calledTwice).to.be.true;
        expect(success.calledOnce).to.be.true;
        expect(failure.calledOnce).to.be.true;
        expect(failure.firstCall.args[0]).to.equal(error);
      }
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

      expect(handler.calledWith(body)).to.be.true;
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

      store.setState({ bar: 'baz' });

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

    it('warns if called from outside an action handler', () => {
      let store = new ExampleStore();
      let warn = sinon.spy(console, 'warn');

      store.setState({ foo: 'bar' });

      expect(warn.firstCall.args[0]).to.equal(
        'Store#setState() called from outside an action handler. This is '
      + 'likely a mistake. Flux stores should manage their own state.'
      );

      console.warn.restore();
    });
  });

  describe('#replaceState()', () => {
    it('replaces old state with new state', () => {
      let store = new ExampleStore();

      store.replaceState({ bar: 'baz' });

      expect(store.state).to.deep.equal({
        bar: 'baz',
      });
    });

    it('batches multiple state updates within action handler', () => {
      let store = new ExampleStore();
      let listener = sinon.spy();
      store.addListener('change', listener);

      store.register(actionId, function() {
        this.replaceState({ bar: 'baz' });

        expect(this.state).to.deep.equal({ foo: 'bar' });
        expect(listener.called).to.be.false;

        this.setState({ foo: 'bar' });
        this.replaceState({ baz: 'foo' });
      });

      // Simulate dispatch
      store.handler({ actionId, body: 'foobar' });

      expect(listener.calledOnce).to.be.true;
      expect(store.state).to.deep.equal({ baz: 'foo' });
    });

    it('emits change event', () => {
      let store = new ExampleStore();
      let listener = sinon.spy();
      store.addListener('change', listener);

      store.replaceState({ foo: 'bar' });

      expect(listener.calledOnce).to.be.true;
    });
  });

});
