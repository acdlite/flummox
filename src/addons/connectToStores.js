/**
 * Higher-order component form of connectToStores
 */

import { default as React, PropTypes } from 'react';
import { instanceMethods, staticProperties } from './reactComponentMethods';
import assign from 'object-assign';

export default (BaseComponent, stores, stateGetter) => {
  const ConnectedComponent = class extends React.Component {
    constructor(props, context) {
      super(props, context);

      this.initialize();

      this.state = this.connectToStores(stores, stateGetter);
    }

    render() {
      return <BaseComponent {...this.state} {...this.props} />;
    }
  };

  assign(
    ConnectedComponent.prototype,
    instanceMethods
  );

  assign(ConnectedComponent, staticProperties(PropTypes));

  return ConnectedComponent;
};
