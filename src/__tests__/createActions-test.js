import { Flux } from '../Flux';
import createActions from '../createActions';
import sinon from 'sinon';

function noop() {}

describe('createActions', () => {

  it('returns a mapped object', () => {
    const actions = createActions(noop, { a: 'a', b: 'b' });
    expect(Object.keys(actions)).to.deep.equal(['a', 'b']);
  });

  it('passes non-functions as-is', () => {
    const actions = createActions(noop, { string: 'string', number: 42 });
    expect(actions).to.deep.equal({ string: 'string', number: 42 });
  });

  it('gives functions a unique id', () => {
    const actions = createActions(noop, { a: noop, b: noop });
    expect(actions.a._id).to.be.a('string');
    expect(actions.b._id).to.be.a('string');
    expect(actions.a._id).to.not.equal(actions.b._id);
  });

  it('binds functions to original object', () => {
    const actions = createActions((id, actionCreator) => actionCreator(), {
      foo: 'bar',
      getFoo() {
        return this.foo;
      }
    });
    const getFoo = actions.getFoo;
    expect(getFoo()).to.equal('bar');
  });

  it('wraps functions in `perform()`', () => {
    const spy = sinon.spy();
    const originalActions = {
      getFoo() {
        return 'bar';
      }
    };
    const actions = createActions(spy, originalActions);
    actions.getFoo('baz');
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[1]()).to.equal('bar');
  });
});
