/**
 * Flux
 *
 * The main Flux class.
 */

'use strict';

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
  }

  createStore(key, _Store, ...constructorArgs) {

    if (!(_Store.prototype instanceof Store) && _Store !== Store) {
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

    this._actions[key] = actions;
  }

  getActions(key) {
    return this._actions.hasOwnProperty(key) ? this._actions[key] : undefined;
  }

  getActionIds(key) {
    let actions = this.getActions(key);

    if (!actions) return;

    return actions.getConstants();
  }

  dispatch(actionId, body) {
    this.dispatcher.dispatch({ actionId, body });
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

  serialize() {
    let stateTree = {};

    for (let key in this._stores) {
      if (!this._stores.hasOwnProperty(key)) continue;

      let store = this._stores[key];

      if (typeof store.serialize !== 'function') {
        let className = store.constructor.name;

        throw new Error(
          `Cannot serialize Flux state because the store with key '${key}' `
        + `does not have a \`serialize()\` method. Check the implementation of `
        + `the ${className} class.`
        );
      }

      let serializedStoreState = store.serialize();

      if (typeof serializedStoreState !== 'string') {
        let className = store.constructor.name;

        throw new Error(
          `\`Store#serialize()\ must return a string, but the store with key `
        + `'${key}' returned a non-string with type `
        + `'${typeof serializedStoreState}'. Check the \`#serialize()\ method `
        + `of the ${className} class.`
        );
      }

      stateTree[key] = store.serialize();
    }

    return JSON.stringify(stateTree);
  }

  deserialize(serializedState) {
    try {
      let state = JSON.parse(serializedState);
    } catch (error) {
      let className = this.constructor.name;

      throw new Error(
        `Invalid value passed to \`${className}#deserialize()\`. Ensure that `
      + `each of your store's \`#serialize()\` methods returns a properly `
      + `escaped string.`
      );
    }

    for (let key in this._stores) {
      if (!this._stores.hasOwnProperty(key)) continue;

      let store = this._stores[key];

      if (typeof store.deserialize !== 'function') {
        let className = store.constructor.name;

        throw new Error(
          `Cannot deserialize Flux state because the store with key '${key}' `
        + `does not have a \`deserialize()\` method. Check the implementation `
        + `of the ${className} class.`
        );
      }

      let storeState = store.deserialize(serializedState);

      store.replaceState(storeState);
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
