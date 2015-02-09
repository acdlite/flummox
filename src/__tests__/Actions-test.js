'use strict';

import Actions from '../Actions';
import sinon from 'sinon';
import '6to5-runtime/regenerator/runtime';

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

    async asyncAction() {
      return 'foobar';
    }

    badAsyncAction() {
      return Promise.reject(new Error('some error'));
    }
  }

  describe('#getActionIds / #getConstants', () => {
    it('returns strings corresponding to action method names', () => {
      let actions = new TestActions();

      let actionIds = actions.getActionIds();

      expect(actionIds.getFoo).to.be.a('string');
      expect(actionIds.getBar).to.be.a('string');

      expect(actionIds.getFoo).to.be.a('string');
      expect(actionIds.getBar).to.be.a('string');
    });

  });

  describe('#[methodName]', () => {
    it('calls Flux dispatcher', () => {
      let actions = new TestActions();

      // Attach mock flux instance
      let dispatch = sinon.spy();
      actions.dispatch = dispatch;

      let body = 'foobar';
      actions.getFoo();

      expect(dispatch.getCall(0).args[1]).to.deep.equal({ foo: 'bar' });
    });

    it('throws if actions have not been added to a Flux instance', () => {
      let actions = new TestActions();

      expect(actions.getFoo.bind(actions))
        .to.throw(
          'You\'ve attempted to perform the action TestActions#getFoo, but it '
        + 'hasn\'t been added to a Flux instance.'
        );
    });

    it('dispatches with return value of wrapped method', () => {
      let actions = new TestActions();
      let actionId = actions.getActionIds().getFoo;
      let dispatch = sinon.spy();
      actions._dispatch = dispatch;

      actions.getFoo();

      expect(dispatch.firstCall.args[0]).to.equal(actionId);
      expect(dispatch.firstCall.args[1]).to.deep.equal({ foo: 'bar' });
    });

    it('dispatches resolved value if return value is a promise', async function() {
      let actions = new TestActions();
      let actionId = actions.getActionIds().asyncAction;
      let dispatch = sinon.spy();
      actions._dispatch = dispatch;

      let response = actions.asyncAction();

      expect(response.then).to.be.a('function');

      await response;

      expect(dispatch.firstCall.args[0]).to.equal(actionId);
      expect(dispatch.firstCall.args[1]).to.equal('foobar');
    });

    it('skips disptach if return value is undefined', () => {
      let actions = new TestActions();
      let actionId = actions.getActionIds().getFoo;
      let dispatch = sinon.spy();
      actions._dispatch = dispatch;

      actions.getBaz();

      expect(dispatch.called).to.be.false;
    });

    it('returns undefined if action is synchronous', () => {
      let actions = new TestActions();
      let actionId = actions.getActionIds().getFoo;
      actions._dispatch = function() {};

      expect(actions.getFoo()).to.be.undefined;
    });

    it('resolves to undefined if action is asyncronous', async function() {
      let actions = new TestActions();
      let actionId = actions.getActionIds().getFoo;
      actions._dispatch = function() {};

      expect(await actions.asyncAction()).to.be.undefined;
    });

    it('rejects with error if asynchronous action throws error', done => {
      let actions = new TestActions();
      let actionId = actions.getActionIds().badAsyncAction;
      actions._dispatch = function() {};

      expect(actions.badAsyncAction()).to.be.rejectedWith('some error')
        .notify(done);
    });
  })

});
