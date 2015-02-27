/**
 * Flux
 *
 * The main Flux class.
 */

import Store from './Store';
import Actions from './Actions';
import { Dispatcher } from 'flux';
import EventEmitter from 'eventemitter3';

export default class Flux extends EventEmitter {

  constructor() {
    this.dispatcher = new Dispatcher();

    this._stores = {};
    this._actions = {};

    this.getConstants = this.getActionIds;

    // Aliases
    this.dehydrate = this.serialize;
    this.hydrate = this.deserialize;
  }

  createStore(key, _Store, ...constructorArgs) {

    if (!(_Store.prototype instanceof Store)) {
      let className = getClassName(_Store);

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

    let store = new _Store(...constructorArgs);
    let token = this.dispatcher.register(store.handler.bind(store));

    store._waitFor = this.waitFor.bind(this);
    store._token = token;

    this._stores[key] = store;

    return store;
  }

  getStore(key) {
    return this._stores.hasOwnProperty(key) ? this._stores[key] : undefined;
  }

  createActions(key, _Actions, ...constructorArgs) {

    if (!(_Actions.prototype instanceof Actions) && _Actions !== Actions) {
      let className = getClassName(_Actions);

      throw new Error(
        `You've attempted to create actions from the class ${className}, which `
      + `does not have the base Actions class in its prototype chain. Make `
      + `sure you're using the \`extends\` keyword: \`class ${className} `
      + `extends Actions { ... }\``
      );
    }

    if (this._actions.hasOwnProperty(key) && this._actions[key]) {
      throw new Error(
        `You've attempted to create multiple actions with key ${key}. Keys `
      + `must be unique.`
      );
    }

    let actions = new _Actions(...constructorArgs);
    actions.dispatch = this.dispatch.bind(this);
    actions.dispatchAsync = this.dispatchAsync.bind(this);

    this._actions[key] = actions;

    return actions;
  }

  getActions(key) {
    return this._actions.hasOwnProperty(key) ? this._actions[key] : undefined;
  }

  getActionIds(key) {
    let actions = this.getActions(key);

    if (!actions) return;

    return actions.getConstants();
  }

  dispatch(actionId, body, actionArgs) {
    this._dispatch({ actionId, body });
  }

  dispatchAsync(actionId, promise, actionArgs) {
    let payload = {
      actionId,
      async: 'begin',
    };

    if (actionArgs) payload.actionArgs = actionArgs;

    this._dispatch(payload);

    return promise
      .then(
        body => {
          this._dispatch({
            actionId,
            body,
            async: 'success'
          });

          return body;
        },
        error => {
          this._dispatch({
            actionId,
            error,
            async: 'failure',
          });

          return Promise.reject(error);
        }
      )
      .catch(error => {
        this.emit('error', error);

        return Promise.reject(error);
      });
  }

  _dispatch(payload) {
    this.dispatcher.dispatch(payload);
    this.emit('dispatch', payload);
  }

  waitFor(tokensOrStores) {

    if (!Array.isArray(tokensOrStores)) tokensOrStores = [tokensOrStores];

    let ensureIsToken = tokenOrStore => {
      return tokenOrStore instanceof Store
        ? tokenOrStore._token
        : tokenOrStore;
    };

    let tokens = tokensOrStores.map(ensureIsToken);

    this.dispatcher.waitFor(tokens);
  }

  removeAllStoreListeners(event) {
    for (let key in this._stores) {
      if (!this._stores.hasOwnProperty(key)) continue;

      let store = this._stores[key];

      store.removeAllListeners(event);
    }
  }

  serialize() {
    let stateTree = {};

    for (let key in this._stores) {
      if (!this._stores.hasOwnProperty(key)) continue;

      let store = this._stores[key];

      let serialize = store.constructor.serialize;

      if (typeof serialize !== 'function') continue;

      let serializedStoreState = serialize(store.state);

      if (typeof serializedStoreState !== 'string') {
        let className = store.constructor.name;

        console.warn(
          `The store with key '${key}' was not serialized because the static `
        + `method \`${className}.serialize()\` returned a non-string with type `
        + `'${typeof serializedStoreState}'.`
        );
      }

      stateTree[key] = serializedStoreState;

      if (typeof store.constructor.deserialize !== 'function') {
        let className = store.constructor.name;

        console.warn(
          `The class \`${className}\` has a \`serialize()\` method, but no `
        + `corresponding \`deserialize()\` method.`
        );
      }

    }

    return JSON.stringify(stateTree);
  }

  deserialize(serializedState) {
    let stateMap;

    try {
      stateMap = JSON.parse(serializedState);
    } catch (error) {
      let className = this.constructor.name;

      throw new Error(
        `Invalid value passed to \`${className}#deserialize()\`: `
      + `${serializedState}`
      );
    }

    for (let key in this._stores) {
      if (!this._stores.hasOwnProperty(key)) continue;

      let store = this._stores[key];

      let deserialize = store.constructor.deserialize;

      if (typeof deserialize !== 'function') continue;

      let storeStateString = stateMap[key];
      let storeState = deserialize(storeStateString);

      store.replaceState(storeState);

      if (typeof store.constructor.serialize !== 'function') {
        let className = store.constructor.name;

        console.warn(
          `The class \`${className}\` has a \`deserialize()\` method, but no `
        + `corresponding \`serialize()\` method.`
        );
      }
    }
  }

}

function getClassName(Class) {
  return Class.prototype.constructor.name;
}

let Flummox = Flux;

export {
  Flux,
  Flummox,
  Store,
  Actions,
};
