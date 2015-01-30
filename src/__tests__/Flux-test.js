'use strict';

import { Flux, Store, Actions } from '../Flux';
import sinon from 'sinon';

describe('Flux', () => {

  describe('#addStore()', () => {
    it('throws if key already exists', () => {
      let flux = new Flux();
      let store1 = new Store();
      let store2 = new Store();

      flux.addStore('ExampleStore', store1);
      expect(flux.addStore.bind(flux, 'ExampleStore', store1)).to.throw(
        'You\'ve attempted to add multiple stores with key ExampleStore. Keys must '
      + 'be unique. Try choosing different keys, or remove an existing store '
      + 'with Flux#removeStore().'
      );
    });

    it('registers store\'s handler with central dispatcher', () => {
      let flux = new Flux();
      let store = new Store();

      let spy1 = sinon.spy();
      let spy2 = sinon.spy();
      store.foo = 'bar';
      store.handler = function(payload) {
        spy1(payload);
        spy2(this.foo);
      };
      flux.addStore('ExampleStore', store);

      let payload = { foo: 'bar' };
      flux.dispatch(payload);
      expect(spy1.calledWith(payload)).to.be.true;
      expect(spy2.calledWith('bar')).to.be.true;
    });
  });

  describe('#getStore()', () => {
    it('retrieves store for key', () => {
      let flux = new Flux();
      let store = new Store();

      flux.addStore('ExampleStore', store);
      expect(flux.getStore('ExampleStore')).to.equal(store);
      expect(flux.getStore('NonexistentStore')).to.be.undefined;
    });
  });

  describe('#removeStore()', () => {
    it('removes store for key', () => {
      let flux = new Flux();
      let store = new Store();

      flux.addStore('ExampleStore', store);
      expect(flux.getStore('ExampleStore')).to.equal(store);
      flux.removeStore('ExampleStore');
      expect(flux.getStore('ExampleStore')).to.be.undefined;
    });
  });

  describe('#addActions()', () => {
    class TestActions extends Actions {}

    it('throws if key already exists', () => {
      let flux = new Flux();
      let testActions1 = new TestActions();
      let testActions2 = new TestActions();

      flux.addActions('TestActions', testActions1);

      expect(flux.addActions.bind(flux, 'TestActions', testActions2)).to.throw(
        'You\'ve attempted to add multiple actions with key TestActions. Keys '
      + 'must be unique. Try choosing different keys, or remove existing '
      + 'actions with Flux#removeActions().'
      );
    });
  });

  describe('#getActions()', () => {
    class TestActions extends Actions {}

    it('retrieves actions for key', () => {
      let flux = new Flux();
      let testActions = new TestActions();

      flux.addActions('TestActions', testActions);

      expect(flux.getActions('TestActions')).to.equal(testActions);
      expect(flux.getActions('NonexistentActions')).to.be.undefined;
    });

  });

  describe('#getActionIds()', () => {
    class TestActions extends Actions {
      getFoo() {}
    }

    let flux = new Flux();
    let testActions = new TestActions();

    flux.addActions('TestActions', testActions);

    expect(typeof flux.getActionIds('TestActions').getFoo).to.equal('symbol');
  });

});
