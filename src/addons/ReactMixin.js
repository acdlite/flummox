/**
 * ReactMixin
 *
 * Exposes Flux instance as `this.flux`. Requires that flux be passed as either
 * context or as a prop (prop takes precedence).
 *
 * Adds method `connectToStores`, which handles listening, updating, and
 * unlistening to Flux stores.
 */

'use strict';

import { PropTypes } from 'react';
import { Flux } from '../Flux';
import assign from 'object-assign';

export default function(...args) {

  return {

    contextTypes: {
      flux: PropTypes.instanceOf(Flux),
    },

    getInitialState() {
      this._flux_listeners = {};
      this.flux = this.props.flux || this.context.flux;

      if (!(this.flux instanceof Flux)) {
        // TODO: print the actual class name here
        throw new Error(
          `ReactMixin: Could not find Flux instance. Ensure that your component `
        + `has either \`this.context.flux\` or \`this.props.flux\`.`
        );
      }

      return this.connectToStores(...args);
    },

    componentWillUnmount() {
      for (let key in this._flux_listeners) {
        if (!this._flux_listeners.hasOwnProperty(key)) continue;

        let store = this.flux.getStore(key);
        if (typeof store === 'undefined') continue;

        let listener = this._flux_listeners[key];

        store.removeListener('change', listener);
      }
    },

    /**
     * Connect component to stores, updating state on 'change' events. It will
     * accept a single store key and an optional state getter. The state getter
     * is a function that takes the store as a parameter and returns the state
     * that should be passed to the component's `setState()`. If no state getter
     * is passed, the default getter returns the entire store state.
     *
     * Also accepts an array of store keys. This form assumes that every store
     * uses the default getter.
     *
     * Also accepts an object of store keys mapped to getters. If null is passed
     * as a getter instead of a function, it assumes the default state getter.
     *
     * Returns the combined initial state of all specified stores, so that it can
     * be used inside `getInitialState()`.
     *
     * This way you can write all the initialization and update logic in a single
     * location, without having to mess with adding/removing listeners.
     *
     * @example
     * getInitialState() {
     *   // Using object syntax, which will probably be most common
     *   let initialState = this.connectToStore({
     *     storeA: store => ({
     *       foo: store.foo
     *     }),
     *
     *     storeB: store => ({
     *       bar: store.bar
     *     })
     *   });
     *
     *   // state object with keys `foo` and `bar`
     *   return initialState;
     * }
     *
     * @type {string|array|object} stateGetterMap - map of keys to getters
     * @returns {object} Combined initial state of stores
     */
    connectToStores(stateGetterMap = {}, stateGetter = defaultStateGetter) {
      let initialState = {};

      // Ensure that stateGetterMap is an object
      if (typeof stateGetterMap === 'string') {
        let key = stateGetterMap;

        stateGetterMap = {
          [key]: stateGetter,
        };
      } else if (Array.isArray(stateGetterMap)) {
        stateGetterMap.reduce((result, key) => {
          result[key] = stateGetter;
          return result;
        }, {});
      }

      for (let key in stateGetterMap) {
        let store = this.flux.getStore(key);

        if (typeof store === 'undefined') throw new Error(
          `connectToStores(): Store with key '${key}' does not exist.`
        );

        let storeStateGetter = stateGetterMap[key];

        if (storeStateGetter === null) storeStateGetter = defaultStateGetter;

        let initialStoreState = storeStateGetter(store);

        let listener = () => {
          let state = storeStateGetter(store);
          this.setState(state);
        };

        store.addListener('change', listener);

        assign(this._flux_listeners, {
          [key]: listener,
        });

        return assign(initialState, initialStoreState);
      }

      return initialState;
    }

  }

};

function defaultStateGetter(store) {
  return store.state;
}
