'use strict';

import Flummox from './src/Flux';
import addons from './src/addons/react';

const lib = {
  ...Flummox,
  addons: {
    ...addons
  }
};

export default lib;
