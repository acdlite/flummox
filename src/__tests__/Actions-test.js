'use strict';

import Actions from '../Actions';

describe('Actions', () => {

  class TestActions extends Actions {
    getFoo() {
      return { foo: 'bar' };
    }

    getBar() {
      return { bar: 'baz' };
    }
  }

  describe('#_getActionMethodNames', () => {
    it('returns array of action method names', () => {
      let actions = new TestActions();

      expect(actions._getActionMethodNames()).to.deep.equal(['getFoo', 'getBar']);
    })
  });

  describe('#getConstants', () => {
    it('returns constants (Symbols) corresponding to action method names', () => {
      let actions = new TestActions();

      expect(typeof actions.getConstants().GET_FOO).to.equal('symbol');
      expect(typeof actions.getConstants().GET_BAR).to.equal('symbol');
    });

  });

});
