'use strict';

import Actions from '../Actions';
import sinon from 'sinon';

describe('Actions', () => {

  class TestActions extends Actions {
    getFoo() {
      return { foo: 'bar' };
    }

    getBar() {
      return { bar: 'baz' };
    }
  }

  describe('#getConstants', () => {
    it('returns symbols corresponding to action method names', () => {
      let actions = new TestActions();

      expect(typeof actions.getConstants().getFoo).to.equal('symbol');
      expect(typeof actions.getConstants().getBar).to.equal('symbol');
    });

  });

  describe('#_dispatch', () => {
    it('delegates to Flux dispatcher', () => {
      let actions = new TestActions();

      // Attach mock flux instance
      let dispatch = sinon.spy();
      actions.flux = { dispatch };

      let body = 'foobar';
      actions._dispatch(Symbol(), body);

      expect(dispatch.getCall(0).args[0].body).to.equal('foobar');
    });
  });

  it('throws if actions have not been added to a Flux instance', () => {
    let actions = new TestActions();

    expect(actions._dispatch.bind(actions, { foo: 'bar' }, 'mockAction'))
      .to.throw('Attempted to perform action before adding to Flux instance');
  });

});
