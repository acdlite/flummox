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
    it('registers handler to respond to sync action', () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      const handler = sinon.spy();
      store.register(actions.foo, handler);

      actions.foo('do');
      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args[1].body).to.equal('do');

      actions.foo('re');
      expect(handler.calledTwice).to.be.true;
      expect(handler.secondCall.args[1].body).to.equal('re');
    });

    it('registers handler to respond to async action success', async () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            async foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      const handler = sinon.spy();
      store.register(actions.foo, handler);

      await actions.foo('do');
      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args[1].body).to.equal('do');

      await actions.foo('re');
      expect(handler.calledTwice).to.be.true;
      expect(handler.secondCall.args[1].body).to.equal('re');
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
      expect(handler.firstCall.args[1].body).to.equal('bar');

      const begin = sinon.spy();
      const success = sinon.spy();
      const failure = sinon.spy();
      store.registerAsync(actions.getFoo, begin, success, failure);

      await actions.getFoo('foo', true);
      expect(begin.calledOnce).to.be.true;
      expect(begin.firstCall.args[1].async).to.equal('begin');
      expect(success.calledOnce).to.be.true;
      expect(success.firstCall.args[1].body).to.equal('foo success');
      expect(failure.called).to.be.false;

      await expect(actions.getFoo('bar', false)).to.be.rejected;

      expect(begin.calledTwice).to.be.true;
      expect(success.calledOnce).to.be.true;
      expect(failure.calledOnce).to.be.true;
      expect(failure.firstCall.args[1].error).to.equal(error);
    });

    it('ignores non-function handlers', () => {
      const store = new ExampleStore();
      expect(store.registerAsync.bind(store, null)).not.to.throw();
    });
  });

  describe('#registerAll()', () => {
    it('registers handler to respond to all sync actions', () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      const handler = sinon.spy();
      store.registerAll(handler);

      actions.foo('do');
      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args[1].body).to.equal('do');

      actions.foo('re');
      expect(handler.calledTwice).to.be.true;
      expect(handler.secondCall.args[1].body).to.equal('re');
    });

    it('registers handler to respond to all async action successes', async () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            async foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      const handler = sinon.spy();
      store.registerAll(handler);

      await actions.foo('do');
      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args[1].body).to.equal('do');

      await actions.foo('re');
      expect(handler.calledTwice).to.be.true;
      expect(handler.secondCall.args[1].body).to.equal('re');
    });

    it('ignores non-function handlers', () => {
      const store = new ExampleStore();
      expect(store.registerAll.bind(store, null)).not.to.throw();
    });

    it('registers for all successful async actions', async function() {
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

      const handler = sinon.spy();
      store.registerAll(handler);

      await actions.getBar('bar');
      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args[1].body).to.equal('bar success');
    });

  });

  describe('#registerAllAsync()', () => {
    it('registers generic handlers for begin, success, and failure of async action', async function() {
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
      expect(begin.firstCall.args[1].async).to.equal('begin');
      expect(success.calledOnce).to.be.true;
      expect(success.firstCall.args[1].body).to.equal('foo success');
      expect(failure.called).to.be.false;

      await expect(actions.getFoo('bar', false)).to.be.rejected;
      expect(begin.calledTwice).to.be.true;
      expect(success.calledOnce).to.be.true;
      expect(failure.calledOnce).to.be.true;
      expect(failure.firstCall.args[1].error).to.equal(error);

      await actions.getBar('foo', true);
      expect(begin.calledThrice).to.be.true;
      expect(begin.thirdCall.args[1].async).to.equal('begin');
      expect(success.calledTwice).to.be.true;
      expect(success.secondCall.args[1].body).to.equal('foo success');
      expect(failure.calledTwice).to.be.false;

      await expect(actions.getBar('bar', false)).to.be.rejected;
      expect(begin.callCount).to.equal(4);
      expect(success.calledTwice).to.be.true;
      expect(failure.calledTwice).to.be.true;
      expect(failure.secondCall.args[1].error).to.equal(error);
    });

    it('ignores non-function handlers', () => {
      const store = new ExampleStore();
      expect(store.registerAsync.bind(store, null)).not.to.throw();
    });
  });

  describe('#registerMatch', () => {
    it('registers handler that is called when matching function returns true for dispatcher payload', () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      const handler = sinon.spy();
      store.registerMatch(
        payload => payload.body === 'match!',
        handler
      );

      actions.foo('match!');
      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args[1].body).to.equal('match!');

      actions.foo('not a match!');
      expect(handler.calledOnce).to.be.true;
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

  describe('action handlers', () => {

    it('receive `body`, `payload` and `prevState` arguments when they accept 3 arguments', () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      // using a function to inspect arguments
      store.registerAll(function (body, payload, prevState) {
        expect(arguments.length).to.equal(3);
        expect(body).to.equal('foo');
        expect(payload.body).to.equal('foo');
        expect(prevState).to.equal(store._pendingState);
      });

      actions.foo('foo');
    });

    it('receive `payload` and `prevState` arguments when they accept 2 arguments', () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      // using a function to inspect arguments
      store.registerAll(function (payload, prevState) {
        expect(arguments.length).to.equal(2);
        expect(payload.body).to.equal('foo');
        expect(prevState).to.equal(store._pendingState);
      });

      actions.foo('foo');
    });

    it('can trigger a `setState` by returning an object', () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      store.registerAll(({body}, prevState) => {
        return {
          foo: body + prevState.foo
        };
      });

      actions.foo('foo');
      expect(store.state.foo).to.equal('foobar');
    });

    it('do not trigger a `setState` when not returning an object', () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      const invalid = [
        'testing',
        [1, 2, 3],
        /test/,
        new Date(),
        true,
        false,
        null
      ];

      invalid.forEach((invalidReturn) => {
        store.registerAll(({body}, prevState) => {
          return invalidReturn;
        });
      });

      actions.foo('foo');
      expect(store.state.foo).to.equal('bar');
    });

    it('receive always the latest state object', () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      store.registerAll(({body}, prevState) => {
        return {
          foo: body + prevState.foo
        };
      });

      store.registerAll(({body}, prevState) => {
        expect(prevState.foo).to.equal('foobar');
        return {
          foo: 'test' + prevState.foo
        };
      });

      actions.foo('foo');
      expect(store.state.foo).to.equal('testfoobar');
    });

    it('`setState` calls are additive', () => {
      class ExampleFlux extends Flux {
        constructor() {
          super();
          this.createActions('example', {
            foo(something) {
              return something;
            }
          });

          this.createStore('example', ExampleStore);
        }
      }

      const flux = new ExampleFlux();
      const actions = flux.getActions('example');
      const store = flux.getStore('example');

      store.registerAll(({body}, prevState) => {
        return {
          foo: prevState.foo + body
        };
      });

      store.registerAll(({body}, prevState) => {
        return {
          foo: prevState.foo + body
        };
      });

      store.registerAll(({body}, prevState) => {
        return {
          foo: prevState.foo + 42
        };
      });

      actions.foo('foo');
      expect(store.state.foo).to.equal('barfoofoo42');
    });

  });

});
