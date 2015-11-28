var Flummox =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Actions = exports.Store = exports.Flummox = exports.Flux = undefined;

	var _stringify = __webpack_require__(11);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _typeof2 = __webpack_require__(6);

	var _typeof3 = _interopRequireDefault(_typeof2);

	var _getPrototypeOf = __webpack_require__(12);

	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(8);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _possibleConstructorReturn2 = __webpack_require__(9);

	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

	var _inherits2 = __webpack_require__(10);

	var _inherits3 = _interopRequireDefault(_inherits2);

	var _Store2 = __webpack_require__(1);

	var _Store3 = _interopRequireDefault(_Store2);

	var _Actions3 = __webpack_require__(2);

	var _Actions4 = _interopRequireDefault(_Actions3);

	var _flux = __webpack_require__(3);

	var _eventemitter = __webpack_require__(5);

	var _eventemitter2 = _interopRequireDefault(_eventemitter);

	var _objectAssign = __webpack_require__(4);

	var _objectAssign2 = _interopRequireDefault(_objectAssign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Flux = (function (_EventEmitter) {
	  (0, _inherits3.default)(Flux, _EventEmitter);

	  function Flux() {
	    (0, _classCallCheck3.default)(this, Flux);

	    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Flux).call(this));

	    _this.dispatcher = new _flux.Dispatcher();

	    _this._stores = {};
	    _this._actions = {};
	    return _this;
	  }

	  (0, _createClass3.default)(Flux, [{
	    key: 'createStore',
	    value: function createStore(key, _Store) {

	      if (!(_Store.prototype instanceof _Store3.default)) {
	        var className = getClassName(_Store);

	        throw new Error('You\'ve attempted to create a store from the class ' + className + ', which ' + 'does not have the base Store class in its prototype chain. Make sure ' + ('you\'re using the `extends` keyword: `class ' + className + ' extends ') + 'Store { ... }`');
	      }

	      if (this._stores.hasOwnProperty(key) && this._stores[key]) {
	        throw new Error('You\'ve attempted to create multiple stores with key ' + key + '. Keys must ' + 'be unique.');
	      }

	      for (var _len = arguments.length, constructorArgs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	        constructorArgs[_key - 2] = arguments[_key];
	      }

	      var store = new (Function.prototype.bind.apply(_Store, [null].concat(constructorArgs)))();
	      var token = this.dispatcher.register(store.handler.bind(store));

	      store._waitFor = this.waitFor.bind(this);
	      store._token = token;
	      store._getAllActionIds = this.getAllActionIds.bind(this);

	      this._stores[key] = store;

	      return store;
	    }
	  }, {
	    key: 'getStore',
	    value: function getStore(key) {
	      return this._stores.hasOwnProperty(key) ? this._stores[key] : undefined;
	    }
	  }, {
	    key: 'removeStore',
	    value: function removeStore(key) {
	      if (this._stores.hasOwnProperty(key)) {
	        this._stores[key].removeAllListeners();
	        this.dispatcher.unregister(this._stores[key]._token);
	        delete this._stores[key];
	      } else {
	        throw new Error('You\'ve attempted to remove store with key ' + key + ' which does not exist.');
	      }
	    }
	  }, {
	    key: 'createActions',
	    value: function createActions(key, _Actions) {
	      if (!(_Actions.prototype instanceof _Actions4.default) && _Actions !== _Actions4.default) {
	        if (typeof _Actions === 'function') {
	          var className = getClassName(_Actions);

	          throw new Error('You\'ve attempted to create actions from the class ' + className + ', which ' + 'does not have the base Actions class in its prototype chain. Make ' + ('sure you\'re using the `extends` keyword: `class ' + className + ' ') + 'extends Actions { ... }`');
	        } else {
	          var properties = _Actions;
	          _Actions = (function (_Actions2) {
	            (0, _inherits3.default)(_class, _Actions2);

	            function _class() {
	              (0, _classCallCheck3.default)(this, _class);
	              return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
	            }

	            return _class;
	          })(_Actions4.default);
	          (0, _objectAssign2.default)(_Actions.prototype, properties);
	        }
	      }

	      if (this._actions.hasOwnProperty(key) && this._actions[key]) {
	        throw new Error('You\'ve attempted to create multiple actions with key ' + key + '. Keys ' + 'must be unique.');
	      }

	      for (var _len2 = arguments.length, constructorArgs = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	        constructorArgs[_key2 - 2] = arguments[_key2];
	      }

	      var actions = new (Function.prototype.bind.apply(_Actions, [null].concat(constructorArgs)))();
	      actions.dispatch = this.dispatch.bind(this);
	      actions.dispatchAsync = this.dispatchAsync.bind(this);

	      this._actions[key] = actions;

	      return actions;
	    }
	  }, {
	    key: 'getActions',
	    value: function getActions(key) {
	      return this._actions.hasOwnProperty(key) ? this._actions[key] : undefined;
	    }
	  }, {
	    key: 'getActionIds',
	    value: function getActionIds(key) {
	      var actions = this.getActions(key);

	      if (!actions) return;

	      return actions.getConstants();
	    }
	  }, {
	    key: 'removeActions',
	    value: function removeActions(key) {
	      if (this._actions.hasOwnProperty(key)) {
	        delete this._actions[key];
	      } else {
	        throw new Error('You\'ve attempted to remove actions with key ' + key + ' which does not exist.');
	      }
	    }
	  }, {
	    key: 'getAllActionIds',
	    value: function getAllActionIds() {
	      var actionIds = [];

	      for (var key in this._actions) {
	        if (!this._actions.hasOwnProperty(key)) continue;

	        var actionConstants = this._actions[key].getConstants();

	        actionIds = actionIds.concat(getValues(actionConstants));
	      }

	      return actionIds;
	    }
	  }, {
	    key: 'dispatch',
	    value: function dispatch(actionId, body) {
	      this._dispatch({ actionId: actionId, body: body });
	    }
	  }, {
	    key: 'dispatchAsync',
	    value: function dispatchAsync(actionId, promise, actionArgs) {
	      var _this3 = this;

	      var payload = {
	        actionId: actionId,
	        async: 'begin'
	      };

	      if (actionArgs) payload.actionArgs = actionArgs;

	      this._dispatch(payload);

	      return promise.then(function (body) {
	        _this3._dispatch({
	          actionId: actionId,
	          body: body,
	          async: 'success'
	        });

	        return body;
	      }, function (error) {
	        _this3._dispatch({
	          actionId: actionId,
	          error: error,
	          async: 'failure'
	        });
	      }).catch(function (error) {
	        _this3.emit('error', error);

	        throw error;
	      });
	    }
	  }, {
	    key: '_dispatch',
	    value: function _dispatch(payload) {
	      this.dispatcher.dispatch(payload);
	      this.emit('dispatch', payload);
	    }
	  }, {
	    key: 'waitFor',
	    value: function waitFor(tokensOrStores) {

	      if (!Array.isArray(tokensOrStores)) tokensOrStores = [tokensOrStores];

	      var ensureIsToken = function ensureIsToken(tokenOrStore) {
	        return tokenOrStore instanceof _Store3.default ? tokenOrStore._token : tokenOrStore;
	      };

	      var tokens = tokensOrStores.map(ensureIsToken);

	      this.dispatcher.waitFor(tokens);
	    }
	  }, {
	    key: 'removeAllStoreListeners',
	    value: function removeAllStoreListeners(event) {
	      for (var key in this._stores) {
	        if (!this._stores.hasOwnProperty(key)) continue;

	        var store = this._stores[key];

	        store.removeAllListeners(event);
	      }
	    }
	  }, {
	    key: 'serialize',
	    value: function serialize() {
	      var stateTree = {};

	      for (var key in this._stores) {
	        if (!this._stores.hasOwnProperty(key)) continue;

	        var store = this._stores[key];

	        var _serialize = store.constructor.serialize;

	        if (typeof _serialize !== 'function') continue;

	        var serializedStoreState = _serialize(store.state);

	        if (typeof serializedStoreState !== 'string') {
	          var className = store.constructor.name;

	          if ((undefined) !== 'production') {
	            console.warn('The store with key \'' + key + '\' was not serialized because the static ' + ('method `' + className + '.serialize()` returned a non-string with type ') + ('\'' + (typeof serializedStoreState === 'undefined' ? 'undefined' : (0, _typeof3.default)(serializedStoreState)) + '\'.'));
	          }
	        }

	        stateTree[key] = serializedStoreState;

	        if (typeof store.constructor.deserialize !== 'function') {
	          var className = store.constructor.name;

	          if ((undefined) !== 'production') {
	            console.warn('The class `' + className + '` has a `serialize()` method, but no ' + 'corresponding `deserialize()` method.');
	          }
	        }
	      }

	      return (0, _stringify2.default)(stateTree);
	    }
	  }, {
	    key: 'deserialize',
	    value: function deserialize(serializedState) {
	      var stateMap = undefined;

	      try {
	        stateMap = JSON.parse(serializedState);
	      } catch (error) {
	        var className = this.constructor.name;

	        if ((undefined) !== 'production') {
	          throw new Error('Invalid value passed to `' + className + '#deserialize()`: ' + ('' + serializedState));
	        }
	      }

	      for (var key in this._stores) {
	        if (!this._stores.hasOwnProperty(key)) continue;

	        var store = this._stores[key];

	        var _deserialize = store.constructor.deserialize;

	        if (typeof _deserialize !== 'function') continue;

	        var storeStateString = stateMap[key];
	        var storeState = _deserialize(storeStateString);

	        store.replaceState(storeState);

	        if (typeof store.constructor.serialize !== 'function') {
	          var className = store.constructor.name;

	          if ((undefined) !== 'production') {
	            console.warn('The class `' + className + '` has a `deserialize()` method, but no ' + 'corresponding `serialize()` method.');
	          }
	        }
	      }
	    }
	  }]);
	  return Flux;
	})(_eventemitter2.default);

	// Aliases
	/**
	 * Flux
	 *
	 * The main Flux class.
	 */

	exports.default = Flux;
	Flux.prototype.getConstants = Flux.prototype.getActionIds;
	Flux.prototype.getAllConstants = Flux.prototype.getAllActionIds;
	Flux.prototype.dehydrate = Flux.prototype.serialize;
	Flux.prototype.hydrate = Flux.prototype.deserialize;

	function getClassName(Class) {
	  return Class.prototype.constructor.name;
	}

	function getValues(object) {
	  var values = [];

	  for (var key in object) {
	    if (!object.hasOwnProperty(key)) continue;

	    values.push(object[key]);
	  }

	  return values;
	}

	var Flummox = Flux;

	exports.Flux = Flux;
	exports.Flummox = Flummox;
	exports.Store = _Store3.default;
	exports.Actions = _Actions4.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _keys = __webpack_require__(13);

	var _keys2 = _interopRequireDefault(_keys);

	var _getPrototypeOf = __webpack_require__(12);

	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(8);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _possibleConstructorReturn2 = __webpack_require__(9);

	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

	var _inherits2 = __webpack_require__(10);

	var _inherits3 = _interopRequireDefault(_inherits2);

	var _eventemitter = __webpack_require__(5);

	var _eventemitter2 = _interopRequireDefault(_eventemitter);

	var _objectAssign = __webpack_require__(4);

	var _objectAssign2 = _interopRequireDefault(_objectAssign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Store
	 *
	 * Stores hold application state. They respond to actions sent by the dispatcher
	 * and broadcast change events to listeners, so they can grab the latest data.
	 * The key thing to remember is that the only way stores receive information
	 * from the outside world is via the dispatcher.
	 */

	var Store = (function (_EventEmitter) {
	  (0, _inherits3.default)(Store, _EventEmitter);

	  /**
	   * Stores are initialized with a reference
	   * @type {Object}
	   */

	  function Store() {
	    (0, _classCallCheck3.default)(this, Store);

	    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Store).call(this));

	    _this.state = null;

	    _this._handlers = {};
	    _this._asyncHandlers = {};
	    _this._catchAllHandlers = [];
	    _this._catchAllAsyncHandlers = {
	      begin: [],
	      success: [],
	      failure: []
	    };
	    return _this;
	  }

	  (0, _createClass3.default)(Store, [{
	    key: 'setState',
	    value: function setState(newState) {
	      // Do a transactional state update if a function is passed
	      if (typeof newState === 'function') {
	        var prevState = this._isHandlingDispatch ? this._pendingState : this.state;

	        newState = newState(prevState);
	      }

	      if (this._isHandlingDispatch) {
	        this._pendingState = this._assignState(this._pendingState, newState);
	        this._emitChangeAfterHandlingDispatch = true;
	      } else {
	        this.state = this._assignState(this.state, newState);
	        this.emit('change');
	      }
	    }
	  }, {
	    key: 'replaceState',
	    value: function replaceState(newState) {
	      if (this._isHandlingDispatch) {
	        this._pendingState = this._assignState(undefined, newState);
	        this._emitChangeAfterHandlingDispatch = true;
	      } else {
	        this.state = this._assignState(undefined, newState);
	        this.emit('change');
	      }
	    }
	  }, {
	    key: 'getStateAsObject',
	    value: function getStateAsObject() {
	      return this.state;
	    }
	  }, {
	    key: '_assignState',
	    value: function _assignState() {
	      return (this.constructor.assignState || Store.assignState).apply(undefined, arguments);
	    }
	  }, {
	    key: 'forceUpdate',
	    value: function forceUpdate() {
	      if (this._isHandlingDispatch) {
	        this._emitChangeAfterHandlingDispatch = true;
	      } else {
	        this.emit('change');
	      }
	    }
	  }, {
	    key: 'register',
	    value: function register(actionId, handler) {
	      actionId = ensureActionId(actionId);

	      if (typeof handler !== 'function') return;

	      this._handlers[actionId] = handler.bind(this);
	    }
	  }, {
	    key: 'registerAsync',
	    value: function registerAsync(actionId, beginHandler, successHandler, failureHandler) {
	      actionId = ensureActionId(actionId);

	      var asyncHandlers = this._bindAsyncHandlers({
	        begin: beginHandler,
	        success: successHandler,
	        failure: failureHandler
	      });

	      this._asyncHandlers[actionId] = asyncHandlers;
	    }
	  }, {
	    key: 'registerAll',
	    value: function registerAll(handler) {
	      if (typeof handler !== 'function') return;

	      this._catchAllHandlers.push(handler.bind(this));
	    }
	  }, {
	    key: 'registerAllAsync',
	    value: function registerAllAsync(beginHandler, successHandler, failureHandler) {
	      var _this2 = this;

	      var asyncHandlers = this._bindAsyncHandlers({
	        begin: beginHandler,
	        success: successHandler,
	        failure: failureHandler
	      });

	      (0, _keys2.default)(asyncHandlers).forEach(function (key) {
	        _this2._catchAllAsyncHandlers[key].push(asyncHandlers[key]);
	      });
	    }
	  }, {
	    key: '_bindAsyncHandlers',
	    value: function _bindAsyncHandlers(asyncHandlers) {
	      for (var key in asyncHandlers) {
	        if (!asyncHandlers.hasOwnProperty(key)) continue;

	        var handler = asyncHandlers[key];

	        if (typeof handler === 'function') {
	          asyncHandlers[key] = handler.bind(this);
	        } else {
	          delete asyncHandlers[key];
	        }
	      }

	      return asyncHandlers;
	    }
	  }, {
	    key: 'waitFor',
	    value: function waitFor(tokensOrStores) {
	      this._waitFor(tokensOrStores);
	    }
	  }, {
	    key: 'handler',
	    value: function handler(payload) {
	      var body = payload.body;
	      var actionId = payload.actionId;
	      var _async = payload['async'];
	      var actionArgs = payload.actionArgs;
	      var error = payload.error;

	      var _allHandlers = this._catchAllHandlers;
	      var _handler = this._handlers[actionId];

	      var _allAsyncHandlers = this._catchAllAsyncHandlers[_async];
	      var _asyncHandler = this._asyncHandlers[actionId] && this._asyncHandlers[actionId][_async];

	      if (_async) {
	        var beginOrFailureHandlers = _allAsyncHandlers.concat([_asyncHandler]);

	        switch (_async) {
	          case 'begin':
	            this._performHandler(beginOrFailureHandlers, actionArgs);
	            return;
	          case 'failure':
	            this._performHandler(beginOrFailureHandlers, [error]);
	            return;
	          case 'success':
	            this._performHandler(_allAsyncHandlers.concat([_asyncHandler || _handler].concat(_asyncHandler && [] || _allHandlers)), [body]);
	            return;
	          default:
	            return;
	        }
	      }

	      this._performHandler(_allHandlers.concat([_handler]), [body]);
	    }
	  }, {
	    key: '_performHandler',
	    value: function _performHandler(_handlers, args) {
	      this._isHandlingDispatch = true;
	      this._pendingState = this._assignState(undefined, this.state);
	      this._emitChangeAfterHandlingDispatch = false;

	      try {
	        this._performHandlers(_handlers, args);
	      } finally {
	        if (this._emitChangeAfterHandlingDispatch) {
	          this.state = this._pendingState;
	          this.emit('change');
	        }

	        this._isHandlingDispatch = false;
	        this._pendingState = undefined;
	        this._emitChangeAfterHandlingDispatch = false;
	      }
	    }
	  }, {
	    key: '_performHandlers',
	    value: function _performHandlers(_handlers, args) {
	      var _this3 = this;

	      _handlers.forEach(function (_handler) {
	        return typeof _handler === 'function' && _handler.apply(_this3, args);
	      });
	    }
	  }], [{
	    key: 'assignState',
	    value: function assignState(oldState, newState) {
	      return (0, _objectAssign2.default)({}, oldState, newState);
	    }
	  }]);
	  return Store;
	})(_eventemitter2.default);

	exports.default = Store;

	function ensureActionId(actionOrActionId) {
	  return typeof actionOrActionId === 'function' ? actionOrActionId._id : actionOrActionId;
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _getOwnPropertyNames = __webpack_require__(14);

	var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(8);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _uniqueid = __webpack_require__(15);

	var _uniqueid2 = _interopRequireDefault(_uniqueid);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Actions = (function () {
	  function Actions() {
	    (0, _classCallCheck3.default)(this, Actions);

	    this._baseId = (0, _uniqueid2.default)();

	    var methodNames = this._getActionMethodNames();
	    for (var i = 0; i < methodNames.length; i++) {
	      var methodName = methodNames[i];
	      this._wrapAction(methodName);
	    }

	    this.getConstants = this.getActionIds;
	  }

	  (0, _createClass3.default)(Actions, [{
	    key: 'getActionIds',
	    value: function getActionIds() {
	      var _this = this;

	      return this._getActionMethodNames().reduce(function (result, actionName) {
	        result[actionName] = _this[actionName]._id;
	        return result;
	      }, {});
	    }
	  }, {
	    key: '_getActionMethodNames',
	    value: function _getActionMethodNames(instance) {
	      var _this2 = this;

	      return (0, _getOwnPropertyNames2.default)(this.constructor.prototype).filter(function (name) {
	        return name !== 'constructor' && typeof _this2[name] === 'function';
	      });
	    }
	  }, {
	    key: '_wrapAction',
	    value: function _wrapAction(methodName) {
	      var _this3 = this;

	      var originalMethod = this[methodName];
	      var actionId = this._createActionId(methodName);

	      var action = function action() {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments[_key];
	        }

	        var body = originalMethod.apply(_this3, args);

	        if (isPromise(body)) {
	          var promise = body;
	          _this3._dispatchAsync(actionId, promise, args, methodName);
	        } else {
	          _this3._dispatch(actionId, body, args, methodName);
	        }

	        // Return original method's return value to caller
	        return body;
	      };

	      action._id = actionId;

	      this[methodName] = action;
	    }

	    /**
	     * Create unique string constant for an action method, using
	     * @param {string} methodName - Name of the action method
	     */

	  }, {
	    key: '_createActionId',
	    value: function _createActionId(methodName) {
	      return this._baseId + '-' + methodName;
	    }
	  }, {
	    key: '_dispatch',
	    value: function _dispatch(actionId, body, args, methodName) {
	      if (typeof this.dispatch === 'function') {
	        if (typeof body !== 'undefined') {
	          this.dispatch(actionId, body, args);
	        }
	      } else {
	        if ((undefined) !== 'production') {
	          console.warn('You\'ve attempted to perform the action ' + (this.constructor.name + '#' + methodName + ', but it hasn\'t been added ') + 'to a Flux instance.');
	        }
	      }

	      return body;
	    }
	  }, {
	    key: '_dispatchAsync',
	    value: function _dispatchAsync(actionId, promise, args, methodName) {
	      if (typeof this.dispatchAsync === 'function') {
	        this.dispatchAsync(actionId, promise, args);
	      } else {
	        if ((undefined) !== 'production') {
	          console.warn('You\'ve attempted to perform the asynchronous action ' + (this.constructor.name + '#' + methodName + ', but it hasn\'t been added ') + 'to a Flux instance.');
	        }
	      }
	    }
	  }]);
	  return Actions;
	})(); /**
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

	exports.default = Actions;

	function isPromise(value) {
	  return value && typeof value.then === 'function';
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	module.exports.Dispatcher = __webpack_require__(16)


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-disable no-unused-vars */
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 5 */
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Symbol = __webpack_require__(17)["default"];

	exports["default"] = function (obj) {
	  return obj && obj.constructor === _Symbol ? "symbol" : typeof obj;
	};

	exports.__esModule = true;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	exports.__esModule = true;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _defineProperty = __webpack_require__(18);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = (function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	})();

	exports.__esModule = true;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(6);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
	};

	exports.__esModule = true;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Object$create = __webpack_require__(19)["default"];

	var _Object$setPrototypeOf = __webpack_require__(20)["default"];

	exports["default"] = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = _Object$create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	exports.__esModule = true;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(22), __esModule: true };

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(23), __esModule: true };

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(24), __esModule: true };

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(25), __esModule: true };

/***/ },
/* 15 */
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
/* 16 */
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

	var invariant = __webpack_require__(21);

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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(29), __esModule: true };

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(26), __esModule: true };

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(27), __esModule: true };

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(28), __esModule: true };

/***/ },
/* 21 */
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


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var core = __webpack_require__(30);
	module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
	  return (core.JSON && core.JSON.stringify || JSON.stringify).apply(JSON, arguments);
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(33);
	module.exports = __webpack_require__(30).Object.getPrototypeOf;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(34);
	module.exports = __webpack_require__(30).Object.keys;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(31);
	__webpack_require__(32);
	module.exports = function getOwnPropertyNames(it){
	  return $.getNames(it);
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(31);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(31);
	module.exports = function create(P, D){
	  return $.create(P, D);
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(35);
	module.exports = __webpack_require__(30).Object.setPrototypeOf;

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(36);
	__webpack_require__(37);
	module.exports = __webpack_require__(30).Symbol;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var core = module.exports = {version: '1.2.6'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 Object.getOwnPropertyNames(O)
	__webpack_require__(38)('getOwnPropertyNames', function(){
	  return __webpack_require__(39).get;
	});

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 Object.getPrototypeOf(O)
	var toObject = __webpack_require__(40);

	__webpack_require__(38)('getPrototypeOf', function($getPrototypeOf){
	  return function getPrototypeOf(it){
	    return $getPrototypeOf(toObject(it));
	  };
	});

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(40);

	__webpack_require__(38)('keys', function($keys){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $export = __webpack_require__(41);
	$export($export.S, 'Object', {setPrototypeOf: __webpack_require__(42).set});

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var $              = __webpack_require__(31)
	  , global         = __webpack_require__(43)
	  , has            = __webpack_require__(44)
	  , DESCRIPTORS    = __webpack_require__(45)
	  , $export        = __webpack_require__(41)
	  , redefine       = __webpack_require__(46)
	  , $fails         = __webpack_require__(47)
	  , shared         = __webpack_require__(48)
	  , setToStringTag = __webpack_require__(49)
	  , uid            = __webpack_require__(50)
	  , wks            = __webpack_require__(51)
	  , keyOf          = __webpack_require__(52)
	  , $names         = __webpack_require__(39)
	  , enumKeys       = __webpack_require__(53)
	  , isArray        = __webpack_require__(54)
	  , anObject       = __webpack_require__(55)
	  , toIObject      = __webpack_require__(56)
	  , createDesc     = __webpack_require__(57)
	  , getDesc        = $.getDesc
	  , setDesc        = $.setDesc
	  , _create        = $.create
	  , getNames       = $names.get
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , setter         = false
	  , HIDDEN         = wks('_hidden')
	  , isEnum         = $.isEnum
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , useNative      = typeof $Symbol == 'function'
	  , ObjectProto    = Object.prototype;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(setDesc({}, 'a', {
	    get: function(){ return setDesc(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = getDesc(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  setDesc(it, key, D);
	  if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
	} : setDesc;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol.prototype);
	  sym._k = tag;
	  DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
	    configurable: true,
	    set: function(value){
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    }
	  });
	  return sym;
	};

	var isSymbol = function(it){
	  return typeof it == 'symbol';
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(D && has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return setDesc(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key);
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
	    ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  var D = getDesc(it = toIObject(it), key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
	  return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
	  return result;
	};
	var $stringify = function stringify(it){
	  if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	  var args = [it]
	    , i    = 1
	    , $$   = arguments
	    , replacer, $replacer;
	  while($$.length > i)args.push($$[i++]);
	  replacer = args[1];
	  if(typeof replacer == 'function')$replacer = replacer;
	  if($replacer || !isArray(replacer))replacer = function(key, value){
	    if($replacer)value = $replacer.call(this, key, value);
	    if(!isSymbol(value))return value;
	  };
	  args[1] = replacer;
	  return _stringify.apply($JSON, args);
	};
	var buggyJSON = $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	});

	// 19.4.1.1 Symbol([description])
	if(!useNative){
	  $Symbol = function Symbol(){
	    if(isSymbol(this))throw TypeError('Symbol is not a constructor');
	    return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
	  };
	  redefine($Symbol.prototype, 'toString', function toString(){
	    return this._k;
	  });

	  isSymbol = function(it){
	    return it instanceof $Symbol;
	  };

	  $.create     = $create;
	  $.isEnum     = $propertyIsEnumerable;
	  $.getDesc    = $getOwnPropertyDescriptor;
	  $.setDesc    = $defineProperty;
	  $.setDescs   = $defineProperties;
	  $.getNames   = $names.get = $getOwnPropertyNames;
	  $.getSymbols = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(58)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	}

	var symbolStatics = {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    return keyOf(SymbolRegistry, key);
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	};
	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	$.each.call((
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
	  'species,split,toPrimitive,toStringTag,unscopables'
	).split(','), function(it){
	  var sym = wks(it);
	  symbolStatics[it] = useNative ? sym : wrap(sym);
	});

	setter = true;

	$export($export.G + $export.W, {Symbol: $Symbol});

	$export($export.S, 'Symbol', symbolStatics);

	$export($export.S + $export.F * !useNative, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!useNative || buggyJSON), 'JSON', {stringify: $stringify});

	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(41)
	  , core    = __webpack_require__(30)
	  , fails   = __webpack_require__(47);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(56)
	  , getNames  = __webpack_require__(31).getNames
	  , toString  = {}.toString;

	var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return getNames(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.get = function getOwnPropertyNames(it){
	  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
	  return getNames(toIObject(it));
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(59);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(43)
	  , core      = __webpack_require__(30)
	  , ctx       = __webpack_require__(60)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$export.F = 1;  // forced
	$export.G = 2;  // global
	$export.S = 4;  // static
	$export.P = 8;  // proto
	$export.B = 16; // bind
	$export.W = 32; // wrap
	module.exports = $export;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var getDesc  = __webpack_require__(31).getDesc
	  , isObject = __webpack_require__(61)
	  , anObject = __webpack_require__(55);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function(test, buggy, set){
	      try {
	        set = __webpack_require__(60)(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch(e){ buggy = true; }
	      return function setPrototypeOf(O, proto){
	        check(O, proto);
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(47)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(62);

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(43)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(31).setDesc
	  , has = __webpack_require__(44)
	  , TAG = __webpack_require__(51)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var store  = __webpack_require__(48)('wks')
	  , uid    = __webpack_require__(50)
	  , Symbol = __webpack_require__(43).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(31)
	  , toIObject = __webpack_require__(56);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = $.getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var $ = __webpack_require__(31);
	module.exports = function(it){
	  var keys       = $.getKeys(it)
	    , getSymbols = $.getSymbols;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = $.isEnum
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
	  }
	  return keys;
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(63);
	module.exports = Array.isArray || function(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(61);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(64)
	  , defined = __webpack_require__(59);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = true;

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(65);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(31)
	  , createDesc = __webpack_require__(57);
	module.exports = __webpack_require__(45) ? function(object, key, value){
	  return $.setDesc(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(63);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ }
/******/ ]);