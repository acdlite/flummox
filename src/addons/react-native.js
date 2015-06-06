import React, { View } from 'react-native';

import createFluxComponent from './FluxComponent';
import createConnect from './connect';

export default {
  FluxComponent: createFluxComponent(React, View),
  connect: createConnect(React)
};
