/**
 * The Store class.
 * @param {Object} spec - Class specification
 * @param {Object} flux - Flux instance
 */

'use strict';

var EventEmitter = require('events').EventEmitter;

class Store extends EventEmitter {
  constructor(spec, flux) {
    this.flux = flux;

    // Map of action types to their handlers
    this._actionHandlerMap = {};

    // Copy properties from spec to prototype, taking care of special properties
    for (var key in spec) {
      var val = spec[key];

      if (key === 'name') {
        this._name = val;
      }
      // Register action handlers
      else if (key === 'actions') {
        this._registerActions(val);
      }
      // If value is a function, copy it to the prototype and bind to `this`
      else if (typeof val === 'function') {
        this[key] = val.bind(this);
      }
      else {
        this[key] = val;
      }
    }

    if (typeof this.initialize === 'function') this.initialize();
  }

  /**
   * Gets the name of the store
   * @returns {String}
   */
  getName() {
    return this._name;
  }

  /**
   * Register action handlers. This does not register with dispatcher directly,
   * but rather saves the handler internally so that it can be called from the
   * store's main handler.
   * @param {Array} handlerTuples - Array of arrays in the form
   *                                [actionType, handler]
   * @private
   */
  _registerActions(handlerTuples) {
    handlerTuples.forEach((handlerTuple) => {
      var [actionType, handler] = handlerTuple;
      this._registerAction(actionType, handler);
    });
  }

  /**
   * Register a single action handler.
   * @param {String} actionType - Type of action
   * @param {Function} handler - Action handler
   * @private
   */
  _registerAction(actionType, handler) {
    this._actionHandlerMap[actionType] = handler.bind(this);
  }

  /**
   * Handler to be registered with the dispatcher. Checks the action type on the
   * payload and calls the corresponding handler, if it exists.
   * @param {Object} payload - Dispatcher payload
   * @private
   */
  _dispatchHandler(payload) {
    var actionType = payload.actionType;
    var handler = this._actionHandlerMap[actionType];

    if (typeof handler === 'function') handler(payload.body);
  }
}

module.exports = Store;
