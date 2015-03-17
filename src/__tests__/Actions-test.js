import { Flux, Actions } from '../Flux';
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

    async asyncAction(returnValue) {
      return returnValue;
    }

    badAsyncAction() {
      return Promise.reject(new Error('some error'));
    }
  }

  describe('#getActionIds / #getConstants', () => {
    it('returns strings corresponding to action method names', () => {
      const actions = new TestActions();

      const actionIds = actions.getActionIds();

      expect(actionIds.getFoo).to.be.a('string');
      expect(actionIds.getBar).to.be.a('string');

      expect(actionIds.getFoo).to.be.a('string');
      expect(actionIds.getBar).to.be.a('string');
    });

  });

  describe('#[methodName]', () => {
    it('calls Flux dispatcher', () => {
      const actions = new TestActions();

      // Attach mock flux instance
      const dispatch = sinon.spy();
      actions.dispatch = dispatch;

      actions.getFoo();
      expect(dispatch.firstCall.args[1]).to.deep.equal({ foo: 'bar' });
    });

    it('warns if actions have not been added to a Flux instance', () => {
      const actions = new TestActions();
      const warn = sinon.spy(console, 'warn');

      actions.getFoo();

      expect(warn.firstCall.args[0]).to.equal(
        'You\'ve attempted to perform the action TestActions#getFoo, but it '
      + 'hasn\'t been added to a Flux instance.'
      );

      actions.asyncAction();

      expect(warn.secondCall.args[0]).to.equal(
        `You've attempted to perform the asynchronous action `
      + `TestActions#asyncAction, but it hasn't been added `
      + `to a Flux instance.`
      );

      console.warn.restore();
    });

    it('sends return value to Flux dispatch', () => {
      const actions = new TestActions();
      const actionId = actions.getActionIds().getFoo;
      const dispatch = sinon.spy();
      actions.dispatch = dispatch;

      actions.getFoo();

      expect(dispatch.firstCall.args[0]).to.equal(actionId);
      expect(dispatch.firstCall.args[1]).to.deep.equal({ foo: 'bar' });
    });

    it('send async return value to Flux#dispatchAsync', async function() {
      const actions = new TestActions();
      const actionId = actions.getActionIds().asyncAction;
      const dispatch = sinon.stub().returns(Promise.resolve());
      actions.dispatchAsync = dispatch;

      const response = actions.asyncAction('foobar');

      expect(response.then).to.be.a('function');

      await response;

      expect(dispatch.firstCall.args[0]).to.equal(actionId);
      expect(dispatch.firstCall.args[1]).to.be.an.instanceOf(Promise);
    });

    it('skips disptach if return value is undefined', () => {
      const actions = new TestActions();
      const dispatch = sinon.spy();
      actions.dispatch = dispatch;

      actions.getBaz();

      expect(dispatch.called).to.be.false;
    });

    it('does not skip async dispatch, even if resolved value is undefined', () => {
      const actions = new TestActions();
      const dispatch = sinon.stub().returns(Promise.resolve(undefined));
      actions.dispatchAsync = dispatch;

      actions.asyncAction();

      expect(dispatch.called).to.be.true;
    });

    it('returns value from wrapped action', async function() {
      const flux = new Flux();
      const actions = flux.createActions('test', TestActions);

      expect(actions.getFoo()).to.deep.equal({ foo: 'bar' });
      await expect(actions.asyncAction('async result'))
        .to.eventually.equal('async result');
    });

  });

});
