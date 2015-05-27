import React from 'react';

import createFluxComponent from './FluxComponent';
import createFluxMixin from './fluxMixin';
import createConnectToStores from './connectToStores';

export const FluxComponent = createFluxComponent(React, 'span');
export const fluxMixin = createFluxMixin(React);
export const connectToStores = createConnectToStores(React);
