import * as TestUtils from '../TestUtils';
import sinon from 'sinon';


describe('TestUtils', () => {
  describe('#simulateAction', () => {
    it('calls the stores handler', () => {
      const store = mockStore();
      const actionFunc = function() {};
      actionFunc._id = 'actionFunc';

      TestUtils.simulateAction(store, 'foo', 'foo body');
      TestUtils.simulateAction(store, actionFunc, 'actionFunc body');

      expect(store.handler.calledTwice).to.be.true;

      expect(store.handler.getCall(0).args[0]).to.deep.equal({
        actionId: 'foo',
        body: 'foo body'
      });

      expect(store.handler.getCall(1).args[0]).to.deep.equal({
        actionId: 'actionFunc',
        body: 'actionFunc body'
      });
    });
  });

  describe('#simulateActionAsync', () => {
    it('it handles async begin', () => {
      const store = mockStore();

      TestUtils.simulateActionAsync(store, 'foo', 'begin');

      expect(store.handler.calledOnce).to.be.true;
      expect(store.handler.firstCall.args[0]).to.deep.equal({
        actionId: 'foo',
        async: 'begin'
      });
    });

    it('it handles async begin w/ action args', () => {
      const store = mockStore();

      TestUtils.simulateActionAsync(store, 'foo', 'begin', 'arg1', 'arg2');

      expect(store.handler.calledOnce).to.be.true;
      expect(store.handler.firstCall.args[0]).to.deep.equal({
        actionId: 'foo',
        async: 'begin',
        actionArgs: ['arg1', 'arg2']
      });
    });

    it('it handles async success', () => {
      const store = mockStore();

      TestUtils.simulateActionAsync(store, 'foo', 'success', { foo: 'bar' });

      expect(store.handler.calledOnce).to.be.true;
      expect(store.handler.firstCall.args[0]).to.deep.equal({
        actionId: 'foo',
        async: 'success',
        body: {
          foo: 'bar'
        }
      });
    });

    it('it handles async failure', () => {
      const store = mockStore();

      TestUtils.simulateActionAsync(store, 'foo', 'failure', 'error message');

      expect(store.handler.calledOnce).to.be.true;
      expect(store.handler.firstCall.args[0]).to.deep.equal({
        actionId: 'foo',
        async: 'failure',
        error: 'error message'
      });
    });

    it('it throws error with invalid asyncAction', () => {
      const store = mockStore();
      const simulate = () => TestUtils.simulateActionAsync(store, 'foo', 'fizbin');

      expect(simulate).to.throw('asyncAction must be one of: begin, success or failure');
    });
  });
});

function mockStore() {
  return {
    handler: sinon.spy()
  };
}
