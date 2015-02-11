'use strict';

import ReactMixin from '../ReactMixin';
import { Flummox, Store, Actions } from '../../Flux';
import sinon from 'sinon';

import React from 'react/addons';
let { PropTypes } = React;
let { TestUtils } = React.addons;

describe('ReactMixin', () => {

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
    }
  }

  let ContextComponent = React.createClass({
    mixins: [ReactMixin()],

    render() {
      return null;
    }
  });

  let PropsComponent = React.createClass({
    mixins: [ReactMixin()],

    render() {
      return null;
    }
  });

  before(() => {
    jsdom();
  })

  it('gets flux from either props or context', () => {
    let flux = new Flux();
    let contextComponent, propsComponent;

    React.withContext({ flux }, () => {
      contextComponent = TestUtils.renderIntoDocument(<ContextComponent />);
    });

    propsComponent = TestUtils.renderIntoDocument(
      <PropsComponent flux={flux} />
    );

    expect(contextComponent.flux).to.be.an.instanceof(Flummox);
    expect(propsComponent.flux).to.be.an.instanceof(Flummox);
  });

  it('throws error if neither props or context is set', () => {
    let flux = new Flux();

    expect(TestUtils.renderIntoDocument.bind(null, <PropsComponent />))
      .to.throw(
        'ReactMixin: Could not find Flux instance. Ensure that your component '
      + 'has either `this.context.flux` or `this.props.flux`.'
      );
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

    let mixin = ReactMixin(getterMap);

    let connectToStores = sinon.spy(mixin, 'connectToStores');

    let Component = React.createClass({
      mixins: [mixin],

      getInitialState() {
        return {
          foobar: 'baz',
        }
      },

      render() {
        return null;
      }
    });

    let component = TestUtils.renderIntoDocument(
      <Component flux={flux} />
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
        <PropsComponent flux={flux} />
      );

      let initialState = component.connectToStores('test');

      expect(initialState).to.deep.equal({
        something: null,
      });
    });

    it('merges store state with component state on change', () => {
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent flux={flux} />
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
        <PropsComponent flux={flux} />
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

    it('accepts object of keys to state getters', () => {
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent flux={flux} />
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

    it('uses default getter if null is passed as getter', () => {
      let flux = new Flux();

      let component = TestUtils.renderIntoDocument(
        <PropsComponent flux={flux} />
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

});
