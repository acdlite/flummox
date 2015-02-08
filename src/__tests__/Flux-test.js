'use strict';

import { Flux, Store, Actions } from '../Flux';
import sinon from 'sinon';

function createSerializableStore(serializedState, deserializedState) {
  return class SerializableStore extends Store {
    static serialize() {
      return serializedState;
    }

    static deserialize() {
      return deserializedState;
    }
  }
}

// class SerializableStore extends Store {
//
//   constructor(serializedState, deserializedState) {
//     super();
//
//     // Don't actually do this! This is just for testing.
//     this.serializedState = serializedState;
//     this.deserializedState = deserializedState;
//   }
//
//   serialize() {
//     return this.serializedState;
//   }
//
//   deserialize() {
//     return this.deserializedState;
//   }
//
// }

describe('Flux', () => {

  describe('#createStore()', () => {
    it('throws if key already exists', () => {
      let flux = new Flux();
      class TestStore extends Store {}

      flux.createStore('ExampleStore', TestStore);
      expect(flux.createStore.bind(flux, 'ExampleStore', TestStore)).to.throw(
        'You\'ve attempted to create multiple stores with key ExampleStore. '
      + 'Keys must be unique.'
      );
    });

    it('throws if Store is not a prototype of class', () => {
      let flux = new Flux();
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

      let spy1 = sinon.spy();
      let spy2 = sinon.spy();

      ExampleStore.prototype.foo = 'bar';
      ExampleStore.prototype.handler = function(payload) {
        spy1(payload);
        spy2(this.foo);
      };

      let flux = new Flux();
      flux.createStore('ExampleStore', ExampleStore);
      let store = flux.getStore('ExampleStore');

      let payload = 'foobar';
      flux.dispatch('actionId', payload);
      expect(spy1.getCall(0).args[0].body).to.equal('foobar');
      expect(spy2.calledWith('bar')).to.be.true;
    });
  });

  describe('#getStore()', () => {
    it('retrieves store for key', () => {
      let flux = new Flux();
      class TestStore extends Store {}

      flux.createStore('ExampleStore', TestStore);
      expect(flux.getStore('ExampleStore')).to.be.an.instanceOf(Store);
      expect(flux.getStore('NonexistentStore')).to.be.undefined;
    });
  });

  describe('#createActions()', () => {
    it('throws if key already exists', () => {
      class TestActions extends Actions {}

      let flux = new Flux();
      flux.createActions('ExampleActions', TestActions);

      expect(flux.createActions.bind(flux, 'ExampleActions', Actions)).to.throw(
        'You\'ve attempted to create multiple actions with key ExampleActions. '
      + 'Keys must be unique.'
      );
    });

    it('throws if Actions is not a prototype of class', () => {
      let flux = new Flux();
      class ForgotToExtendActions {}

      expect(flux.createActions.bind(flux, 'Flux', ForgotToExtendActions))
        .to.throw(
          'You\'ve attempted to create actions from the class '
        + 'ForgotToExtendActions, which does not have the base Actions class '
        + 'in its prototype chain. Make sure you\'re using the `extends` '
        + 'keyword: `class ForgotToExtendActions extends Actions { ... }`'
      );
    });
  });

  describe('#getActions()', () => {
    class TestActions extends Actions {}

    it('retrieves actions for key', () => {
      let flux = new Flux();
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
      let flux = new Flux();
      flux.createActions('TestActions', TestActions);

      expect(flux.getActionIds('TestActions').getFoo).to.be.a('string');
      expect(flux.getActionIds('NonexistentActions')).to.be.undefined;

      expect(flux.getConstants('TestActions').getFoo).to.be.a('string');
      expect(flux.getConstants('NonexistentActions')).to.be.undefined;
    });
  });

  describe('#dispatch()', () => {

    it('delegates to dispatcher', () => {
      let flux = new Flux();
      let dispatch = sinon.spy();
      flux.dispatcher = { dispatch };
      let actionId = 'actionId';

      flux.dispatch(actionId, 'foobar');

      expect(dispatch.firstCall.args[0]).to.deep.equal({
        actionId,
        body: 'foobar',
      })
    });

  });

  describe('#serialize()', () => {

    it('returns state of all the stores as a JSON string', () => {
      let flux = new Flux();

      flux.createStore('foo', createSerializableStore('foo state'));
      flux.createStore('bar', createSerializableStore('bar state'));
      flux.createStore('baz', createSerializableStore('baz state'));

      expect(JSON.parse(flux.serialize())).to.deep.equal({
        foo: 'foo state',
        bar: 'bar state',
        baz: 'baz state',
      });
    });

    it('ignores stores whose classes do not implement .serialize()', () => {
      let flux = new Flux();
      class TestStore extends Store {}

      flux.createStore('foo', createSerializableStore('foo state'));
      flux.createStore('bar', createSerializableStore('bar state'));
      flux.createStore('baz', TestStore);

      expect(JSON.parse(flux.serialize())).to.deep.equal({
        foo: 'foo state',
        bar: 'bar state',
      });
    });

    it('warns if any store classes .serialize() returns a non-string', () => {
      let flux = new Flux();
      let warn = sinon.spy(console, 'warn');

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
      let flux = new Flux();
      let warn = sinon.spy(console, 'warn');

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
      let flux = new Flux();

      flux.createStore('foo', createSerializableStore(null, { foo: 'bar' }));
      flux.createStore('bar', createSerializableStore(null, { bar: 'baz' }));
      flux.createStore('baz', createSerializableStore(null, { baz: 'foo' }));

      flux.deserialize(`{
        "foo": "{}",
        "bar": "{}",
        "baz": "{}"
      }`);

      let fooStore = flux.getStore('foo');
      let barStore = flux.getStore('bar');
      let bazStore = flux.getStore('baz');

      expect(fooStore.state).to.deep.equal({ foo: 'bar' });
      expect(barStore.state).to.deep.equal({ bar: 'baz' });
      expect(bazStore.state).to.deep.equal({ baz: 'foo' });
    });

    it('warns and skips if passed string is invalid JSON', () => {
      let flux = new Flux();
      class TestStore extends Store {}


      flux.createStore('foo', TestStore);

      expect(flux.deserialize.bind(flux, 'not JSON')).to.throw(
        'Invalid value passed to `Flux#deserialize()`: not JSON'
      );
    });

    it('warns and skips stores whose classes do not implement .serialize()', () => {
      let flux = new Flux();
      let warn = sinon.spy(console, 'warn');

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
      let flux = new Flux();
      class TestStore extends Store {}

      flux.createStore('foo', createSerializableStore(null, { foo: 'bar' }));
      flux.createStore('bar', createSerializableStore(null, { bar: 'baz' }));
      flux.createStore('baz', TestStore);

      flux.deserialize(`{
        "foo": "{}",
        "bar": "{}",
        "baz": "{}"
      }`);

      let fooStore = flux.getStore('foo');
      let barStore = flux.getStore('bar');
      let bazStore = flux.getStore('baz');

      expect(fooStore.state).to.deep.equal({ foo: 'bar' });
      expect(barStore.state).to.deep.equal({ bar: 'baz' });
      expect(bazStore.state).to.be.undefined;
    });

  });

});
