'use strict';

import EventEmitter from 'eventemitter3';

export default class Store extends EventEmitter {

  /**
   * Stores are initialized with a reference
   * @type {Object}
   */
  constructor(state = {}) {
    this.state = Object.assign({}, state);

    this._handlers = new Map();
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

  register(actionId, handler) {
    this._handlers.set(actionId, handler.bind(this));
  }

  handler(payload) {
    let { body, actionId } = payload;

    let handler = this._handlers.get(actionId);

    if (typeof handler !== 'function') return;

    handler(body, actionId);
  }
}
