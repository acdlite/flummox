import React, { View } from 'react-native';

import createFluxComponent from './FluxComponent';
import createConnect from './connect';

export const FluxComponent = createFluxComponent(React, View);
export const connect = createConnect(React);
