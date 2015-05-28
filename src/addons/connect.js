/**
 * Higher-order component form of connectToStores
 */

import createReactComponentMethods from './reactComponentMethods';
import assign from 'object-assign';

export default React => {
  const { instanceMethods, staticProperties } = createReactComponentMethods(React);

  return (BaseComponent, { stores, stateGetter }) => {
    const ConnectedComponent = class extends React.Component {
      constructor(props, context) {
        super(props, context);

        this.initialize();

        this.state = {
          storeState: this.connectToStores(stores, stateGetter)
        };
      }

      render() {
        return <BaseComponent {...this.state.storeState} {...this.props} />;
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
