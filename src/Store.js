'use strict';

import EventEmitter from 'eventemitter3';

export default class Store extends EventEmitter {

  /**
   * Stores are initialized with a reference
   * @type {Object}
   */
  constructor(state = {}) {
    this.state = state;
  }

  /**
   * Return a (shallow) copy of the store's internal state, so that it is
   * protected from mutation by the consumer.
   *
   * @returns {object}
   */
  getState() {
    return Object.assign({}, this.state);
  }
}
