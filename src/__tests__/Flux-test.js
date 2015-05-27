import { Flux, Store, Actions } from '../Flux';
import sinon from 'sinon';

function createSerializableStore(serializedState) {
  return class SerializableStore extends Store {
    static serialize() {
      return serializedState;
    }
    static deserialize(stateString) {
      return {
        stateString,
        deserialized: true
      };
    }
  };
}

describe('Flux', () => {

  describe('#createStore()', () => {
    it('throws if key already exists', () => {
      const flux = new Flux();
      class TestStore extends Store {}

      flux.createStore('ExampleStore', TestStore);
      expect(flux.createStore.bind(flux, 'ExampleStore', TestStore)).to.throw(
        'You\'ve attempted to create multiple stores with key ExampleStore. '
      + 'Keys must be unique.'
      );
    });

    it('throws if Store is not a prototype of class', () => {
      const flux = new Flux();
      class ForgotToExtendStore {}

      expect(flux.createStore.bind(flux, 'Flux', ForgotToExtendStore)).to.throw(
        'You\'ve attempted to create a store from the class '
      + 'ForgotToExtendStore, which does not have the base Store class in its '
      + 'prototype chain. Make sure you\'re using the `extends` keyword: '
      + '`class ForgotToExtendStore extends Store { ... }`'
      );
    });

    it('registers store\'s handler with central dispatcher', () => {
      class ExampleStore extends Store {}

      const spy1 = sinon.spy();
      const spy2 = sinon.spy();

      ExampleStore.prototype.foo = 'bar';
      ExampleStore.prototype.handler = function(_payload) {
        spy1(_payload);
        spy2(this.foo);
      };

      const flux = new Flux();
      flux.createStore('ExampleStore', ExampleStore);

      const payload = 'foobar';
      flux.dispatch('actionId', payload);
      expect(spy1.getCall(0).args[0].body).to.equal('foobar');
      expect(spy2.calledWith('bar')).to.be.true;
    });

    it('returns the created store instance', () => {
      class ExampleStore extends Store {}

      const flux = new Flux();
      const store = flux.createStore('ExampleStore', ExampleStore);
      expect(store).to.be.an.instanceOf(ExampleStore);
    });
  });

  describe('#getStore()', () => {
    it('retrieves store for key', () => {
      const flux = new Flux();
      class TestStore extends Store {}

      flux.createStore('ExampleStore', TestStore);
      expect(flux.getStore('ExampleStore')).to.be.an.instanceOf(Store);
      expect(flux.getStore('NonexistentStore')).to.be.undefined;
    });
  });

  describe('#removeStore()', () => {
    it('throws if key does not exist', () => {
      const flux = new Flux();
      class TestStore extends Store {}

      flux.createStore('ExampleStore', TestStore);
      expect(flux.removeStore.bind(flux, 'NonexistentStore')).to.throw(
        'You\'ve attempted to remove store with key NonexistentStore which does not exist.'
      );
    });

    it('deletes store instance', () => {
      const flux = new Flux();
      class TestStore extends Store {}

      let store = flux.createStore('ExampleStore', TestStore);
      expect(flux.dispatcher.$Dispatcher_callbacks[store._token]).to.be.function;
      flux.removeStore('ExampleStore');
      expect(flux._stores.ExampleStore).to.be.undefined;
      expect(flux.dispatcher.$Dispatcher_callbacks[store._token]).to.be.undefined;
    });
  });

  describe('#createActions()', () => {
    it('throws if key already exists', () => {
      class TestActions extends Actions {}

      const flux = new Flux();
      flux.createActions('ExampleActions', TestActions);

      expect(flux.createActions.bind(flux, 'ExampleActions', Actions)).to.throw(
        'You\'ve attempted to create multiple actions with key ExampleActions. '
      + 'Keys must be unique.'
      );
    });

    it('throws if Actions is a class without base Actions class in its prototype chain', () => {
      const flux = new Flux();
      class ForgotToExtendActions {}

      expect(flux.createActions.bind(flux, 'Flux', ForgotToExtendActions))
        .to.throw(
          'You\'ve attempted to create actions from the class '
        + 'ForgotToExtendActions, which does not have the base Actions class '
        + 'in its prototype chain. Make sure you\'re using the `extends` '
        + 'keyword: `class ForgotToExtendActions extends Actions { ... }`'
      );
    });

    it('accepts plain old JavaScript object', () => {
      const flux = new Flux();

      flux.createActions('foobar', {
        foo() {
          return 'bar';
        },

        bar() {
          return 'baz';
        }
      });

      expect(flux.getActions('foobar')).to.be.an.instanceof(Actions);
      expect(flux.getActions('foobar').foo()).to.equal('bar');
      expect(flux.getActions('foobar').bar()).to.equal('baz');
    });

    it('returns the created action\'s instance', () => {
      class TestActions extends Actions {}

      const flux = new Flux();
      const actions = flux.createActions('TestActions', TestActions);
      expect(actions).to.be.an.instanceOf(TestActions);
    });
  });

  describe('#getActions()', () => {
    class TestActions extends Actions {}

    it('retrieves actions for key', () => {
      const flux = new Flux();
      flux.createActions('TestActions', TestActions);

      expect(flux.getActions('TestActions')).to.be.an.instanceOf(Actions);
      expect(flux.getActions('NonexistentActions')).to.be.undefined;
    });

  });

  describe('#getActionIds() / #getConstants()', () => {
    class TestActions extends Actions {
      getFoo() {}
    }

    it('retrives ids of actions for key', () => {
      const flux = new Flux();
      flux.createActions('TestActions', TestActions);

      expect(flux.getActionIds('TestActions').getFoo).to.be.a('string');
      expect(flux.getActionIds('NonexistentActions')).to.be.undefined;

      expect(flux.getConstants('TestActions').getFoo).to.be.a('string');
      expect(flux.getConstants('NonexistentActions')).to.be.undefined;
    });
  });

  describe('#removeActions()', () => {
    it('throws if key does not exist', () => {
      const flux = new Flux();
      class TestActions extends Actions {
      }

      flux.createActions('TestActions', TestActions);
      expect(flux.removeActions.bind(flux, 'NonexistentActions')).to.throw(
        'You\'ve attempted to remove actions with key NonexistentActions which does not exist.'
      );
    });

    it('deletes actions instance', () => {
      const flux = new Flux();
      class TestActions extends Store {
      }

      flux.createStore('TestActions', TestActions);
      flux.removeStore('TestActions');
      expect(flux._actions.TestActions).to.be.undefined;
    });
  });

  describe('#getAllActionIds() / #getAllConstants()', () => {
    class TestFooActions extends Actions {
      getFoo() {}
      getBar() {}
    }

    class TestBarActions extends Actions {
      getFoo() {}
      getBar() {}
    }

    it('retrives ids of all actions', () => {
      let flux = new Flux();
      flux.createActions('TestFooActions', TestFooActions);
      flux.createActions('TestBarActions', TestBarActions);

      expect(flux.getAllActionIds()).to.be.an('array');
      expect(flux.getAllActionIds()[0]).to.be.a('string');
      expect(flux.getAllActionIds()).to.have.length(4);

      expect(flux.getAllConstants()).to.be.an('array');
      expect(flux.getAllConstants()[0]).to.be.a('string');
      expect(flux.getAllConstants()).to.have.length(4);
    });
  });

  describe('#dispatch()', () => {

    it('delegates to dispatcher', () => {
      const flux = new Flux();
      const dispatch = sinon.spy();
      flux.dispatcher = { dispatch };
      const actionId = 'actionId';

      flux.dispatch(actionId, 'foobar');

      expect(dispatch.firstCall.args[0]).to.deep.equal({
        actionId,
        body: 'foobar'
      });
    });

    it('emits dispatch event', () => {
      const flux = new Flux();
      const listener = sinon.spy();

      flux.addListener('dispatch', listener);

      const actionId = 'actionId';

      flux.dispatch(actionId, 'foobar');

      expect(listener.calledOnce).to.be.true;
      expect(listener.firstCall.args[0]).to.deep.equal({
        actionId,
        body: 'foobar'
      });
    });
  });

  describe('#dispatchAsync()', () => {

    it('delegates to dispatcher', async () => {
      const flux = new Flux();
      const dispatch = sinon.spy();
      flux.dispatcher = { dispatch };
      const actionId = 'actionId';

      await flux.dispatchAsync(actionId, Promise.resolve('foobar'));

      expect(dispatch.callCount).to.equal(2);

      expect(dispatch.firstCall.args[0].actionId).to.equal(actionId);
      expect(dispatch.firstCall.args[0].async).to.equal('begin');

      expect(dispatch.secondCall.args[0].actionId).to.equal(actionId);
      expect(dispatch.secondCall.args[0].body).to.equal('foobar');
      expect(dispatch.secondCall.args[0].async).to.equal('success');
    });

    it('adds unique dispatch id to keep track of async actions', async () => {
      const flux = new Flux();
      const dispatch = sinon.spy();
      flux.dispatcher = { dispatch };
      const actionId = 'actionId';

      await flux.dispatchAsync(actionId, Promise.resolve('foobar'));

      expect(dispatch.firstCall.args[0].async).to.equal('begin');
      expect(dispatch.secondCall.args[0].async).to.equal('success');

      expect(dispatch.firstCall.args[0].dispatchId)
        .to.equal(dispatch.secondCall.args[0].dispatchId);

      await flux.dispatchAsync(actionId, Promise.reject(new Error()));

      expect(dispatch.thirdCall.args[0].async).to.equal('begin');
      expect(dispatch.getCall(3).args[0].async).to.equal('failure');

      expect(dispatch.thirdCall.args[0].dispatchId)
        .to.equal(dispatch.getCall(3).args[0].dispatchId);
    });

    it('emits dispatch event', async () => {
      const flux = new Flux();
      const listener = sinon.spy();

      flux.addListener('dispatch', listener);

      const actionId = 'actionId';

      await flux.dispatchAsync(actionId, Promise.resolve('foobar'));

      expect(listener.calledTwice).to.be.true;
      expect(listener.firstCall.args[0].actionId).to.equal(actionId);
      expect(listener.firstCall.args[0].async).to.equal('begin');
      expect(listener.secondCall.args[0].actionId).to.equal(actionId);
      expect(listener.secondCall.args[0].async).to.equal('success');
    });

    it('resolves to value of given promise', done => {
      const flux = new Flux();
      const dispatch = sinon.spy();
      flux.dispatcher = { dispatch };
      const actionId = 'actionId';

      expect(flux.dispatchAsync(actionId, Promise.resolve('foobar')))
        .to.eventually.equal('foobar')
        .notify(done);
    });

    it('dispatches with error if promise rejects', async () => {
      const flux = new Flux();
      const dispatch = sinon.spy();
      flux.dispatcher = { dispatch };
      const actionId = 'actionId';

      const error = new Error('error');

      await flux.dispatchAsync(actionId, Promise.reject(error));

      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.firstCall.args[0].actionId).to.equal(actionId);
      expect(dispatch.firstCall.args[0].async).to.equal('begin');
      expect(dispatch.secondCall.args[0].actionId).to.equal(actionId);
      expect(dispatch.secondCall.args[0].async).to.equal('failure');
      expect(dispatch.secondCall.args[0].error).to.be.an.instanceof(Error);
    });

    it('emit errors that occur as result of dispatch', async () => {
      class ExampleStore extends Store {}

      const flux = new Flux();
      const listener = sinon.spy();
      flux.addListener('error', listener);

      const actionId = 'actionId';
      const store = flux.createStore('example', ExampleStore);

      store.registerAsync(
        actionId,
        null,
        () => {
          throw new Error('success error');
        },
        () => {
          throw new Error('failure error');
        }
      );

      await expect(flux.dispatchAsync(actionId, Promise.resolve('foobar')))
        .to.be.rejectedWith('success error');
      expect(listener.calledOnce).to.be.true;
      expect(listener.firstCall.args[0].message).to.equal('success error');

      await expect(flux.dispatchAsync(actionId, Promise.reject(new Error('foobar'))))
        .to.be.rejectedWith('failure error');
      expect(listener.calledTwice).to.be.true;
      expect(listener.secondCall.args[0].message).to.equal('failure error');
    });

  });

  describe('#removeAllStoreListeners', () => {
    it('removes all listeners from stores', () => {
      class TestStore extends Store {}

      const flux = new Flux();
      const storeA = flux.createStore('storeA', TestStore);
      const storeB = flux.createStore('storeB', TestStore);

      const listener = function() {};

      storeA.addListener('change', listener);
      storeA.addListener('change', listener);
      storeB.addListener('change', listener);
      storeB.addListener('change', listener);

      expect(storeA.listeners('change').length).to.equal(2);
      expect(storeB.listeners('change').length).to.equal(2);

      flux.removeAllStoreListeners();

      expect(storeA.listeners('change').length).to.equal(0);
      expect(storeB.listeners('change').length).to.equal(0);
    });
  });

  describe('#serialize()', () => {

    it('returns state of all the stores as a JSON string', () => {
      const flux = new Flux();

      flux.createStore('foo', createSerializableStore('foo state'));
      flux.createStore('bar', createSerializableStore('bar state'));
      flux.createStore('baz', createSerializableStore('baz state'));

      expect(JSON.parse(flux.serialize())).to.deep.equal({
        foo: 'foo state',
        bar: 'bar state',
        baz: 'baz state'
      });
    });

    it('ignores stores whose classes do not implement .serialize()', () => {
      const flux = new Flux();
      class TestStore extends Store {}

      flux.createStore('foo', createSerializableStore('foo state'));
      flux.createStore('bar', createSerializableStore('bar state'));
      flux.createStore('baz', TestStore);

      expect(JSON.parse(flux.serialize())).to.deep.equal({
        foo: 'foo state',
        bar: 'bar state'
      });
    });

    it('warns if any store classes .serialize() returns a non-string', () => {
      const flux = new Flux();
      const warn = sinon.spy(console, 'warn');

      flux.createStore('foo', createSerializableStore({}));
      flux.serialize();

      expect(warn.firstCall.args[0]).to.equal(
        'The store with key \'foo\' was not serialized because the static '
      + 'method `SerializableStore.serialize()` returned a non-string with '
      + 'type \'object\'.'
      );

      console.warn.restore();
    });

    it('warns and skips stores whose classes do not implement .deserialize()', () => {
      const flux = new Flux();
      const warn = sinon.spy(console, 'warn');

      class TestStore extends Store {
        static serialize() {
          return 'state string';
        }
      }

      flux.createStore('test', TestStore);
      flux.serialize();

      expect(warn.firstCall.args[0]).to.equal(
        'The class `TestStore` has a `serialize()` method, but no '
      + 'corresponding `deserialize()` method.'
      );

      console.warn.restore();
    });
  });

  describe('#deserialize()', () => {

    it('converts a serialized string into state and uses it to replace state of stores', () => {
      const flux = new Flux();

      flux.createStore('foo', createSerializableStore());
      flux.createStore('bar', createSerializableStore());
      flux.createStore('baz', createSerializableStore());

      flux.deserialize(`{
        "foo": "foo state",
        "bar": "bar state",
        "baz": "baz state"
      }`);

      const fooStore = flux.getStore('foo');
      const barStore = flux.getStore('bar');
      const bazStore = flux.getStore('baz');

      expect(fooStore.state.stateString).to.equal('foo state');
      expect(fooStore.state.deserialized).to.be.true;
      expect(barStore.state.stateString).to.equal('bar state');
      expect(barStore.state.deserialized).to.be.true;
      expect(bazStore.state.stateString).to.equal('baz state');
      expect(bazStore.state.deserialized).to.be.true;
    });

    it('warns and skips if passed string is invalid JSON', () => {
      const flux = new Flux();
      class TestStore extends Store {}


      flux.createStore('foo', TestStore);

      expect(flux.deserialize.bind(flux, 'not JSON')).to.throw(
        'Invalid value passed to `Flux#deserialize()`: not JSON'
      );
    });

    it('warns and skips stores whose classes do not implement .serialize()', () => {
      const flux = new Flux();
      const warn = sinon.spy(console, 'warn');

      class TestStore extends Store {
        static deserialize() {
          return {};
        }
      }

      flux.createStore('test', TestStore);
      flux.deserialize('{"test": "test state"}');

      expect(warn.firstCall.args[0]).to.equal(
        'The class `TestStore` has a `deserialize()` method, but no '
      + 'corresponding `serialize()` method.'
      );

      console.warn.restore();
    });

    it('ignores stores whose classes do not implement .deserialize()', () => {
      const flux = new Flux();
      class TestStore extends Store {}

      flux.createStore('foo', createSerializableStore());
      flux.createStore('bar', createSerializableStore());
      flux.createStore('baz', TestStore);

      flux.deserialize(`{
        "foo": "foo state",
        "bar": "bar state",
        "baz": "baz state"
      }`);

      const fooStore = flux.getStore('foo');
      const barStore = flux.getStore('bar');
      const bazStore = flux.getStore('baz');

      expect(fooStore.state.stateString).to.equal('foo state');
      expect(fooStore.state.deserialized).to.be.true;
      expect(barStore.state.stateString).to.equal('bar state');
      expect(barStore.state.deserialized).to.be.true;
      expect(bazStore.state).to.be.null;
    });

  });

});
