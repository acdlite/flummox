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

    getBaz() {
      return;
    }

    asyncAction() {
      return Promise.resolve('foobar');
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
      actions.dispatch = dispatch;

      let body = 'foobar';
      actions._dispatch(Symbol(), body);

      expect(dispatch.getCall(0).args[1]).to.equal('foobar');
    });

    it('throws if actions have not been added to a Flux instance', () => {
      let actions = new TestActions();

      expect(actions._dispatch.bind(actions, { foo: 'bar' }, 'mockAction'))
        .to.throw('Attempted to perform action before adding to Flux instance');
    });
  });

  describe('#[methodName]', () => {
    it('dispatches with return value of wrapped method', () => {
      let actions = new TestActions();
      let actionId = actions.getConstants().getFoo;
      let dispatch = sinon.spy();
      actions._dispatch = dispatch;

      actions.getFoo();

      expect(dispatch.firstCall.args[0]).to.equal(actionId);
      expect(dispatch.firstCall.args[1]).to.deep.equal({ foo: 'bar' });
    });

    it('dispatches resolved value if return value is a promise', (done) => {
      let actions = new TestActions();
      let actionId = actions.getConstants().asyncAction;
      let dispatch = sinon.spy();
      actions._dispatch = dispatch;

      actions.asyncAction()
        .then(() => {
          expect(dispatch.firstCall.args[0]).to.equal(actionId);
          expect(dispatch.firstCall.args[1]).to.equal('foobar');
          done();
        });
    });

    it('skips disptach if return value is undefined', () => {
      let actions = new TestActions();
      let actionId = actions.getConstants().getFoo;
      let dispatch = sinon.spy();
      actions._dispatch = dispatch;

      actions.getBaz();

      expect(dispatch.called).to.be.false;
    });
  })

});
