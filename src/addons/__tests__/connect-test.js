import { connect } from '../react';
import addContext from './addContext';
import { Actions, Store, Flummox } from '../../Flux';
import React from 'react/addons';
const { PropTypes } = React;
const { TestUtils } = React.addons;

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

  handleGetSomething({body: something}, state) {
    return {something};
  }
}

class Flux extends Flummox {
  constructor() {
    super();

    this.createActions('test', TestActions);
    this.createStore('test', TestStore, this);
  }
}

describe('connect (HoC)', () => {
  it('gets Flux from either props or context', () => {
    const flux = new Flux();
    let contextComponent, propsComponent;

    class BaseComponent extends React.Component {
      render() {
        return <div/>;
      }
    }

    const ConnectedComponent = connect({
      stores: 'test'
    })(BaseComponent);

    const ContextComponent = addContext(
      ConnectedComponent,
      { flux },
      { flux: React.PropTypes.instanceOf(Flummox) }
    );

    const tree = TestUtils.renderIntoDocument(
      <ContextComponent />
    );

    contextComponent = TestUtils.findRenderedComponentWithType(
      tree, ConnectedComponent
    );

    propsComponent = TestUtils.renderIntoDocument(
      <ConnectedComponent flux={flux} />
    );

    expect(contextComponent.flux).to.be.an.instanceof(Flummox);
    expect(propsComponent.flux).to.be.an.instanceof(Flummox);
  });

  it('passes store state as props', () => {
    const flux = new Flux();

    @connect({
      stores: 'test'
    })
    class BaseComponent extends React.Component {
      render() {
        return <div {...this.props} />;
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <BaseComponent flux={flux} foo="bar" bar="baz" />
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    expect(div.props.foo).to.equal('bar');
    expect(div.props.bar).to.equal('baz');
  });

  it('passes actions as props', () => {
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

    @connect({
      actions: {
        A: actions => ({
          do: actions.do
        }),

        B: actions => ({
          fa: actions.fa
        })
      }
    })
    class BaseComponent extends React.Component {
      render() {
        return <div {...this.props} />;
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <BaseComponent flux={flux} />
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

    expect(div.props.do()).to.equal('re');
    expect(div.props.fa()).to.equal('so');
  });

  it('syncs with store after state change', () => {
    const flux = new Flux();

    class BaseComponent extends React.Component {
      render() {
        return <div/>;
      }
    }

    const ConnectedComponent = connect({
      stores: 'test'
    })(BaseComponent);

    const tree = TestUtils.renderIntoDocument(
      <ConnectedComponent flux={flux} />
    );

    const component = TestUtils.findRenderedComponentWithType(
      tree, BaseComponent
    );

    const getSomething = flux.getActions('test').getSomething;

    expect(component.props.something).to.be.null;

    getSomething('do');

    expect(component.props.something).to.equal('do');

    getSomething('re');

    expect(component.props.something).to.equal('re');
  });
});
