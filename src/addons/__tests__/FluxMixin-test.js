'use strict';

import fluxMixin from '../fluxMixin';
import { Flummox, Store, Actions } from '../../Flux';
import sinon from 'sinon';

import React from 'react/addons';
let { PropTypes } = React;
let { TestUtils } = React.addons;

describe('fluxMixin', () => {

  class TestActions extends Actions {
    getSomething(something) {
      return something;
    }
  }

  class TestStore extends Store {
    constructor(flux) {
      super();

      let testActions = flux.getActions('test');
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

  let ContextComponent = React.createClass({
    mixins: [fluxMixin()],

    render() {
      return null;
    }
  });

  let PropsComponent = React.createClass({
    mixins: [fluxMixin()],

    render() {
      return null;
    }
  });

  before(() => {
    jsdom();
  });

  it('gets flux from either props or context', () => {
    let flux = new Flux();
    let contextComponent, propsComponent;

    React.withContext({ flux }, () => {
      contextComponent = TestUtils.renderIntoDocument(
        <ContextComponent keys="test" />
      );
    });

    propsComponent = TestUtils.renderIntoDocument(
      <PropsComponent key="test" flux={flux} />
    );

    expect(contextComponent.flux).to.be.an.instanceof(Flummox);
    expect(propsComponent.flux).to.be.an.instanceof(Flummox);
  });

  it('exposes flux as context', () => {
    let flux = new Flux();

    let ChildComponent = React.createClass({
      contextTypes: {
        flux: PropTypes.instanceOf(Flummox),
      },

      render() {
        return <div />;
      }
    });

    let Component = React.createClass({
      mixins: [fluxMixin()],

      render() {
        return (
          <div>
            <ChildComponent key="test" />
          </div>
        );
      }
    });

    let tree = TestUtils.renderIntoDocument(<Component flux={flux} />);

    let childComponent = TestUtils.findRenderedComponentWithType(
      tree,
      ChildComponent
    );

    expect(childComponent.context.flux).to.equal(flux);
  });

  it('throws error if neither props or context is set', () => {
    let flux = new Flux();

    expect(TestUtils.renderIntoDocument.bind(null, <PropsComponent />))
      .to.throw(
        'fluxMixin: Could not find Flux instance. Ensure that your component '
      + 'has either `this.context.flux` or `this.props.flux`.'
      );
  });

  it('ignores change event after unmounted', () => {
    let flux = new Flux();
    flux.getActions('test').getSomething('foo');

    let getterMap = {
      test: store => ({ something: store.state.something })
    };
    let Component = React.createClass({
      mixins: [fluxMixin(getterMap)],

      render() {
        return null;
      }
    });

    let container = document.createElement('div');
    let component = React.render(<Component flux={flux} />, container);
    let listener = flux.getStore('test').listeners('change')[0];

    React.unmountComponentAtNode(container);

    flux.getActions('test').getSomething('bar');
    listener();

    expect(component.state.something).to.equal('foo');
  });

  it('uses #connectToStores() to get initial state', () => {
    let flux = new Flux();

    flux.getActions('test').getSomething('foobar');

    let getterMap = {
      test: store => ({
        something: store.state.something,
        custom: true,
      }),
    };

    let mixin = fluxMixin(getterMap);

    let connectToStores = sinon.spy(mixin, 'connectToStores');

    let Component = React.createClass({
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

    let component = TestUtils.renderIntoDocument(
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
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent key="test" flux={flux} />
      );

      let initialState = component.connectToStores('test');

      expect(initialState).to.deep.equal({
        something: null,
      });
    });

    it('merges store state with component state on change', () => {
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent key="test" flux={flux} />
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
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent key="test" flux={flux} />
      );

      component.setState({ otherThing: 'barbaz' });

      component.connectToStores('test', store => {
        return {
          something: store.state.something,
          custom: true,
        };
      });

      flux.getActions('test').getSomething('foobar');

      expect(component.state).to.deep.equal({
        something: 'foobar',
        otherThing: 'barbaz',
        custom: true,
      });
    });

    it('binds state getter to component', () => {
      let flux = new Flux();

      let Component = React.createClass({
        mixins: [fluxMixin({
          test: function(store) {
            this.someComponentMethod('some arg');

            return {
              something: store.state.something,
              custom: true,
            };
          },
        })],

        render() {
          return null;
        },

        someComponentMethod(string) {
          return string;
        }
      });

      let component = TestUtils.renderIntoDocument(
        <Component key="test" flux={flux} />
      );

      let someComponentMethod = sinon.spy(component, 'someComponentMethod');
      flux.getActions('test').getSomething('foobar');

      expect(someComponentMethod.calledOnce).to.be.true;
      expect(someComponentMethod.firstCall.args[0]).to.equal('some arg');
    });

    it('syncs with store after prop change', () => {
      let flux = new Flux();

      let Component = React.createClass({
        mixins: [fluxMixin({
          test: function(store) {
            return {
              foo: 'foo is ' + this.props.foo,
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

      component.setProps({ foo: 'baz' });

      expect(component.state.foo).to.equal('foo is baz');
    });

    it('accepts object of keys to state getters', () => {
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent key="test" flux={flux} />
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

    it('converts array of stores to state getter', () => {
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent key="test" flux={flux} />
      );

      component.connectToStores(['test']);

      flux.getActions('test').getSomething('foobar');

      expect(component.state).to.deep.equal({
        something: 'foobar',
      });
    });

    it('uses default getter if null is passed as getter', () => {
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent key="test" flux={flux} />
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
      let flux = new Flux();
      let div = document.createElement('div');

      let component = React.render(<PropsComponent flux={flux} />, div);

      let store = flux.getStore('test');
      component.connectToStores('test');

      expect(store.listeners('change').length).to.equal(1);
      React.unmountComponentAtNode(div);
      expect(store.listeners('change').length).to.equal(0);
    });

  });

  describe('#getStoreState', () => {
    it('gets combined state of connected stores', () => {
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent key="test" flux={flux} />
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
