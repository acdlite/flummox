import { Store, Flux, Actions } from '../Flux';
import sinon from 'sinon';

describe('Store', () => {
  class ExampleStore extends Store {
    constructor() {
      super();
      this.state = { foo: 'bar' };
    }
  }

  const actionId = 'actionId';

  describe('#register()', () => {
    it('adds handler to internal collection of handlers', () => {
      const store = new ExampleStore();
      const handler = sinon.spy();
      store.register(actionId, handler);

      const mockArgs = ['foo', 'bar'];
      store._handlers[actionId](...mockArgs);

      expect(handler.calledWith(...mockArgs)).to.be.true;
    });

    it('binds handler to store', () => {
      const store = new ExampleStore();
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

      const actions = new ExampleActions();
      const store = new ExampleStore();
      const handler = sinon.spy();
      store.register(actions.getFoo, handler);

      const mockArgs = ['foo', 'bar'];
      store._handlers[actions.getFoo._id](...mockArgs);

      expect(handler.calledWith(...mockArgs)).to.be.true;
    });

    it('ignores non-function handlers', () => {
      const store = new ExampleStore();
      expect(store.register.bind(store, null)).not.to.throw();
    });

  });

  it('default state is null', () => {
    const store = new Store();
    expect(store.state).to.be.null;
  });

  describe('#registerAsync()', () => {
    it('registers handlers for begin, success, and failure of async action', async function() {
      const error = new Error();

      class ExampleActions extends Actions {
        async getFoo(message, _success = true) {
          if (!_success) throw error;

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

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      const handler = sinon.spy();
      store.register(actions.getBar, handler);

      await actions.getBar('bar');
      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args).to.deep.equal(['bar']);

      const begin = sinon.spy();
      const success = sinon.spy();
      const failure = sinon.spy();
      store.registerAsync(actions.getFoo, begin, success, failure);

      await actions.getFoo('foo', true);
      expect(begin.calledOnce).to.be.true;
      expect(begin.firstCall.args).to.deep.equal(['foo', true]);
      expect(success.calledOnce).to.be.true;
      expect(success.firstCall.args[0]).to.equal('foo success');
      expect(failure.called).to.be.false;

      await expect(actions.getFoo('bar', false)).to.be.rejected;

      expect(begin.calledTwice).to.be.true;
      expect(success.calledOnce).to.be.true;
      expect(failure.calledOnce).to.be.true;
      expect(failure.firstCall.args[0]).to.equal(error);
    });

    it('ignores non-function handlers', () => {
      const store = new ExampleStore();
      expect(store.registerAsync.bind(store, null)).not.to.throw();
    });
  });

  describe('#registerAll()', () => {
    it('adds handler to internal collection of "catch all" handlers', () => {
      const store = new ExampleStore();
      const handler = sinon.spy();
      store.registerAll(handler);

      const mockArgs = ['foo', 'bar'];
      store._catchAllHandlers[0](...mockArgs);

      expect(handler.calledWith(...mockArgs)).to.be.true;
    });

    it('adds multiple handlers to internal collection of "catch all" handlers', () => {
      const store = new ExampleStore();
      const handler1 = sinon.spy();
      const handler2 = sinon.spy();
      store.registerAll(handler1);
      store.registerAll(handler2);

      const mockArgs = ['foo', 'bar'];
      store._catchAllHandlers[0](...mockArgs);
      store._catchAllHandlers[1](...mockArgs);

      expect(handler1.calledWith(...mockArgs)).to.be.true;
      expect(handler2.calledWith(...mockArgs)).to.be.true;
    });

    it('binds handler to store', () => {
      const store = new ExampleStore();
      store.foo = 'bar';

      function handler() {
        return this.foo;
      }

      store.registerAll(handler);

      expect(store._catchAllHandlers[0]()).to.equal('bar');
    });

    it('accepts actions instead of action ids', () => {
      class ExampleActions extends Actions {
        getFoo() {
          return 'foo';
        }
      }

      const actions = new ExampleActions();
      const store = new ExampleStore();
      const handler = sinon.spy();
      store.registerAll(handler);

      const mockArgs = ['foo', 'bar'];
      store._catchAllHandlers[0](...mockArgs);

      expect(handler.calledWith(...mockArgs)).to.be.true;
    });

    it('ignores non-function handlers', () => {
      const store = new ExampleStore();
      expect(store.registerAll.bind(store, null)).not.to.throw();
    });

  });

  describe('#registerAllAsync()', () => {
    it('registers "catch all" handlers for begin, success, and failure of async action', async function() {
      const error = new Error();

      class ExampleActions extends Actions {
        async getFoo(message, _success = true) {
          if (!_success) throw error;

          return message + ' success';
        }

        async getBar(message, _success = true) {
          if (!_success) throw error;

          return message + ' success';
        }
      }

      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', ExampleActions);
          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      const begin = sinon.spy();
      const success = sinon.spy();
      const failure = sinon.spy();
      store.registerAllAsync(begin, success, failure);

      await actions.getFoo('foo', true);
      expect(begin.calledOnce).to.be.true;
      expect(begin.firstCall.args).to.deep.equal(['foo', true]);
      expect(success.calledOnce).to.be.true;
      expect(success.firstCall.args[0]).to.equal('foo success');
      expect(failure.called).to.be.false;

      await expect(actions.getFoo('bar', false)).to.be.rejected;
      expect(begin.calledTwice).to.be.true;
      expect(success.calledOnce).to.be.true;
      expect(failure.calledOnce).to.be.true;
      expect(failure.firstCall.args[0]).to.equal(error);

      await actions.getBar('foo', true);
      expect(begin.calledThrice).to.be.true;
      expect(begin.thirdCall.args).to.deep.equal(['foo', true]);
      expect(success.calledTwice).to.be.true;
      expect(success.secondCall.args[0]).to.equal('foo success');
      expect(failure.calledTwice).to.be.false;

      await expect(actions.getBar('bar', false)).to.be.rejected;
      expect(begin.callCount).to.equal(4);
      expect(success.calledTwice).to.be.true;
      expect(failure.calledTwice).to.be.true;
      expect(failure.secondCall.args[0]).to.equal(error);
    });

    it('ignores non-function handlers', () => {
      const store = new ExampleStore();
      expect(store.registerAsync.bind(store, null)).not.to.throw();
    });
  });

  describe('#handler()', () => {
    it('delegates dispatches to registered handlers', () => {
      const store = new ExampleStore();
      const handler = sinon.spy();
      store.register(actionId, handler);

      // Simulate dispatch
      const body = { foo: 'bar' };
      store.handler({ body, actionId });

      expect(handler.calledWith(body)).to.be.true;
    });

    it('delegates dispatches to registered "catch all" handlers', () => {
      const store = new ExampleStore();
      const handler = sinon.spy();
      const actionIds = ['actionId1', 'actionId2'];
      store.registerAll(handler);

      // Simulate dispatch
      const body = { foo: 'bar' };
      store.handler({ body, actionId: actionIds[0] });
      store.handler({ body, actionId: actionIds[1] });

      expect(handler.calledWith(body)).to.be.true;
      expect(handler.calledTwice).to.be.true;
    });
  });

  describe('#waitFor()', () => {
    it('waits for other stores', () => {
      const flux = new Flux();
      const result = [];

      let store2;

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
          });
        }
      }

      flux.createStore('store1', Store1);
      flux.createStore('store2', Store2);

      store2 = flux.getStore('store2');

      flux.dispatch(actionId, 'foobar');

      expect(result).to.deep.equal([2, 1]);
    });
  });

  describe('#forceUpdate()', () => {
    it('emits change event', () => {
      const store = new ExampleStore();
      const listener = sinon.spy();
      store.addListener('change', listener);

      store.forceUpdate();

      expect(listener.calledOnce).to.be.true;
    });

    it('doesn\'t modify existing state', () => {
      const store = new ExampleStore();
      const listener = sinon.spy();
      store.addListener('change', listener);

      store.register(actionId, function() {
        this.replaceState({ bar: 'baz' });
        this.forceUpdate();

        expect(this.state).to.deep.equal({ foo: 'bar' });
        expect(listener.called).to.be.false;

        this.setState({ foo: 'bar' });
        this.forceUpdate();
        this.replaceState({ baz: 'foo' });
      });

      // Simulate dispatch
      store.handler({ actionId, body: 'foobar' });

      expect(listener.calledOnce).to.be.true;
      expect(store.state).to.deep.equal({ baz: 'foo' });
    });
  });

  describe('#setState()', () => {
    it('shallow merges old state with new state', () => {
      const store = new ExampleStore();

      store.setState({ bar: 'baz' });

      expect(store.state).to.deep.equal({
        foo: 'bar',
        bar: 'baz',
      });
    });

    it('supports transactional updates', () => {
      const store = new Store();
      store.state = { a: 1 };
      store.setState(state => ({ a: state.a + 1 }));
      expect(store.state.a).to.equal(2);
      store.setState(state => ({ a: state.a + 1 }));
      expect(store.state.a).to.equal(3);
      store.setState(state => ({ a: state.a + 1 }));
      expect(store.state.a).to.equal(4);
    });

    it('emits change event', () => {
      const store = new ExampleStore();
      const listener = sinon.spy();
      store.addListener('change', listener);

      store.setState({ foo: 'bar' });

      expect(listener.calledOnce).to.be.true;
    });

    it('batches multiple state updates within action handler', () => {
      const store = new ExampleStore();
      const listener = sinon.spy();
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

  describe('#replaceState()', () => {
    it('replaces old state with new state', () => {
      const store = new ExampleStore();

      store.replaceState({ bar: 'baz' });

      expect(store.state).to.deep.equal({
        bar: 'baz',
      });
    });

    it('batches multiple state updates within action handler', () => {
      const store = new ExampleStore();
      const listener = sinon.spy();
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
      const store = new ExampleStore();
      const listener = sinon.spy();
      store.addListener('change', listener);

      store.replaceState({ foo: 'bar' });

      expect(listener.calledOnce).to.be.true;
    });
  });

  describe('.assignState', () => {
    it('can be overridden to enable custom state types', () => {
      class StringStore extends Store {
        static assignState(prevState, nextState) {
          return [prevState, nextState]
            .filter(state => typeof state === 'string')
            .join('');
        }
      }

      const store = new StringStore();

      expect(store.state).to.be.null;
      store.setState('a');
      expect(store.state).to.equal('a');
      store.setState('b');
      expect(store.state).to.equal('ab');
      store.replaceState('xyz');
      expect(store.state).to.equal('xyz');
      store.setState('zyx');
      expect(store.state).to.equal('xyzzyx');
    });
  });

  describe('#getStateAsObject()', () => {
    it('returns the current state as an object', () => {
      const store = new Store();
      store.setState({ foo: 'bar', bar: 'baz' });
      expect(store.getStateAsObject()).to.deep.equal({ foo: 'bar', bar: 'baz' });
    });
  });

  describe('#forceUpdate()', () => {
    it('emits change event', () => {
      const store = new ExampleStore();
      const listener = sinon.spy();
      store.addListener('change', listener);

      store.forceUpdate();

      expect(listener.calledOnce).to.be.true;
    });

    it('doesn\'t modify existing state', () => {
      const store = new ExampleStore();
      const listener = sinon.spy();
      store.addListener('change', listener);

      store.register(actionId, function() {
        this.replaceState({ bar: 'baz' });
        this.forceUpdate();

        expect(this.state).to.deep.equal({ foo: 'bar' });
        expect(listener.called).to.be.false;

        this.setState({ foo: 'bar' });
        this.forceUpdate();
        this.replaceState({ baz: 'foo' });
      });

      // Simulate dispatch
      store.handler({ actionId, body: 'foobar' });

      expect(listener.calledOnce).to.be.true;
      expect(store.state).to.deep.equal({ baz: 'foo' });
    });
  });

});
