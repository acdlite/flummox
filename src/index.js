'use strict';

var Dispatcher = require('flux').Dispatcher;
var EventEmitter = require('events').EventEmitter;

var DEFAULT_FLUX_NAME = 'DEFAULT';

/**
 * Main Flux interface.
 * Call `Flux.reset()` on the server after each request.
 */
class Flux {
  constructor(name = DEFAULT_FLUX_NAME) {
    // Save specification objects so that they can be recreated on demand
    this._storeSpecMap = {};
    this._constantsSpecMap = {};
    this._actionsSpecMap = {};

    // "Reset" on start-up
    this.reset();

    Flux._fluxi[name] = this;
  }

  /**
   * Create a new store by passing in a spec object.
   * @param {Object} spec - Class specification
   * @returns {Object} New store
   */
  createStore(spec) {
    var store = new Store(spec, this);
    var storeName = store.getName();

    if (!this._storeSpecMap.hasOwnProperty(storeName)) {
      this._storeSpecMap[storeName] = spec;
    }

    this._storeMap[storeName] = store;

    this._registerStore(store);

    return store;
  }

  createConstants(spec) {
    var constants = new Constants(spec, this);
    var constantsName = constants.getName();

    if (!this._constantsSpecMap.hasOwnProperty(constantsName)) {
      this._constantsSpecMap[constantsName] = spec;
    }

    this._constantsMap[constantsName] = constants;

    return constants;
  }

  createActions(spec) {
    var actions = new Actions(spec, this);
    var actionsName = actions.getName();

    if (!this._actionsSpecMap.hasOwnProperty(actionsName)) {
      this._actionsSpecMap[actionsName] = spec;
    }

    this._actionsMap[actionsName] = actions;

    return actions;
  }

  getStore(storeName) {
    return this._storeMap[storeName];
  }

  getConstants(constantsName) {
    return this._constantsMap[constantsName];
  }

  getActions(actionsName) {
    return this._actionsMap[actionsName];
  }

  /**
   * Register store's handler with the dispatcher and save a reference to the
   * dispatch token
   * @param {Store} store
   * @private
   */
  _registerStore(store) {
    var storeName = store.getName();
    var dispatchToken = this.dispatcher.register(store._dispatchHandler.bind(store));
    this._dispatchTokenMap[storeName] = dispatchToken;
  }

  /**
   * Alias to `this.dispatcher.dispatch`
   * @param {Object} payload
   */
  dispatch(payload) {
    this.dispatcher.dispatch(payload);
  }

  /**
   * Wait for other stores' handlers to be called before continuing. Delegates
   * to the dispatcher's `waitFor()` method. Use this within the body of an
   * action handler.
   * @param {Array} storeNames - Names of stores to wait for
   * @param {Function} fn - Function to execute on continuation
   */
  waitForStores(storeNames, fn) {
    var dispatchTokens = storeNames.map(function(storeName) {
      return this._dispatchTokenMap[storeName];
    });

    this.dispatcher.waitFor(dispatchTokens, fn);
  }

  /**
   * Clear all the stores, constants, and actions and recreate them using
   * the original spec objects that were passed to their creation functions.
   */
  reset() {
    this.dispatcher = new Dispatcher();
    this._storeMap = {};
    this._dispatchTokenMap = {};
    this._constantsMap = {};
    this._actionsMap = {};

    for (var storeName in this._storeSpecMap) {
      var spec = this._storeSpecMap[storeName];
      this.createStore(spec);
    }

    for (var constantsName in this._constantsSpecMap) {
      var spec = this._constantsSpecMap[constantsName];
      this.createConstants(spec);
    }

    for (var actionsName in this._actionsSpecMap) {
      var spec = this._actionsSpecMap[actionsName];
      this.createActions(spec);
    }
  }
}

// Hash of Flux instances
Flux._fluxi = {};

// Property names that will throw an error if included in store spec object
var RESERVED_STORE_METHODS = [
  'getName',
  '_registerActions',
  '_registerAction',
  '_dispatchHandler',
];

/**
 * The Store class.
 * @param {Object} spec - Class specification
 * @param {Object} flux - Flux instance
 */
class Store extends EventEmitter {
  constructor(spec, flux) {
    this.flux = flux;

    // Throw error if spec is invalid
    Store.assertValidSpec(spec);

    // Map of action types to their handlers
    this._actionHandlerMap = {};

    // Copy properties from spec to prototype, taking care of special properties
    for (var key in spec) {
      var val = spec[key];

      // Save the spec name
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
   * Throws an error if store spec object is invalid.
   * @param {Object} spec
   * @static
   */
  static assertValidSpec(spec) {
    if (typeof spec.name !== 'string') {
      throw new Error('Missing or invalid store name');
    }

    for (var key in spec) {
      if (key in RESERVED_STORE_METHODS) {
        throw new Error(`${key} is a reserved Store method`);
      }
    }
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

/**
 * The Constants class. Makes it easier to define constants for actions that
 * make calls to an external service, e.g. a REST API.
 * @param {Object} spec - Class specification
 * @param {Object} flux - Flux instance
 */
class Constants {
  constructor(spec, flux) {
    this.flux = flux;

    // Loop through each key in class spec
    for (var key in spec) {

      // Save the spec name
      if (key === 'name') {
        this._name = spec.name;
      }
      // Create additional action types for service success and failure
      else if (key === 'serviceActionTypes') {
        spec.serviceActionTypes.forEach((serviceActionType) => {
          this[serviceActionType] = serviceActionType;
          this[serviceActionType + '_SUCCESS'] = serviceActionType + '_SUCCESS';
          this[serviceActionType + '_FAILURE'] = serviceActionType + '_FAILURE';
        });
      }
      else if (key === 'actionTypes') {
        spec.actionTypes.forEach((actionType) => {
          this[actionType] = actionType;
        });
      }
      else if (typeof spec[key] === 'function') {
        this[key] = spec[key].bind(this);
      }
      else {
        this[key] = spec[key];
      }
    }

    if (typeof this.initialize === 'function') this.initialize();
  }

  /**
   * Gets the name of the constants
   * @returns {String}
   */
  getName() {
    return this._name;
  }
}

/**
 * The Actions class. Makes it easier to dispatch actions on response/error
 * from external service.
 * @param {Object} spec - Class specification
 * @param {Object} flux - Flux instance
 */
class Actions {
  constructor(spec, flux) {
    var self = this;
    this.flux = flux;

    for (var key in spec) {
      // Save the spec name
      if (key === 'name') {
        this._name = spec.name;
      }
      else if (key === 'serviceActions') {
        for (var serviceActionMethodName in spec.serviceActions) {
          var serviceActionTuple = spec.serviceActions[serviceActionMethodName];
          var [serviceActionType, serviceAction] = serviceActionTuple;

          this[serviceActionMethodName] = function(...args) {
            self.dispatchAction(serviceActionType);
            return serviceAction.apply(self, args)
              .then((response) => {
                self.dispatchAction(serviceActionType + '_SUCCESS', response);
              })
              .catch((error) => {
                self.dispatchAction(serviceActionType + '_FAILURE', {error});
              });
          };
        }
      }
      else if (typeof spec[key] === 'function') {
        var action = spec[key];
        this[key] = action.bind(this);
      }
      else {
        this[key] = spec[key];
      }
    }

    if (typeof this.initialize === 'function') this.initialize();
  }

  dispatchAction(actionType, body) {
    var payload = {actionType};

    if (typeof body !== 'undefined') payload.body = body;

    this.flux.dispatch(payload);
  }

  /**
   * Gets the name of the actions
   * @returns {String}
   */
  getName() {
    return this._name;
  }
}


// Export a singleton
exports = module.exports = new Flux(DEFAULT_FLUX_NAME);

// Expose method to create new instances of Flux
exports.create = (name) => new Flux(name);

// Return specific, named instance of Flux
exports.get = (name) => Flux._fluxi[name];
