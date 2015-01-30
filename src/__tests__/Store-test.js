'use strict';

import Store from '../Store';

describe('Store', () => {

  describe('#getState()', () => {

    let s = new Store({ foo: 'bar' });

    it('returns state object', () => {
      expect(s.getState()).to.deep.equal({ foo: 'bar' });
    });

    it('prevents mutations of state object', () => {
      let state = s.getState();
      state.foo = 'changed';

      expect(s.getState()).to.deep.equal({ foo: 'bar' })
    });
  });

});
