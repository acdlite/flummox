import React from 'react';

import createFluxComponent from './FluxComponent';
import createFluxMixin from './fluxMixin';
import createConnect from './connect';

export const FluxComponent = createFluxComponent(React, 'span');
export const fluxMixin = createFluxMixin(React);
export const connect = createConnect(React);
