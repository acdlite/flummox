'use strict';

import { TestActionsSyncPromise, TestActions } from '../TestUtils';
import { Flux } from '../../Flux';
import sinon from 'sinon';

describe('TestUtils', () => {
  describe('TestActionsSyncPromise', () => {
    it('then returns self', () => {
      let asyncResp = new TestActionsSyncPromise();
      let self = asyncResp.then();

      expect(self).to.equal(asyncResp);
    });

    it('calls success handler', () => {
      let asyncResp = new TestActionsSyncPromise();
      let success = sinon.spy();
      asyncResp.then(success);
      asyncResp.success('foo');

      expect(success.withArgs('foo').calledOnce).to.be.true;
    });

    it('calls fail handler', () => {
      let asyncResp = new TestActionsSyncPromise();
      let fail = sinon.spy();
      asyncResp.then(null, fail);
      asyncResp.fail('foo');

      expect(fail.withArgs('foo').calledOnce).to.be.true;
    });

    it('supports multiple then handlers', () => {
      let asyncResp = new TestActionsSyncPromise();
      let success1 = sinon.spy();
      let success2 = sinon.spy();
      let fail1 = sinon.spy();
      let fail2 = sinon.spy();

      asyncResp
        .then(success1)
        .then(success2);

      asyncResp.success('foo');

      asyncResp = new TestActionsSyncPromise();
      asyncResp
        .then(null, fail1)
        .then(null, fail2);

      asyncResp.fail('foo');

      expect(success1.withArgs('foo').calledOnce).to.be.true;
      expect(success2.withArgs('foo').calledOnce).to.be.true;

      expect(fail1.withArgs('foo').calledOnce).to.be.true;
      expect(fail2.withArgs('foo').calledOnce).to.be.true;

    });
  });

  describe('TestActions', () => {
    it('creates async actions', () => {
      let TestActionsClass = TestActions(['foo1', 'foo2']);
      let actions = new TestActionsClass();

      expect(actions.foo1).to.be.a('function');
      expect(actions.foo2).to.be.a('function');
    });

    it('returns async action helper class', () => {
      let flux = new Flux();
      let actions = flux.createActions('actions', TestActions(['foo']));
      let fooResp = actions.foo();

      expect(fooResp).to.be.an.instanceof(TestActionsSyncPromise);
    });

    it('creates sync actions', () => {
      let flux = new Flux();
      let actions = flux.createActions('actions', TestActions([], ['foo1', 'foo2']));

      expect(actions.foo1).to.be.a('function');
      expect(actions.foo2).to.be.a('function');
    });
  });
});