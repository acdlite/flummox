var $__getIteratorRange = function(iterator, index, begin, len) {
  if (index > begin) {
    throw new RangeError();
  }

  if (typeof len === "undefined") {
    len = Infinity;
  }

  var range = [], end = begin + len;

  while (index < end) {
    var next = iterator.next();

    if (next.done) {
      break;
    }

    if (index >= begin) {
      range.push(next.value);
    }

    index++;
  }

  return {
    range: range,
    index: index
  };
};

var $__getIterator = function(iterable) {
  var sym = typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  if (typeof iterable[sym] === "function") {
    return iterable[sym]();
  } else if (typeof iterable === "object" || typeof iterable === "function") {
    return $__getArrayIterator(iterable);
  } else {
    throw new TypeError();
  }
};

var $__getArrayIterator = function(array) {
  var index = 0;

  return {
    next: function() {
      if (index < array.length) {
        return {
          done: false,
          value: array[index++]
        };
      } else {
        return {
          done: true,
          value: void 0
        };
      }
    }
  };
};

var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
var $__Object$defineProperties = Object.defineProperties;
'use strict';
var Dispatcher = require('flux').Dispatcher;
var EventEmitter = require('events').EventEmitter;
var DEFAULT_FLUX_NAME = 'DEFAULT';

var Flux = function() {
  "use strict";

  function Flux() {
    var name = (arguments[0] !== void 0 ? arguments[0] : DEFAULT_FLUX_NAME);

    // Save specification objects so that they can be recreated on demand
    this._storeSpecMap = {};

    this._constantsSpecMap = {};
    this._actionsSpecMap = {};

    // "Reset" on start-up
    this.reset();

    Flux._fluxi[name] = this;
  }

  $__Object$defineProperties(Flux.prototype, {
    createStore: {
      value: function(spec) {
        var store = new Store(spec, this);
        var storeName = store.getName();

        if (!this._storeSpecMap.hasOwnProperty(storeName)) {
          this._storeSpecMap[storeName] = spec;
        }

        this._storeMap[storeName] = store;

        this._registerStore(store);

        return store;
      },

      enumerable: false,
      writable: true
    },

    createConstants: {
      value: function(spec) {
        var constants = new Constants(spec, this);
        var constantsName = constants.getName();

        if (!this._constantsSpecMap.hasOwnProperty(constantsName)) {
          this._constantsSpecMap[constantsName] = spec;
        }

        this._constantsMap[constantsName] = constants;

        return constants;
      },

      enumerable: false,
      writable: true
    },

    createActions: {
      value: function(spec) {
        var actions = new Actions(spec, this);
        var actionsName = actions.getName();

        if (!this._actionsSpecMap.hasOwnProperty(actionsName)) {
          this._actionsSpecMap[actionsName] = spec;
        }

        this._actionsMap[actionsName] = actions;

        return actions;
      },

      enumerable: false,
      writable: true
    },

    getStore: {
      value: function(storeName) {
        return this._storeMap[storeName];
      },

      enumerable: false,
      writable: true
    },

    getConstants: {
      value: function(constantsName) {
        return this._constantsMap[constantsName];
      },

      enumerable: false,
      writable: true
    },

    getActions: {
      value: function(actionsName) {
        return this._actionsMap[actionsName];
      },

      enumerable: false,
      writable: true
    },

    _registerStore: {
      value: function(store) {
        var storeName = store.getName();
        var dispatchToken = this.dispatcher.register(store._dispatchHandler.bind(store));
        this._dispatchTokenMap[storeName] = dispatchToken;
      },

      enumerable: false,
      writable: true
    },

    dispatch: {
      value: function(payload) {
        this.dispatcher.dispatch(payload);
      },

      enumerable: false,
      writable: true
    },

    waitForStores: {
      value: function(storeNames, fn) {
        var dispatchTokens = storeNames.map(function(storeName) {
          return this._dispatchTokenMap[storeName];
        });

        this.dispatcher.waitFor(dispatchTokens, fn);
      },

      enumerable: false,
      writable: true
    },

    reset: {
      value: function() {
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
      },

      enumerable: false,
      writable: true
    }
  });

  return Flux;
}();

// Hash of Flux instances
Flux._fluxi = {};

// Property names that will throw an error if included in store spec object
var RESERVED_STORE_METHODS = [
  'getName',
  '_registerActions',
  '_registerAction',
  '_dispatchHandler',
];

var Store = function($__super) {
  "use strict";

  function Store(spec, flux) {
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

  Store.__proto__ = ($__super !== null ? $__super : Function.prototype);
  Store.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

  $__Object$defineProperty(Store.prototype, "constructor", {
    value: Store
  });

  $__Object$defineProperties(Store.prototype, {
    getName: {
      value: function() {
        return this._name;
      },

      enumerable: false,
      writable: true
    },

    _registerActions: {
      value: function(handlerTuples) {
        handlerTuples.forEach(function(handlerTuple) {
          var iterator$0 = $__getIterator(handlerTuple),
              iteratorValue$0 = {
                index: 0
              },
              actionType = (iteratorValue$0 = $__getIteratorRange(iterator$0, iteratorValue$0.index, 0, 1), iteratorValue$0.range[0]),
              handler = (iteratorValue$0 = $__getIteratorRange(iterator$0, iteratorValue$0.index, 1, 1), iteratorValue$0.range[0]);
          this._registerAction(actionType, handler);
        }.bind(this));
      },

      enumerable: false,
      writable: true
    },

    _registerAction: {
      value: function(actionType, handler) {
        this._actionHandlerMap[actionType] = handler.bind(this);
      },

      enumerable: false,
      writable: true
    },

    _dispatchHandler: {
      value: function(payload) {
        var actionType = payload.actionType;
        var handler = this._actionHandlerMap[actionType];

        if (typeof handler === 'function') handler(payload.body);
      },

      enumerable: false,
      writable: true
    }
  });

  $__Object$defineProperties(Store, {
    assertValidSpec: {
      value: function(spec) {
        if (typeof spec.name !== 'string') {
          throw new Error('Missing or invalid store name');
        }

        for (var key in spec) {
          if (key in RESERVED_STORE_METHODS) {
            throw new Error("" + key + " is a reserved Store method");
          }
        }
      },

      enumerable: false,
      writable: true
    }
  });

  return Store;
}(EventEmitter);

var Constants = function() {
  "use strict";

  function Constants(spec, flux) {
    this.flux = flux;

    // Loop through each key in class spec
    for (var key in spec) {

      // Save the spec name
      if (key === 'name') {
        this._name = spec.name;
      }
      // Create additional action types for service success and failure
      else if (key === 'serviceActionTypes') {
        spec.serviceActionTypes.forEach(function(serviceActionType) {
          this[serviceActionType] = serviceActionType;
          this[serviceActionType + '_SUCCESS'] = serviceActionType + '_SUCCESS';
          this[serviceActionType + '_FAILURE'] = serviceActionType + '_FAILURE';
        }.bind(this));
      }
      else if (key === 'actionTypes') {
        spec.actionTypes.forEach(function(actionType) {
          this[actionType] = actionType;
        }.bind(this));
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

  $__Object$defineProperties(Constants.prototype, {
    getName: {
      value: function() {
        return this._name;
      },

      enumerable: false,
      writable: true
    }
  });

  return Constants;
}();

var Actions = function() {
  "use strict";

  function Actions(spec, flux) {
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
          var iterator$1 = $__getIterator(serviceActionTuple),
              iteratorValue$1 = {
                index: 0
              },
              serviceActionType = (iteratorValue$1 = $__getIteratorRange(iterator$1, iteratorValue$1.index, 0, 1), iteratorValue$1.range[0]),
              serviceAction = (iteratorValue$1 = $__getIteratorRange(iterator$1, iteratorValue$1.index, 1, 1), iteratorValue$1.range[0]);

          this[serviceActionMethodName] = function() {
            var $__arguments = arguments;
            var args = [].slice.call($__arguments, 0);
            self.dispatchAction(serviceActionType);

            return serviceAction.apply(self, args)
              .then(function(response) {
                self.dispatchAction(serviceActionType + '_SUCCESS', response);
              })
              .catch(function(error) {
                self.dispatchAction(serviceActionType + '_FAILURE', {error: error});
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

  $__Object$defineProperties(Actions.prototype, {
    dispatchAction: {
      value: function(actionType, body) {
        var payload = {actionType: actionType};

        if (typeof body !== 'undefined') payload.body = body;

        this.flux.dispatch(payload);
      },

      enumerable: false,
      writable: true
    },

    getName: {
      value: function() {
        return this._name;
      },

      enumerable: false,
      writable: true
    }
  });

  return Actions;
}();

// Export a singleton
exports = module.exports = new Flux(DEFAULT_FLUX_NAME);

// Expose method to create new instances of Flux
exports.create = function(name) {
  return new Flux(name);
};

// Return specific, named instance of Flux
exports.get = function(name) {
  return Flux._fluxi[name];
};
