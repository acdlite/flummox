'use strict';

import { Flux, Store, Actions } from '../Flux';

describe('Flux', () => {

  describe('#addStore()', () => {
    it('throws if key already exists', () => {
      let flux = new Flux();
      let store1 = new Store();
      let store2 = new Store();

      flux.addStore('TestKey', store1);
      expect(flux.addStore.bind(flux, 'TestKey', store1)).to.throw(
        'You\'ve attempted to add multiple stores with key TestKey. Keys must '
      + 'be unique. Try choosing different keys, or remove an existing store '
      + 'with Flux#removeStore().'
      );
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

});
