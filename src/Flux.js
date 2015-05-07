/**
 * Flux
 *
 * The main Flux class.
 */

import Store from './Store';
import Actions from './Actions';
import { Dispatcher } from 'flux';
import EventEmitter from 'eventemitter3';
import assign from 'object-assign';

import uniqueId from 'uniqueid';

export default class Flux extends EventEmitter {

  constructor() {
    super();

    this.dispatcher = new Dispatcher();

    this._stores = {};
    this._actions = {};
  }

  createStore(key, _Store, ...constructorArgs) {

    if (!(_Store.prototype instanceof Store)) {
      const className = getClassName(_Store);

      throw new Error(
        `You've attempted to create a store from the class ${className}, which `
      + `does not have the base Store class in its prototype chain. Make sure `
      + `you're using the \`extends\` keyword: \`class ${className} extends `
      + `Store { ... }\``
      );
    }

    if (this._stores.hasOwnProperty(key) && this._stores[key]) {
      throw new Error(
        `You've attempted to create multiple stores with key ${key}. Keys must `
      + `be unique.`
      );
    }

    const store = new _Store(...constructorArgs);
    const token = this.dispatcher.register(store.handler.bind(store));

    store._waitFor = this.waitFor.bind(this);
    store._token = token;
    store._getAllActionIds = this.getAllActionIds.bind(this);

    this._stores[key] = store;

    return store;
  }

  getStore(key) {
    return this._stores.hasOwnProperty(key) ? this._stores[key] : undefined;
  }

  removeStore(key) {
    if (this._stores.hasOwnProperty(key)) {
      this._stores[key].removeAllListeners();
      this.dispatcher.unregister(this._stores[key]._token);
      delete this._stores[key];
    } else {
      throw new Error(
        `You've attempted to remove store with key ${key} which does not exist.`
      );
    }
  }

  createActions(key, _Actions, ...constructorArgs) {
    if (!(_Actions.prototype instanceof Actions) && _Actions !== Actions) {
      if (typeof _Actions === 'function') {
        const className = getClassName(_Actions);

        throw new Error(
          `You've attempted to create actions from the class ${className}, which `
        + `does not have the base Actions class in its prototype chain. Make `
        + `sure you're using the \`extends\` keyword: \`class ${className} `
        + `extends Actions { ... }\``
        );
      } else {
        const properties = _Actions;
        _Actions = class extends Actions {};
        assign(_Actions.prototype, properties);
      }
    }

    if (this._actions.hasOwnProperty(key) && this._actions[key]) {
      throw new Error(
        `You've attempted to create multiple actions with key ${key}. Keys `
      + `must be unique.`
      );
    }

    const actions = new _Actions(...constructorArgs);
    actions.dispatch = this.dispatch.bind(this);
    actions.dispatchAsync = this.dispatchAsync.bind(this);

    this._actions[key] = actions;

    return actions;
  }

  getActions(key) {
    return this._actions.hasOwnProperty(key) ? this._actions[key] : undefined;
  }

  getActionIds(key) {
    const actions = this.getActions(key);

    if (!actions) return;

    return actions.getConstants();
  }

  removeActions(key) {
    if (this._actions.hasOwnProperty(key)) {
      delete this._actions[key];
    } else {
      throw new Error(
        `You've attempted to remove actions with key ${key} which does not exist.`
      );
    }
  }

  getAllActionIds() {
    let actionIds = [];

    for (let key in this._actions) {
      if (!this._actions.hasOwnProperty(key)) continue;

      const actionConstants = this._actions[key].getConstants();

      actionIds = actionIds.concat(getValues(actionConstants));
    }

    return actionIds;
  }

  dispatch(actionId, body, payloadFields) {
    this._dispatch({ actionId, body });
  }

  dispatchAsync(actionId, promise, payloadFields) {
    const dispatchId = uniqueId();

    const payload = {
      actionId,
      dispatchId,
      ...payloadFields
    };

    this._dispatch({
      ...payload,
      async: 'begin'
    });

    return promise
      .then(
        body => {
          this._dispatch({
            ...payload,
            async: 'success',
            body,
          });

          return body;
        },
        error => {
          this._dispatch({
            ...payload,
            error,
            async: 'failure'
          });
        }
      )
      .catch(error => {
        this.emit('error', error);

        throw error;
      });
  }

  _dispatch(payload) {
    this.dispatcher.dispatch(payload);
    this.emit('dispatch', payload);
  }

  waitFor(tokensOrStores) {

    if (!Array.isArray(tokensOrStores)) tokensOrStores = [tokensOrStores];

    const ensureIsToken = tokenOrStore => {
      return tokenOrStore instanceof Store
        ? tokenOrStore._token
        : tokenOrStore;
    };

    const tokens = tokensOrStores.map(ensureIsToken);

    this.dispatcher.waitFor(tokens);
  }

  removeAllStoreListeners(event) {
    for (let key in this._stores) {
      if (!this._stores.hasOwnProperty(key)) continue;

      const store = this._stores[key];

      store.removeAllListeners(event);
    }
  }

  serialize() {
    const stateTree = {};

    for (let key in this._stores) {
      if (!this._stores.hasOwnProperty(key)) continue;

      const store = this._stores[key];

      const serialize = store.constructor.serialize;

      if (typeof serialize !== 'function') continue;

      const serializedStoreState = serialize(store.state);

      if (typeof serializedStoreState !== 'string') {
        const className = store.constructor.name;

        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `The store with key '${key}' was not serialized because the static `
          + `method \`${className}.serialize()\` returned a non-string with type `
          + `'${typeof serializedStoreState}'.`
          );
        }
      }

      stateTree[key] = serializedStoreState;

      if (typeof store.constructor.deserialize !== 'function') {
        const className = store.constructor.name;

        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `The class \`${className}\` has a \`serialize()\` method, but no `
          + `corresponding \`deserialize()\` method.`
          );
        }
      }

    }

    return JSON.stringify(stateTree);
  }

  deserialize(serializedState) {
    let stateMap;

    try {
      stateMap = JSON.parse(serializedState);
    } catch (error) {
      const className = this.constructor.name;

      if (process.env.NODE_ENV !== 'production') {
        throw new Error(
          `Invalid value passed to \`${className}#deserialize()\`: `
        + `${serializedState}`
        );
      }
    }

    for (let key in this._stores) {
      if (!this._stores.hasOwnProperty(key)) continue;

      const store = this._stores[key];

      const deserialize = store.constructor.deserialize;

      if (typeof deserialize !== 'function') continue;

      const storeStateString = stateMap[key];
      const storeState = deserialize(storeStateString);

      store.replaceState(storeState);

      if (typeof store.constructor.serialize !== 'function') {
        const className = store.constructor.name;

        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `The class \`${className}\` has a \`deserialize()\` method, but no `
          + `corresponding \`serialize()\` method.`
          );
        }
      }
    }
  }

}

// Aliases
Flux.prototype.getConstants = Flux.prototype.getActionIds;
Flux.prototype.getAllConstants = Flux.prototype.getAllActionIds;
Flux.prototype.dehydrate = Flux.prototype.serialize;
Flux.prototype.hydrate = Flux.prototype.deserialize;

function getClassName(Class) {
  return Class.prototype.constructor.name;
}

function getValues(object) {
  let values = [];

  for (let key in object) {
    if (!object.hasOwnProperty(key)) continue;

    values.push(object[key]);
  }

  return values;
}

const Flummox = Flux;

export {
  Flux,
  Flummox,
  Store,
  Actions,
};
