import connectToStores from '../connectToStores';
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

describe('connectToStores (HoC)', () => {
  it('gets Flux from either props or context', () => {
    const flux = new Flux();
    let contextComponent, propsComponent;

    class BaseComponent extends React.Component {
      render() {
        return <div/>;
      }
    }

    const ConnectedComponent = connectToStores(BaseComponent, 'test');

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

  it('syncs with store after state change', () => {
    const flux = new Flux();

    class BaseComponent extends React.Component {
      render() {
        return <div/>;
      }
    }

    const ConnectedComponent = connectToStores(BaseComponent, 'test');

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
