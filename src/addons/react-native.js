import React, { View } from 'react-native';

import createFluxComponent from './FluxComponent';
import createFluxMixin from './fluxMixin';
import createConnect from './connect';

export const FluxComponent = createFluxComponent(React, View);
export const fluxMixin = createFluxMixin(React);
export const connect = createConnect(React);
