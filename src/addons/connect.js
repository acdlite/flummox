/**
 * Higher-order component form of connectToStores
 */

import createReactComponentMethods from './reactComponentMethods';
import assign from 'object-assign';

export default React => {
  const { instanceMethods, staticProperties } = createReactComponentMethods(React);

  return (BaseComponent, { stores, stateGetter, actions, actionGetter }) => {
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
}
