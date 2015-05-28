/**
 * Higher-order component form of FluxComponent
 */

import createReactComponentMethods from './reactComponentMethods';
import assign from 'object-assign';

/**
 * Top-level function which exports a version of the HoC for the given version
 * of React
 */
export default React => {
  const { instanceMethods, staticProperties } = createReactComponentMethods(React);

  // Decorator-friendly interface
  return ({ stores, stateGetter, actions, actionGetter }) => BaseComponent => {
    const ConnectedComponent = class extends React.Component {
      constructor(props, context) {
        super(props, context);

        this.initialize();

        this.state = {
          storeState: this.connectToStores(stores, stateGetter),
          actions: this.collectActions(actions, actionGetter, props)
        };
      }

      render() {
        return (
          <BaseComponent
            {...this.props}
            {...this.state.storeState}
            {...this.state.actions}
          />
        );
      }
    };

    assign(
      ConnectedComponent.prototype,
      instanceMethods
    );

    assign(ConnectedComponent, staticProperties);

    return ConnectedComponent;
  };
};
