var Flummox =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Flux
	 *
	 * The main Flux class.
	 */

	var Store = _interopRequire(__webpack_require__(1));

	var Actions = _interopRequire(__webpack_require__(2));

	var Dispatcher = __webpack_require__(3).Dispatcher;

	var EventEmitter = _interopRequire(__webpack_require__(4));

	var Flux = (function (_EventEmitter) {
	  function Flux() {
	    _classCallCheck(this, Flux);

	    this.dispatcher = new Dispatcher();

	    this._stores = {};
	    this._actions = {};
	  }

	  _inherits(Flux, _EventEmitter);

	  _createClass(Flux, {
	    createStore: {
	      value: function createStore(key, _Store) {
	        for (var _len = arguments.length, constructorArgs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	          constructorArgs[_key - 2] = arguments[_key];
	        }

	        if (!(_Store.prototype instanceof Store)) {
	          var className = getClassName(_Store);

	          throw new Error("You've attempted to create a store from the class " + className + ", which " + "does not have the base Store class in its prototype chain. Make sure " + ("you're using the `extends` keyword: `class " + className + " extends ") + "Store { ... }`");
	        }

	        if (this._stores.hasOwnProperty(key) && this._stores[key]) {
	          throw new Error("You've attempted to create multiple stores with key " + key + ". Keys must " + "be unique.");
	        }

	        var store = _applyConstructor(_Store, constructorArgs);
	        var token = this.dispatcher.register(store.handler.bind(store));

	        store._waitFor = this.waitFor.bind(this);
	        store._token = token;

	        this._stores[key] = store;

	        return store;
	      }
	    },
	    getStore: {
	      value: function getStore(key) {
	        return this._stores.hasOwnProperty(key) ? this._stores[key] : undefined;
	      }
	    },
	    createActions: {
	      value: function createActions(key, _Actions) {
	        for (var _len = arguments.length, constructorArgs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	          constructorArgs[_key - 2] = arguments[_key];
	        }

	        if (!(_Actions.prototype instanceof Actions) && _Actions !== Actions) {
	          var className = getClassName(_Actions);

	          throw new Error("You've attempted to create actions from the class " + className + ", which " + "does not have the base Actions class in its prototype chain. Make " + ("sure you're using the `extends` keyword: `class " + className + " ") + "extends Actions { ... }`");
	        }

	        if (this._actions.hasOwnProperty(key) && this._actions[key]) {
	          throw new Error("You've attempted to create multiple actions with key " + key + ". Keys " + "must be unique.");
	        }

	        var actions = _applyConstructor(_Actions, constructorArgs);
	        actions.dispatch = this.dispatch.bind(this);
	        actions.dispatchAsync = this.dispatchAsync.bind(this);

	        this._actions[key] = actions;

	        return actions;
	      }
	    },
	    getActions: {
	      value: function getActions(key) {
	        return this._actions.hasOwnProperty(key) ? this._actions[key] : undefined;
	      }
	    },
	    getActionIds: {
	      value: function getActionIds(key) {
	        var actions = this.getActions(key);

	        if (!actions) {
	          return;
	        }return actions.getConstants();
	      }
	    },
	    dispatch: {
	      value: function dispatch(actionId, body) {
	        this._dispatch({ actionId: actionId, body: body });
	      }
	    },
	    dispatchAsync: {
	      value: function dispatchAsync(actionId, promise, actionArgs) {
	        var _this = this;

	        var payload = {
	          actionId: actionId,
	          async: "begin" };

	        if (actionArgs) payload.actionArgs = actionArgs;

	        this._dispatch(payload);

	        return promise.then(function (body) {
	          _this._dispatch({
	            actionId: actionId,
	            body: body,
	            async: "success"
	          });

	          return body;
	        }, function (error) {
	          _this._dispatch({
	            actionId: actionId,
	            error: error,
	            async: "failure" });

	          return Promise.reject(error);
	        })["catch"](function (error) {
	          _this.emit("error", error);

	          return Promise.reject(error);
	        });
	      }
	    },
	    _dispatch: {
	      value: function _dispatch(payload) {
	        this.dispatcher.dispatch(payload);
	        this.emit("dispatch", payload);
	      }
	    },
	    waitFor: {
	      value: function waitFor(tokensOrStores) {

	        if (!Array.isArray(tokensOrStores)) tokensOrStores = [tokensOrStores];

	        var ensureIsToken = function (tokenOrStore) {
	          return tokenOrStore instanceof Store ? tokenOrStore._token : tokenOrStore;
	        };

	        var tokens = tokensOrStores.map(ensureIsToken);

	        this.dispatcher.waitFor(tokens);
	      }
	    },
	    removeAllStoreListeners: {
	      value: function removeAllStoreListeners(event) {
	        for (var key in this._stores) {
	          if (!this._stores.hasOwnProperty(key)) continue;

	          var store = this._stores[key];

	          store.removeAllListeners(event);
	        }
	      }
	    },
	    serialize: {
	      value: function serialize() {
	        var stateTree = {};

	        for (var key in this._stores) {
	          if (!this._stores.hasOwnProperty(key)) continue;

	          var store = this._stores[key];

	          var serialize = store.constructor.serialize;

	          if (typeof serialize !== "function") continue;

	          var serializedStoreState = serialize(store.state);

	          if (typeof serializedStoreState !== "string") {
	            var className = store.constructor.name;

	            if ((undefined) !== "production") {
	              console.warn("The store with key '" + key + "' was not serialized because the static " + ("method `" + className + ".serialize()` returned a non-string with type ") + ("'" + typeof serializedStoreState + "'."));
	            }
	          }

	          stateTree[key] = serializedStoreState;

	          if (typeof store.constructor.deserialize !== "function") {
	            var className = store.constructor.name;

	            if ((undefined) !== "production") {
	              console.warn("The class `" + className + "` has a `serialize()` method, but no " + "corresponding `deserialize()` method.");
	            }
	          }
	        }

	        return JSON.stringify(stateTree);
	      }
	    },
	    deserialize: {
	      value: function deserialize(serializedState) {
	        var stateMap = undefined;

	        try {
	          stateMap = JSON.parse(serializedState);
	        } catch (error) {
	          var className = this.constructor.name;

	          if ((undefined) !== "production") {
	            throw new Error("Invalid value passed to `" + className + "#deserialize()`: " + ("" + serializedState));
	          }
	        }

	        for (var key in this._stores) {
	          if (!this._stores.hasOwnProperty(key)) continue;

	          var store = this._stores[key];

	          var deserialize = store.constructor.deserialize;

	          if (typeof deserialize !== "function") continue;

	          var storeStateString = stateMap[key];
	          var storeState = deserialize(storeStateString);

	          store.replaceState(storeState);

	          if (typeof store.constructor.serialize !== "function") {
	            var className = store.constructor.name;

	            if ((undefined) !== "production") {
	              console.warn("The class `" + className + "` has a `deserialize()` method, but no " + "corresponding `serialize()` method.");
	            }
	          }
	        }
	      }
	    }
	  });

	  return Flux;
	})(EventEmitter);

	exports["default"] = Flux;

	// Aliases
	Flux.prototype.getConstants = Flux.prototype.getActionIds;
	Flux.prototype.dehydrate = Flux.prototype.serialize;
	Flux.prototype.hydrate = Flux.prototype.deserialize;

	function getClassName(Class) {
	  return Class.prototype.constructor.name;
	}

	var Flummox = Flux;

	exports.Flux = Flux;
	exports.Flummox = Flummox;
	exports.Store = Store;
	exports.Actions = Actions;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	/**
	 * Store
	 *
	 * Stores hold application state. They respond to actions sent by the dispatcher
	 * and broadcast change events to listeners, so they can grab the latest data.
	 * The key thing to remember is that the only way stores receive information
	 * from the outside world is via the dispatcher.
	 */

	var EventEmitter = _interopRequire(__webpack_require__(4));

	var assign = _interopRequire(__webpack_require__(6));

	var Store = (function (_EventEmitter) {

	  /**
	   * Stores are initialized with a reference
	   * @type {Object}
	   */

	  function Store() {
	    _classCallCheck(this, Store);

	    this.state = undefined;

	    this._handlers = {};
	    this._asyncHandlers = {};
	  }

	  _inherits(Store, _EventEmitter);

	  _createClass(Store, {
	    getState: {

	      /**
	       * Return a (shallow) copy of the store's internal state, so that it is
	       * protected from mutation by the consumer.
	       * @returns {object}
	       */

	      value: function getState() {
	        return assign({}, this.state);
	      }
	    },
	    setState: {
	      value: function setState(newState) {
	        if (typeof this.state === "undefined") this.state = {};

	        if (this._isHandlingDispatch) {
	          this._pendingState = assign(this._pendingState, newState);
	          this._emitChangeAfterHandlingDispatch = true;
	        } else {

	          if ((undefined) !== "production") {
	            console.warn("Store#setState() called from outside an action handler. This is likely " + "a mistake. Flux stores should manage their own state.");
	          }

	          this.state = assign({}, this.state, newState);
	          this.emit("change");
	        }
	      }
	    },
	    replaceState: {
	      value: function replaceState(newState) {
	        if (typeof this.state === "undefined") this.state = {};

	        if (this._isHandlingDispatch) {
	          this._pendingState = assign({}, newState);
	          this._emitChangeAfterHandlingDispatch = true;
	        } else {
	          this.state = assign({}, newState);
	          this.emit("change");
	        }
	      }
	    },
	    forceUpdate: {
	      value: function forceUpdate() {
	        if (this._isHandlingDispatch) {
	          this._emitChangeAfterHandlingDispatch = true;
	        } else {
	          this.emit("change");
	        }
	      }
	    },
	    register: {
	      value: function register(actionId, handler) {
	        actionId = ensureActionId(actionId);

	        if (typeof handler !== "function") {
	          return;
	        }this._handlers[actionId] = handler.bind(this);
	      }
	    },
	    registerAsync: {
	      value: function registerAsync(actionId, beginHandler, successHandler, failureHandler) {
	        actionId = ensureActionId(actionId);

	        var asyncHandlers = {
	          begin: beginHandler,
	          success: successHandler,
	          failure: failureHandler };

	        for (var key in asyncHandlers) {
	          if (!asyncHandlers.hasOwnProperty(key)) continue;

	          var handler = asyncHandlers[key];

	          if (typeof handler === "function") {
	            asyncHandlers[key] = handler.bind(this);
	          } else {
	            delete asyncHandlers[key];
	          }
	        }

	        this._asyncHandlers[actionId] = asyncHandlers;
	      }
	    },
	    waitFor: {
	      value: function waitFor(tokensOrStores) {
	        this._waitFor(tokensOrStores);
	      }
	    },
	    handler: {
	      value: function handler(payload) {
	        var body = payload.body;
	        var actionId = payload.actionId;
	        var _async = payload.async;
	        var actionArgs = payload.actionArgs;
	        var error = payload.error;

	        var _handler = this._handlers[actionId];
	        var _asyncHandler = this._asyncHandlers[actionId] && this._asyncHandlers[actionId][_async];

	        if (_async) {
	          switch (_async) {
	            case "begin":
	              if (typeof _asyncHandler === "function") {
	                this._performHandler.apply(this, [_asyncHandler].concat(actionArgs));
	              }
	              return;
	            case "failure":
	              if (typeof _asyncHandler === "function") {
	                this._performHandler(_asyncHandler, error);
	              }
	              return;
	            case "success":
	              if (typeof _asyncHandler === "function") {
	                _handler = _asyncHandler;
	              }
	              break;
	            default:
	              return;
	          }
	        }

	        if (typeof _handler !== "function") {
	          return;
	        }this._performHandler(_handler, body);
	      }
	    },
	    _performHandler: {
	      value: function _performHandler(_handler) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	          args[_key - 1] = arguments[_key];
	        }

	        this._isHandlingDispatch = true;
	        this._pendingState = assign({}, this.state);
	        this._emitChangeAfterHandlingDispatch = false;

	        try {
	          _handler.apply(this, args);
	        } finally {
	          if (this._emitChangeAfterHandlingDispatch) {
	            this.state = this._pendingState;
	            this.emit("change");
	          }

	          this._isHandlingDispatch = false;
	          this._pendingState = {};
	          this._emitChangeAfterHandlingDispatch = false;
	        }
	      }
	    }
	  });

	  return Store;
	})(EventEmitter);

	module.exports = Store;

	function ensureActionId(actionOrActionId) {
	  return typeof actionOrActionId === "function" ? actionOrActionId._id : actionOrActionId;
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	/**
	 * Actions
	 *
	 * Instances of the Actions class represent a set of actions. (In Flux parlance,
	 * these might be more accurately denoted as Action Creators, while Action
	 * refers to the payload sent to the dispatcher, but this is... confusing. We
	 * will use Action to mean the function you call to trigger a dispatch.)
	 *
	 * Create actions by extending from the base Actions class and adding methods.
	 * All methods on the prototype (except the constructor) will be
	 * converted into actions. The return value of an action is used as the body
	 * of the payload sent to the dispatcher.
	 */

	var uniqueId = _interopRequire(__webpack_require__(7));

	var Actions = (function () {
	  function Actions() {
	    _classCallCheck(this, Actions);

	    this._baseId = uniqueId();

	    var methodNames = this._getActionMethodNames();
	    for (var i = 0; i < methodNames.length; i++) {
	      var methodName = methodNames[i];
	      this._wrapAction(methodName);
	    }

	    this.getConstants = this.getActionIds;
	  }

	  _createClass(Actions, {
	    getActionIds: {
	      value: function getActionIds() {
	        var _this = this;

	        return this._getActionMethodNames().reduce(function (result, actionName) {
	          result[actionName] = _this[actionName]._id;
	          return result;
	        }, {});
	      }
	    },
	    _getActionMethodNames: {
	      value: function _getActionMethodNames(instance) {
	        var _this = this;

	        return Object.getOwnPropertyNames(this.constructor.prototype).filter(function (name) {
	          return name !== "constructor" && typeof _this[name] === "function";
	        });
	      }
	    },
	    _wrapAction: {
	      value: function _wrapAction(methodName) {
	        var _this = this;

	        var originalMethod = this[methodName];
	        var actionId = this._createActionId(methodName);

	        var action = function () {
	          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	          }

	          var body = originalMethod.apply(_this, args);

	          if (isPromise(body)) {
	            var promise = body;
	            _this._dispatchAsync(actionId, promise, args, methodName)
	            // Catch errors and do nothing
	            // They can be handled by store or caller
	            ["catch"](function (error) {});

	            return promise;
	          } else {
	            return _this._dispatch(actionId, body, args, methodName);
	          }
	        };

	        action._id = actionId;

	        this[methodName] = action;
	      }
	    },
	    _createActionId: {

	      /**
	       * Create unique string constant for an action method, using
	       * @param {string} methodName - Name of the action method
	       */

	      value: function _createActionId(methodName) {
	        return "" + this._baseId + "-" + methodName;
	      }
	    },
	    _dispatch: {
	      value: function _dispatch(actionId, body, args, methodName) {
	        if (typeof this.dispatch === "function") {
	          if (typeof body !== "undefined") {
	            this.dispatch(actionId, body, args);
	          }
	        } else {
	          if ((undefined) !== "production") {
	            console.warn("You've attempted to perform the action " + ("" + this.constructor.name + "#" + methodName + ", but it hasn't been added ") + "to a Flux instance.");
	          }
	        }

	        return body;
	      }
	    },
	    _dispatchAsync: {
	      value: function _dispatchAsync(actionId, promise, args, methodName) {
	        if (typeof this.dispatchAsync === "function") {
	          return this.dispatchAsync(actionId, promise, args);
	        } else {
	          if ((undefined) !== "production") {
	            console.warn("You've attempted to perform the asynchronous action " + ("" + this.constructor.name + "#" + methodName + ", but it hasn't been added ") + "to a Flux instance.");
	          }

	          return promise;
	        }
	      }
	    }
	  });

	  return Actions;
	})();

	module.exports = Actions;

	function isPromise(value) {
	  return value && typeof value.then === "function";
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	module.exports.Dispatcher = __webpack_require__(5)


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Representation of a single EventEmitter function.
	 *
	 * @param {Function} fn Event handler to be called.
	 * @param {Mixed} context Context for function execution.
	 * @param {Boolean} once Only emit once
	 * @api private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}

	/**
	 * Minimal EventEmitter interface that is molded against the Node.js
	 * EventEmitter interface.
	 *
	 * @constructor
	 * @api public
	 */
	function EventEmitter() { /* Nothing to set */ }

	/**
	 * Holds the assigned EventEmitters by name.
	 *
	 * @type {Object}
	 * @private
	 */
	EventEmitter.prototype._events = undefined;

	/**
	 * Return a list of assigned event listeners.
	 *
	 * @param {String} event The events that should be listed.
	 * @returns {Array}
	 * @api public
	 */
	EventEmitter.prototype.listeners = function listeners(event) {
	  if (!this._events || !this._events[event]) return [];
	  if (this._events[event].fn) return [this._events[event].fn];

	  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
	    ee[i] = this._events[event][i].fn;
	  }

	  return ee;
	};

	/**
	 * Emit an event to all registered event listeners.
	 *
	 * @param {String} event The name of the event.
	 * @returns {Boolean} Indication if we've emitted an event.
	 * @api public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  if (!this._events || !this._events[event]) return false;

	  var listeners = this._events[event]
	    , len = arguments.length
	    , args
	    , i;

	  if ('function' === typeof listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, true);

	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }

	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }

	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;

	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }

	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }

	  return true;
	};

	/**
	 * Register a new EventListener for the given event.
	 *
	 * @param {String} event Name of the event.
	 * @param {Functon} fn Callback function.
	 * @param {Mixed} context The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  var listener = new EE(fn, context || this);

	  if (!this._events) this._events = {};
	  if (!this._events[event]) this._events[event] = listener;
	  else {
	    if (!this._events[event].fn) this._events[event].push(listener);
	    else this._events[event] = [
	      this._events[event], listener
	    ];
	  }

	  return this;
	};

	/**
	 * Add an EventListener that's only called once.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} context The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  var listener = new EE(fn, context || this, true);

	  if (!this._events) this._events = {};
	  if (!this._events[event]) this._events[event] = listener;
	  else {
	    if (!this._events[event].fn) this._events[event].push(listener);
	    else this._events[event] = [
	      this._events[event], listener
	    ];
	  }

	  return this;
	};

	/**
	 * Remove event listeners.
	 *
	 * @param {String} event The event we want to remove.
	 * @param {Function} fn The listener that we need to find.
	 * @param {Boolean} once Only remove once listeners.
	 * @api public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
	  if (!this._events || !this._events[event]) return this;

	  var listeners = this._events[event]
	    , events = [];

	  if (fn) {
	    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
	      events.push(listeners);
	    }
	    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
	      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
	        events.push(listeners[i]);
	      }
	    }
	  }

	  //
	  // Reset the array, or remove it completely if we have no more listeners.
	  //
	  if (events.length) {
	    this._events[event] = events.length === 1 ? events[0] : events;
	  } else {
	    delete this._events[event];
	  }

	  return this;
	};

	/**
	 * Remove all listeners or only the listeners for the specified event.
	 *
	 * @param {String} event The event want to remove all listeners for.
	 * @api public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  if (!this._events) return this;

	  if (event) delete this._events[event];
	  else this._events = {};

	  return this;
	};

	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;

	//
	// This function doesn't apply anymore.
	//
	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
	  return this;
	};

	//
	// Expose the module.
	//
	EventEmitter.EventEmitter = EventEmitter;
	EventEmitter.EventEmitter2 = EventEmitter;
	EventEmitter.EventEmitter3 = EventEmitter;

	//
	// Expose the module.
	//
	module.exports = EventEmitter;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Dispatcher
	 * @typechecks
	 */

	"use strict";

	var invariant = __webpack_require__(8);

	var _lastID = 1;
	var _prefix = 'ID_';

	/**
	 * Dispatcher is used to broadcast payloads to registered callbacks. This is
	 * different from generic pub-sub systems in two ways:
	 *
	 *   1) Callbacks are not subscribed to particular events. Every payload is
	 *      dispatched to every registered callback.
	 *   2) Callbacks can be deferred in whole or part until other callbacks have
	 *      been executed.
	 *
	 * For example, consider this hypothetical flight destination form, which
	 * selects a default city when a country is selected:
	 *
	 *   var flightDispatcher = new Dispatcher();
	 *
	 *   // Keeps track of which country is selected
	 *   var CountryStore = {country: null};
	 *
	 *   // Keeps track of which city is selected
	 *   var CityStore = {city: null};
	 *
	 *   // Keeps track of the base flight price of the selected city
	 *   var FlightPriceStore = {price: null}
	 *
	 * When a user changes the selected city, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'city-update',
	 *     selectedCity: 'paris'
	 *   });
	 *
	 * This payload is digested by `CityStore`:
	 *
	 *   flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'city-update') {
	 *       CityStore.city = payload.selectedCity;
	 *     }
	 *   });
	 *
	 * When the user selects a country, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'country-update',
	 *     selectedCountry: 'australia'
	 *   });
	 *
	 * This payload is digested by both stores:
	 *
	 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       CountryStore.country = payload.selectedCountry;
	 *     }
	 *   });
	 *
	 * When the callback to update `CountryStore` is registered, we save a reference
	 * to the returned token. Using this token with `waitFor()`, we can guarantee
	 * that `CountryStore` is updated before the callback that updates `CityStore`
	 * needs to query its data.
	 *
	 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       // `CountryStore.country` may not be updated.
	 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
	 *       // `CountryStore.country` is now guaranteed to be updated.
	 *
	 *       // Select the default city for the new country
	 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
	 *     }
	 *   });
	 *
	 * The usage of `waitFor()` can be chained, for example:
	 *
	 *   FlightPriceStore.dispatchToken =
	 *     flightDispatcher.register(function(payload) {
	 *       switch (payload.actionType) {
	 *         case 'country-update':
	 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
	 *           FlightPriceStore.price =
	 *             getFlightPriceStore(CountryStore.country, CityStore.city);
	 *           break;
	 *
	 *         case 'city-update':
	 *           FlightPriceStore.price =
	 *             FlightPriceStore(CountryStore.country, CityStore.city);
	 *           break;
	 *     }
	 *   });
	 *
	 * The `country-update` payload will be guaranteed to invoke the stores'
	 * registered callbacks in order: `CountryStore`, `CityStore`, then
	 * `FlightPriceStore`.
	 */

	  function Dispatcher() {
	    this.$Dispatcher_callbacks = {};
	    this.$Dispatcher_isPending = {};
	    this.$Dispatcher_isHandled = {};
	    this.$Dispatcher_isDispatching = false;
	    this.$Dispatcher_pendingPayload = null;
	  }

	  /**
	   * Registers a callback to be invoked with every dispatched payload. Returns
	   * a token that can be used with `waitFor()`.
	   *
	   * @param {function} callback
	   * @return {string}
	   */
	  Dispatcher.prototype.register=function(callback) {
	    var id = _prefix + _lastID++;
	    this.$Dispatcher_callbacks[id] = callback;
	    return id;
	  };

	  /**
	   * Removes a callback based on its token.
	   *
	   * @param {string} id
	   */
	  Dispatcher.prototype.unregister=function(id) {
	    invariant(
	      this.$Dispatcher_callbacks[id],
	      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
	      id
	    );
	    delete this.$Dispatcher_callbacks[id];
	  };

	  /**
	   * Waits for the callbacks specified to be invoked before continuing execution
	   * of the current callback. This method should only be used by a callback in
	   * response to a dispatched payload.
	   *
	   * @param {array<string>} ids
	   */
	  Dispatcher.prototype.waitFor=function(ids) {
	    invariant(
	      this.$Dispatcher_isDispatching,
	      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
	    );
	    for (var ii = 0; ii < ids.length; ii++) {
	      var id = ids[ii];
	      if (this.$Dispatcher_isPending[id]) {
	        invariant(
	          this.$Dispatcher_isHandled[id],
	          'Dispatcher.waitFor(...): Circular dependency detected while ' +
	          'waiting for `%s`.',
	          id
	        );
	        continue;
	      }
	      invariant(
	        this.$Dispatcher_callbacks[id],
	        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
	        id
	      );
	      this.$Dispatcher_invokeCallback(id);
	    }
	  };

	  /**
	   * Dispatches a payload to all registered callbacks.
	   *
	   * @param {object} payload
	   */
	  Dispatcher.prototype.dispatch=function(payload) {
	    invariant(
	      !this.$Dispatcher_isDispatching,
	      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
	    );
	    this.$Dispatcher_startDispatching(payload);
	    try {
	      for (var id in this.$Dispatcher_callbacks) {
	        if (this.$Dispatcher_isPending[id]) {
	          continue;
	        }
	        this.$Dispatcher_invokeCallback(id);
	      }
	    } finally {
	      this.$Dispatcher_stopDispatching();
	    }
	  };

	  /**
	   * Is this Dispatcher currently dispatching.
	   *
	   * @return {boolean}
	   */
	  Dispatcher.prototype.isDispatching=function() {
	    return this.$Dispatcher_isDispatching;
	  };

	  /**
	   * Call the callback stored with the given id. Also do some internal
	   * bookkeeping.
	   *
	   * @param {string} id
	   * @internal
	   */
	  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
	    this.$Dispatcher_isPending[id] = true;
	    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
	    this.$Dispatcher_isHandled[id] = true;
	  };

	  /**
	   * Set up bookkeeping needed when dispatching.
	   *
	   * @param {object} payload
	   * @internal
	   */
	  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
	    for (var id in this.$Dispatcher_callbacks) {
	      this.$Dispatcher_isPending[id] = false;
	      this.$Dispatcher_isHandled[id] = false;
	    }
	    this.$Dispatcher_pendingPayload = payload;
	    this.$Dispatcher_isDispatching = true;
	  };

	  /**
	   * Clear bookkeeping used for dispatching.
	   *
	   * @internal
	   */
	  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
	    this.$Dispatcher_pendingPayload = null;
	    this.$Dispatcher_isDispatching = false;
	  };


	module.exports = Dispatcher;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = Object.keys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	var count = 0;

	/**
	 * Generate a unique ID.
	 *
	 * Optionally pass a prefix to prepend, a suffix to append, or a
	 * multiplier to use on the ID.
	 *
	 * ```js
	 * uniqueId(); //=> '25'
	 *
	 * uniqueId({prefix: 'apple_'});
	 * //=> 'apple_10'
	 *
	 * uniqueId({suffix: '_orange'});
	 * //=> '10_orange'
	 *
	 * uniqueId({multiplier: 5});
	 * //=> 5, 10, 15, 20...
	 * ```
	 *
	 * To reset the `id` to zero, do `id.reset()`.
	 *
	 * @param  {Object} `options` Optionally pass a `prefix`, `suffix` and/or `multiplier.
	 * @return {String} The unique id.
	 * @api public
	 */

	var id = module.exports = function (options) {
	  options = options || {};

	  var prefix = options.prefix;
	  var suffix = options.suffix;

	  var id = ++count * (options.multiplier || 1);

	  if (prefix == null) {
	    prefix = '';
	  }

	  if (suffix == null) {
	    suffix = '';
	  }

	  return String(prefix) + id + String(suffix);
	};


	id.reset = function() {
	  return count = 0;
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */

	"use strict";

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var invariant = function(condition, format, a, b, c, d, e, f) {
	  if (false) {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error(
	        'Minified exception occurred; use the non-minified dev environment ' +
	        'for the full error message and additional helpful warnings.'
	      );
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(
	        'Invariant Violation: ' +
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;


/***/ }
/******/ ])