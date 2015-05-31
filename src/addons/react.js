import React from 'react/addons';

import createFluxComponent from './FluxComponent';
import createConnect from './connect';

export default {
  FluxComponent: createFluxComponent(React, 'span'),
  connect: createConnect(React)
};
