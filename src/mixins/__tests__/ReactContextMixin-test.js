'use strict';

import ReactContextMixin from '../ReactContextMixin';
import { Flummox, Store, Actions } from '../../Flux';

describe('ReactContextMixin', () => {

  class TestActions extends Actions {
    getSomething(something) {
      return something;
    }
  }

  class TestStore extends Store {
    constructor(flux) {
      super();

      let testActions = flux.getActions('test');

      this.register(testActions.getSomething, this.handleGetSomething);
    }
  }

});
