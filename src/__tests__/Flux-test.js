'use strict';

import { Flux, Store, Actions } from '../Flux';
import sinon from 'sinon';

class SerializableStore extends Store {

  constructor(serializedState, deserializedState) {
    super();

    // Don't actually do this! This is just for testing.
    this.serializedState = serializedState;
    this.deserializedState = deserializedState;
  }

  serialize() {
    return this.serializedState;
  }

  deserialize() {
    return this.deserializedState;
  }

}

describe('Flux', () => {

  describe('#createStore()', () => {
    it('throws if key already exists', () => {
      let flux = new Flux();

      flux.createStore('ExampleStore', Store);
      expect(flux.createStore.bind(flux, 'ExampleStore', Store)).to.throw(
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

      flux.createStore('ExampleStore', Store);
      expect(flux.getStore('ExampleStore')).to.be.an.instanceOf(Store);
      expect(flux.getStore('NonexistentStore')).to.be.undefined;
    });
  });

  describe('#createActions()', () => {
    it('throws if key already exists', () => {
      let flux = new Flux();
      flux.createActions('ExampleActions', Actions);

      expect(flux.createActions.bind(flux, 'ExampleActions', Actions)).to.throw(
        'You\'ve attempted to create multiple actions with key ExampleActions. '
      + 'Keys must be unique.'
      );
    });

    it('throws if Store is not a prototype of class', () => {
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
      flux.createActions('TestActions', Actions);

      expect(flux.getActions('TestActions')).to.be.an.instanceOf(Actions);
      expect(flux.getActions('NonexistentActions')).to.be.undefined;
    });

  });

  describe('#getActionIds()', () => {
    class TestActions extends Actions {
      getFoo() {}
    }

    it('retrives ids of actions for key', () => {
      let flux = new Flux();
      flux.createActions('TestActions', TestActions);

      expect(typeof flux.getActionIds('TestActions').getFoo).to.equal('string');
      expect(flux.getActionIds('NonexistentActions')).to.be.undefined;
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

      flux.createStore('foo', SerializableStore, 'foo state');
      flux.createStore('bar', SerializableStore, 'bar state');
      flux.createStore('baz', SerializableStore, 'baz state');

      expect(JSON.parse(flux.serialize())).to.deep.equal({
        foo: 'foo state',
        bar: 'bar state',
        baz: 'baz state',
      });
    });

    it('throws if any stores do not implement #serialize()', () => {
      let flux = new Flux();

      flux.createStore('foo', Store);

      expect(flux.serialize.bind(flux)).to.throw(
        'Cannot serialize Flux state because the store with key \'foo\' does '
      + 'not have a `serialize()` method. Check the implementation of the '
      + 'Store class.'
      );
    });

    it('throws if return value of Store#serialize() is not a string', () => {
      let flux = new Flux();

      flux.createStore('foo', SerializableStore, {});

      expect(flux.serialize.bind(flux)).to.throw(
        '`Store#serialize() must return a string, but the store with key '
      + '\'foo\' returned a non-string with type \'object\'. Check the '
      + '`#serialize() method of the SerializableStore class.'
      );
    });

  });

  describe('#deserialize()', () => {

    it('converts a serialized string into state and uses it to replace state of stores', () => {
      let flux = new Flux();

      flux.createStore('foo', SerializableStore, null, 'foo state');
      flux.createStore('bar', SerializableStore, null, 'bar state');
      flux.createStore('baz', SerializableStore, null, 'baz state');

      // Actual string values here are unimportant, as long as keys match
      flux.deserialize(`{
        "foo": "foo",
        "bar": "bar",
        "baz": "baz"
      }`);

      let fooStore = flux.getStore('foo');
      let barStore = flux.getStore('bar');
      let bazStore = flux.getStore('baz');

      expect(fooStore.state).to.equal('foo state');
      expect(barStore.state).to.equal('bar state');
      expect(bazStore.state).to.equal('baz state');
    });

    it('throws if passed string is invalid JSON', () => {
      let flux = new Flux();

      flux.createStore('foo', Store);

      expect(flux.deserialize.bind(flux, 'not JSON')).to.throw(
        'Invalid value passed to `Flux#deserialize()`. Ensure that each of '
      + 'your store\'s `#serialize()` methods returns a properly '
      + 'escaped string.'
      );
    });

    it('throws if any stores do not implement #deserialize()', () => {
      let flux = new Flux();

      flux.createStore('foo', Store);

      expect(flux.deserialize.bind(flux, '{ "foo": "bar" }')).to.throw(
        'Cannot deserialize Flux state because the store with key \'foo\' does '
      + 'not have a `deserialize()` method. Check the implementation of the '
      + 'Store class.'
      );
    });

  });

});
