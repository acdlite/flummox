import { Store, Flux } from '../../Flux';
import restorableStateStorePlugin from '../restorableStateStorePlugin';
import sinon from 'sinon';

describe('restorableStateStorePlugin', () => {
  class ExampleStore extends Store {
    constructor() {
      super();
      this.state = { foo: 'bar' };
    }
  }

  class ExampleStore2 extends Store {
    constructor() {
      super();
      this.state = { foo: 'bar' };
    }
  }

  it('default has no serialize and deserialize', () => {
    expect(ExampleStore.serialize).to.be.undefined;
    expect(ExampleStore.deserialize).to.be.undefined;
  });

  it('plugin call adds serialize and deserialize', () => {
    restorableStateStorePlugin(ExampleStore2);

    expect(ExampleStore2.serialize).to.not.be.undefined;
    expect(ExampleStore2.deserialize).to.not.be.undefined;

    expect(ExampleStore2.serialize).to.be.a('function');
    expect(ExampleStore2.deserialize).to.be.a('function');
  });

  it('plugin call returns store class', () => {
    let returnedStore = restorableStateStorePlugin(ExampleStore2);
    expect(returnedStore).to.be.equal(ExampleStore2);
  });

  it('serialize a object to a string', () => {
      restorableStateStorePlugin(ExampleStore2);
      let store = new ExampleStore2();

      const serialize = store.constructor.serialize;
      const serializedStoreState = serialize(store.state);

      expect(serializedStoreState).to.be.a('string');
      expect(serializedStoreState).to.be.equal('{"foo":"bar"}');
  });

  it('deserialize a string to a object', () => {
      restorableStateStorePlugin(ExampleStore2);
      let store = new ExampleStore2();

      const data = '{"foo":"bar"}';
      const deserialize = store.constructor.deserialize;
      const deserializeStoreState = deserialize(data);

      expect(deserializeStoreState).to.be.a('object');
      expect(deserializeStoreState).to.be.deep.equal({'foo': 'bar'});
  });
});
