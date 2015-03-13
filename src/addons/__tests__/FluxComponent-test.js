import { Flummox, Store, Actions } from '../../Flux';
import addContext from './addContext';

import React from 'react/addons';
const { TestUtils } = React.addons;

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
    }
  }

  it('gets Flux property from either props or context', () => {
    const flux = new Flux();
    let contextComponent, propsComponent;

    const ContextComponent = addContext(
      FluxComponent,
      { flux },
      { flux: React.PropTypes.instanceOf(Flummox) }
    );

    const tree = TestUtils.renderIntoDocument(<ContextComponent />);

    contextComponent = TestUtils.findRenderedComponentWithType(
      tree, FluxComponent
    );

    propsComponent = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} />
    );

    expect(contextComponent.flux).to.be.an.instanceof(Flummox);
    expect(propsComponent.flux).to.be.an.instanceof(Flummox);
  });

  it('passes connectToStore prop to reactComponentMethod connectToStores()', () => {
    const flux = new Flux();
    const actions = flux.getActions('test');

    const component = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} connectToStores="test" />
    );

    actions.getSomething('something good');
    expect(component.state.something).to.deep.equal('something good');
    actions.getSomething('something else');
    expect(component.state.something).to.deep.equal('something else');
  });

  it('injects children with flux prop', () => {
    const flux = new Flux();
    const actions = flux.getActions('test');

    const tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux}>
        <div />
      </FluxComponent>
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    expect(div.props.flux).to.equal(flux);
  });

  it('injects children with props corresponding to component state', () => {
    const flux = new Flux();
    const actions = flux.getActions('test');

    const tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} connectToStores="test">
        <div />
      </FluxComponent>
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    actions.getSomething('something good');
    expect(div.props.something).to.equal('something good');
    actions.getSomething('something else');
    expect(div.props.something).to.equal('something else');
  });

  it('injects children with any extra props', () => {
    const flux = new Flux();

    const tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} extraProp="hello">
        <div />
      </FluxComponent>
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    expect(div.props.extraProp).to.equal('hello');
    expect(Object.keys(div.props)).to.deep.equal(['flux', 'extraProp']);
  });

  it('wraps multiple children in span tag', () => {
    const flux = new Flux();

    const tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux}>
        <div />
        <div />
      </FluxComponent>
    );

    const wrapper = TestUtils.findRenderedDOMComponentWithTag(tree, 'span');
    const divs = TestUtils.scryRenderedDOMComponentsWithTag(tree, 'div');

    expect(divs.length).to.equal(2);
  });

  it('does not wrap single child in span tag', () => {
    const flux = new Flux();

    const tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux}>
        <div />
      </FluxComponent>
    );

    expect(
      TestUtils.findRenderedDOMComponentWithTag.bind(TestUtils, tree, 'span')
    ).to.throw('Did not find exactly one match for tag:span');
  });

  it('allows for nested FluxComponents', () => {
    const flux = new Flux();
    const actions = flux.getActions('test');

    const tree = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} connectToStores="test">
        <FluxComponent>
          <div />
        </FluxComponent>
      </FluxComponent>
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    actions.getSomething('something good');
    expect(div.props.something).to.equal('something good');
    actions.getSomething('something else');
    expect(div.props.something).to.equal('something else');
  });

  it('uses `render` prop for custom rendering, if it exists', () => {
    const flux = new Flux();
    const actions = flux.getActions('test');

    const tree = TestUtils.renderIntoDocument(
      <FluxComponent
        flux={flux}
        connectToStores="test"
        render={props =>
          <div something={props.something} />
        }
      />
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    actions.getSomething('something good');
    expect(div.props.something).to.equal('something good');
    actions.getSomething('something else');
    expect(div.props.something).to.equal('something else');
  });

  it('updates with render-time computed values in state getters on componentWillReceiveProps()', () => {
    const flux = new Flux();

    class Owner extends React.Component {
      constructor(props) {
        super(props);

        this.state = {
          foo: 'bar'
        };
      }

      render() {
        return (
          <FluxComponent
            flux={flux}
            connectToStores={{
              test: store => ({
                yay: this.state.foo
              })
            }}
            render={storeState => <div {...storeState} />}
          />
        );
      }
    }

    const owner = TestUtils.renderIntoDocument(<Owner />);
    const div = TestUtils.findRenderedDOMComponentWithTag(owner, 'div');

    expect(div.props.yay).to.equal('bar');
    owner.setState({ foo: 'baz' });
    expect(div.props.yay).to.equal('baz');
  });

  it('allows the component wrapper element to be customized', () => {
    const flux = new Flux();

    const tree = TestUtils.renderIntoDocument(
      <FluxComponent
        flux={flux}>
        <FluxComponent
          html={
            {
              tagName: 'div',
              className: 'my-class-name',
              id: 'some-div'
            }
          }>
          <h1>Header 1</h1>
          <h2>Header 2</h2>
          <h3>Header 3</h3>
        </FluxComponent>
      </FluxComponent>
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
    expect(div.props.className).to.equal('my-class-name');

    const divDOM = React.findDOMNode(div);
    expect(divDOM.className).to.equal('my-class-name');
    expect(divDOM.id).to.equal('some-div');
  });
});
