'use strict';

/**
 * Store
 *
 * Stores hold application state. They respond to actions sent by the dispatcher
 * and broadcast change events to listeners, so they can grab the latest data.
 * The key thing to remember is that Store's do not have a set
 */

import EventEmitter from 'eventemitter3';

export default class Store extends EventEmitter {

  /**
   * Stores are initialized with a reference
   * @type {Object}
   */
  constructor() {
    this.state = {};

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

  setState(newState) {
    if (typeof this.state === 'undefined') this.state = {};

    if (this._isHandlingDispatch) {
      this._batchedChanges = Object.assign(this._batchedChanges, newState);
      this._emitChangeAfterHandlingDispatch = true;
    } else {
      console.warn(
        'Store#setState() called from outside an action handler. This is likely '
      + 'a mistake. Flux stores should manage their own state.'
      );

      this.state = Object.assign({}, this.state, newState);
      this.emit('change');
    }
  }

  register(actionId, handler) {
    this._handlers.set(actionId, handler.bind(this));
  }

  handler(payload) {
    this._isHandlingDispatch = true;
    this._batchedChanges = {};
    this._emitChangeAfterHandlingDispatch = false;

    try {
      let { body, actionId } = payload;

      let handler = this._handlers.get(actionId);

      if (typeof handler !== 'function') return;

      handler(body, actionId);
    } finally {

      if (this._emitChangeAfterHandlingDispatch) {
        this.state = Object.assign({}, this.state, this._batchedChanges);
        this.emit('change');
      }

      this._isHandlingDispatch = false;
      this._batchedChanges = {};
      this._emitChangeAfterHandlingDispatch = false;
    }
  }
}
