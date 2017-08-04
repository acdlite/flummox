import fluxMixin from '../fluxMixin';
import { Flummox, Store, Actions } from '../../Flux';
import addContext from './addContext';
import sinon from 'sinon';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils'
import PropTypes from 'prop-types'

describe('fluxMixin', () => {

  class TestActions extends Actions {
    getSomething(something) {
      return something;
    }
  }

  class TestStore extends Store {
    constructor(flux) {
      super();

      const testActions = flux.getActions('test');
      this.register(testActions.getSomething, this.handleGetSomething);

      this.state = {
        something: null
      };
    }

    handleGetSomething(something) {
      this.setState({ something });
    }
  }

  class Flux extends Flummox {
    constructor() {
      super();

      this.createActions('test', TestActions);
      this.createStore('test', TestStore, this);
      this.createStore('test2', TestStore, this);
    }
  }

  const ComponentWithFluxMixin = React.createClass({
    mixins: [fluxMixin()],

    render() {
      return null;
    }
  });

  it('gets flux from either props or context', () => {
    const flux = new Flux();
    let contextComponent, propsComponent;

    const ContextComponent = addContext(
      ComponentWithFluxMixin,
      { flux },
      { flux: PropTypes.instanceOf(Flummox) }
    );

    const tree = TestUtils.renderIntoDocument(
      <ContextComponent />
    );

    contextComponent = TestUtils.findRenderedComponentWithType(
      tree, ComponentWithFluxMixin
    );

    propsComponent = TestUtils.renderIntoDocument(
      <ComponentWithFluxMixin flux={flux} />
    );

    expect(contextComponent.flux).to.be.an.instanceof(Flummox);
    expect(propsComponent.flux).to.be.an.instanceof(Flummox);
  });

  it('exposes flux as context', () => {
    const flux = new Flux();

    const ChildComponent = React.createClass({
      contextTypes: {
        flux: PropTypes.instanceOf(Flummox),
      },

      render() {
        return <div />;
      }
    });

    const Component = React.createClass({
      mixins: [fluxMixin()],

      render() {
        return (
          <div>
            <ChildComponent key="test" />
          </div>
        );
      }
    });

    const tree = TestUtils.renderIntoDocument(<Component flux={flux} />);

    const childComponent = TestUtils.findRenderedComponentWithType(
      tree,
      ChildComponent
    );

    expect(childComponent.context.flux).to.equal(flux);
  });

  it('throws error if neither props or context is set', () => {
    const flux = new Flux();

    expect(TestUtils.renderIntoDocument.bind(null, <ComponentWithFluxMixin />))
      .to.throw(
        'fluxMixin: Could not find Flux instance. Ensure that your component '
      + 'has either `this.context.flux` or `this.props.flux`.'
      );
  });

  it('ignores change event after unmounted', () => {
    const flux = new Flux();
    flux.getActions('test').getSomething('foo');

    const getterMap = {
      test: store => ({ something: store.state.something })
    };
    const Component = React.createClass({
      mixins: [fluxMixin(getterMap)],

      render() {
        return null;
      }
    });

    const container = document.createElement('div');
    const component = ReactDOM.render(<Component flux={flux} />, container);
    const listener = flux.getStore('test').listeners('change')[0];

    ReactDOM.unmountComponentAtNode(container);

    flux.getActions('test').getSomething('bar');
    listener();

    expect(component.state.something).to.equal('foo');
  });

  it('uses #connectToStores() to get initial state', () => {
    const flux = new Flux();

    flux.getActions('test').getSomething('foobar');

    const getterMap = {
      test: store => ({
        something: store.state.something,
        custom: true,
      }),
    };

    const mixin = fluxMixin(getterMap);

    const connectToStores = sinon.spy(mixin, 'connectToStores');

    const Component = React.createClass({
      mixins: [mixin],

      getInitialState() {
        return {
          foobar: 'baz',
        };
      },

      render() {
        return null;
      }
    });

    const component = TestUtils.renderIntoDocument(
      <Component key="test" flux={flux} />
    );

    expect(connectToStores.calledOnce).to.be.true;
    expect(connectToStores.firstCall.args[0]).to.equal(getterMap);

    expect(flux.getStore('test').listeners('change')).to.have.length(1);

    expect(component.state).to.deep.equal({
      something: 'foobar',
      custom: true,
      foobar: 'baz',
    });

  });

  describe('#connectToStores', () => {

    it('returns initial state', () => {
      const flux = new Flux();

      const component = TestUtils.renderIntoDocument(
        <ComponentWithFluxMixin key="test" flux={flux} />
      );

      const initialState = component.connectToStores('test');

      expect(initialState).to.deep.equal({
        something: null,
      });
    });

    it('merges store state with component state on change', () => {
      const flux = new Flux();

      const component = TestUtils.renderIntoDocument(
        <ComponentWithFluxMixin key="test" flux={flux} />
      );

      component.setState({ otherThing: 'barbaz' });

      component.connectToStores('test');
      flux.getActions('test').getSomething('foobar');

      expect(component.state).to.deep.equal({
        something: 'foobar',
        otherThing: 'barbaz',
      });
    });

    it('uses custom state getter, if given', () => {
      const flux = new Flux();

      const component = TestUtils.renderIntoDocument(
        <ComponentWithFluxMixin key="test" flux={flux} bar="baz" />
      );

      component.setState({ otherThing: 'barbaz' });

      component.connectToStores('test', (store, props) => ({
        something: store.state.something,
        barbaz: 'bar' + props.bar,
      }));

      flux.getActions('test').getSomething('foobar');

      expect(component.state).to.deep.equal({
        something: 'foobar',
        otherThing: 'barbaz',
        barbaz: 'barbaz',
      });
    });

    it('syncs with store after prop change', () => {
      const flux = new Flux();

      const Component = React.createClass({
        mixins: [fluxMixin({
          test: function(store, props) {
            return {
              foo: 'foo is ' + props.foo,
            };
          },
        })],

        render() {
          return null;
        }
      });

      let component = TestUtils.renderIntoDocument(
        <Component key="test" flux={flux} foo="bar" />
      );

      expect(component.state.foo).to.equal('foo is bar');

      component = TestUtils.renderIntoDocument(
        <Component key="test" flux={flux} foo="baz" />
      );

      expect(component.state.foo).to.equal('foo is baz');
    });

    it('accepts object of keys to state getters', () => {
      const flux = new Flux();

      const component = TestUtils.renderIntoDocument(
        <ComponentWithFluxMixin key="test" flux={flux} />
      );

      component.setState({ otherThing: 'barbaz' });

      component.connectToStores({
        test: store => ({
          something: store.state.something,
          custom: true,
        }),
      });

      flux.getActions('test').getSomething('foobar');

      expect(component.state).to.deep.equal({
        something: 'foobar',
        otherThing: 'barbaz',
        custom: true,
      });
    });

    it('calls default state getter once with array of stores', () => {
      const flux = new Flux();

      flux.getStore('test2').setState({ otherThing: 'barbaz' });

      const component = TestUtils.renderIntoDocument(
        <ComponentWithFluxMixin key="test" flux={flux} />
      );

      component.connectToStores(['test', 'test2']);

      flux.getActions('test').getSomething('foobar');

      expect(component.state).to.deep.equal({
        something: 'foobar',
        otherThing: 'barbaz'
      });
    });

    it('calls custom state getter once with array of stores', () => {
      const flux = new Flux();
      const testStore = flux.getStore('test');
      const test2Store = flux.getStore('test2');

      testStore._testId = 'test';
      test2Store._testId = 'test2';

      const component = TestUtils.renderIntoDocument(
        <ComponentWithFluxMixin key="test" flux={flux} />
      );

      const stateGetter = sinon.stub().returns({ foo: 'bar' });
      const state = component.connectToStores(['test', 'test2'], stateGetter);

      expect(stateGetter.calledOnce).to.be.true;
      // Use _testId as unique identifier on store.
      expect(stateGetter.firstCall.args[0][0]._testId).to.equal('test');
      expect(stateGetter.firstCall.args[0][1]._testId).to.equal('test2');

      expect(state).to.deep.equal({
        foo: 'bar'
      });
    });

    it('uses default getter if null is passed as getter', () => {
      const flux = new Flux();

      const component = TestUtils.renderIntoDocument(
        <ComponentWithFluxMixin key="test" flux={flux} />
      );

      component.setState({ otherThing: 'barbaz' });

      component.connectToStores('test', null);

      flux.getActions('test').getSomething('foobar');

      expect(component.state).to.deep.equal({
        something: 'foobar',
        otherThing: 'barbaz',
      });
    });

    it('removes listener before unmounting', () => {
      const flux = new Flux();
      const div = document.createElement('div');

      const component = ReactDOM.render(<ComponentWithFluxMixin flux={flux} />, div);

      const store = flux.getStore('test');
      component.connectToStores('test');

      expect(store.listeners('change').length).to.equal(1);
      ReactDOM.unmountComponentAtNode(div);
      expect(store.listeners('change').length).to.equal(0);
    });

  });

  describe('#getStoreState', () => {
    it('gets combined state of connected stores', () => {
      const flux = new Flux();

      const component = TestUtils.renderIntoDocument(
        <ComponentWithFluxMixin key="test" flux={flux} />
      );

      component.connectToStores({
        test: store => ({
          foo: 'bar',
        }),
        test2: store => ({
          bar: 'baz'
        })
      });

      component.setState({ baz: 'foo' });

      expect(component.getStoreState()).to.deep.equal({
        foo: 'bar',
        bar: 'baz'
      });
    });
  });

});
