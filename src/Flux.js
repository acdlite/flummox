'use strict';

var Dispatcher = require('flux').Dispatcher;
var Store = require('./Store');
var Constants = require('./Constants');
var Actions = require('./Actions');
var watchMixin = require('./watchMixin');

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

    // Attach watch mixin
    this.watchMixin = watchMixin.bind(null, this);
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

    var spec;

    for (var storeName in this._storeSpecMap) {
      spec = this._storeSpecMap[storeName];
      this.createStore(spec);
    }

    for (var constantsName in this._constantsSpecMap) {
      spec = this._constantsSpecMap[constantsName];
      this.createConstants(spec);
    }

    for (var actionsName in this._actionsSpecMap) {
      spec = this._actionsSpecMap[actionsName];
      this.createActions(spec);
    }
  }
}

// Hash of Flux instances
Flux._fluxi = {};


// Export a singleton
exports = module.exports = new Flux(DEFAULT_FLUX_NAME);

// Expose method to create new instances of Flux
exports.create = (name) => new Flux(name);

// Return specific, named instance of Flux
exports.get = (name) => Flux._fluxi[name];
