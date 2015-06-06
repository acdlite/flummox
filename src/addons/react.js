import React from 'react/addons';

import createFluxComponent from './FluxComponent';
import createConnect from './connect';

export const FluxComponent = createFluxComponent(React, 'span');
export const connect = createConnect(React);
