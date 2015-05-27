import { Flummox, Store, Actions } from '../../Flux';
import addContext from './addContext';

import React from 'react/addons';
const { TestUtils } = React.addons;

import { FluxComponent } from '../react';
import sinon from 'sinon';

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

  it('allows for FluxComponents through the tree via context', () => {
    const flux = new Flux();
    const actions = flux.getActions('test');

    class TopView extends React.Component {
      render() {
        return (
          <FluxComponent flux={flux}>
            <SubView />
          </FluxComponent>
        );
      }
    }

    class SubView extends React.Component {
      render() {
        return <SubSubView />;
      }
    }

    class SubSubView extends React.Component {
      render() {
        return (
          <FluxComponent stores="test">
            <div />
          </FluxComponent>
        );
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <TopView />
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    actions.getSomething('something good');
    expect(div.props.something).to.equal('something good');
  });

  it('passes `stores` prop to reactComponentMethod connectToStores()', () => {
    const flux = new Flux();
    const actions = flux.getActions('test');

    const component = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} stores="test" />
    );

    actions.getSomething('something good');
    expect(component.state.something).to.deep.equal('something good');
    actions.getSomething('something else');
    expect(component.state.something).to.deep.equal('something else');
  });

  it('passes stateGetter prop to reactComponentMethod connectToStores()', () => {
    const flux = new Flux();
    const actions = flux.getActions('test');
    const stateGetter = sinon.stub().returns({ fiz: 'bin' });

    const component = TestUtils.renderIntoDocument(
      <FluxComponent flux={flux} stores="test" stateGetter={stateGetter} />
    );

    expect(component.state.fiz).to.equal('bin');
  });

  it('passes injectActions prop to reactComponentMethod collectActions()', () => {
    class Flux extends Flummox {
      constructor() {
        super();

        this.createActions('A', {
          do() {
            return 're';
          },

          re() {
            return 'mi';
          }
        });

        this.createActions('B', {
          mi() {
            return 'fa';
          },

          fa() {
            return 'so';
          }
        });
      }
    }

    const flux = new Flux();

    const component = TestUtils.renderIntoDocument(
      <FluxComponent
        flux={flux}
        actions={{
          A: actions => ({
            do: actions.do
          }),

          B: actions => ({
            fa: actions.fa
          }),
        }}
        render={(storeState, actions, flux) =>
          <div {...actions} />
        }
      />
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(component, 'div');

    expect(div.props.do()).to.equal('re');
    expect(div.props.fa()).to.equal('so');
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
      <FluxComponent flux={flux} stores="test">
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
    const stateGetter = () => {};

    // Pass all possible PropTypes to ensure only extra props
    // are injected.
    const tree = TestUtils.renderIntoDocument(
      <FluxComponent
        flux={flux}
        stores="test"
        stateGetter={stateGetter}
        extraProp="hello"
      >
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
      <FluxComponent flux={flux} stores="test">
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
        stores="test"
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
            stores={{
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

});
