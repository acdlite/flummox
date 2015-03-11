import { Flummox, Store, Actions } from '../../Flux';
import addContext from './addContext';

import React from 'react/addons';
let { TestUtils } = React.addons;

import FluxComponent from '../FluxComponent';

describe('FluxComponent', () => {

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

  it('gets Flux property from either props or context', () => {
    let flux = new Flux();
    let contextComponent, propsComponent;

    let ContextComponent = addContext(
      FluxComponent,
      { flux },
      { flux: React.PropTypes.instanceOf(Flummox) }
    );

    let tree = TestUtils.renderIntoDocument(<ContextComponent />);

    contextComponent = TestUtils.findRenderedComponentWithType(
      tree, FluxComponent
    );

    propsComponent = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} />
    );

    expect(contextComponent.flux).to.be.an.instanceof(Flummox);
    expect(propsComponent.flux).to.be.an.instanceof(Flummox);
  });

  it('passes connectToStore prop to FluxMixin\'s connectToStores()', () => {
    let flux = new Flux();
    let actions = flux.getActions('test');

    let component = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} connectToStores="test" />
    );

    actions.getSomething('something good');
    expect(component.state.something).to.deep.equal('something good');
    actions.getSomething('something else');
    expect(component.state.something).to.deep.equal('something else');
  });

  it('injects children with flux prop', () => {
    let flux = new Flux();
    let actions = flux.getActions('test');

    let tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux}>
        <div />
      </FluxComponent>
    );

    let div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    expect(div.props.flux).to.equal(flux);
  });

  it('injects children with props corresponding to component state', () => {
    let flux = new Flux();
    let actions = flux.getActions('test');

    let tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} connectToStores="test">
        <div />
      </FluxComponent>
    );

    let div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    actions.getSomething('something good');
    expect(div.props.something).to.equal('something good');
    actions.getSomething('something else');
    expect(div.props.something).to.equal('something else');
  });

  it('injects children with any extra props', () => {
    let flux = new Flux();

    let tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} extraProp="hello">
        <div />
      </FluxComponent>
    );

    let div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    expect(div.props.extraProp).to.equal('hello');
    expect(Object.keys(div.props)).to.deep.equal(['flux', 'extraProp']);
  });

  it('wraps multiple children in span tag', () => {
    let flux = new Flux();

    let tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux}>
        <div />
        <div />
      </FluxComponent>
    );

    let wrapper = TestUtils.findRenderedDOMComponentWithTag(tree, 'span');
    let divs = TestUtils.scryRenderedDOMComponentsWithTag(tree, 'div');

    expect(divs.length).to.equal(2);
  });

  it('does not wrap single child in span tag', () => {
    let flux = new Flux();

    let tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux}>
        <div />
      </FluxComponent>
    );

    expect(
      TestUtils.findRenderedDOMComponentWithTag.bind(TestUtils, tree, 'span')
    ).to.throw('Did not find exactly one match for tag:span');
  });

  it('allows for nested FluxComponents', () => {
    let flux = new Flux();
    let actions = flux.getActions('test');

    let tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} connectToStores="test">
        <FluxComponent>
          <div />
        </FluxComponent>
      </FluxComponent>
    );

    let div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    actions.getSomething('something good');
    expect(div.props.something).to.equal('something good');
    actions.getSomething('something else');
    expect(div.props.something).to.equal('something else');
  });

});
