import React from 'react';

import createFluxComponent from './FluxComponent';
import createFluxMixin from './FluxMixin';
import createConnectToStores from './connectToStores';

export const FluxComponent = createFluxComponent(React);
export const fluxMixin = createFluxMixin(React);
export const connectToStores = createConnectToStores(React);
