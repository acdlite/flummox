import React from 'react';

import createFluxComponent from './FluxComponent';
import createConnect from './connect';

export const FluxComponent = createFluxComponent(React, 'span');
export const connect = createConnect(React);
