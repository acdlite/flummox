/**
 * React Mixin
 *
 * Exports a function that creates a React component mixin. The mixin exposes
 * a Flux instance as `this.flux`. This requires that flux be passed as either
 * context or as a prop (prop takes precedence). Children also are given access
 * to flux instance as `context.flux`.
 *
 * It also adds the method `connectToStores()`, which ensures that the component
 * state stays in sync with the specified Flux stores. See the inline docs
 * of `connectToStores` for details.
 *
 * Any arguments passed to the mixin creator are passed to `connectToStores()`
 * and used as the return value of `getInitialState()`. This lets you handle
 * all of the state initialization and updates in a single place, while removing
 * the burden of manually adding and removing store listeners.
 *
 * @example
 * let Component = React.createClass({
 *   mixins: [ReactMixin({
 *     storeA: store => ({
 *       foo: store.state.a,
 *     }),
 *     storeB: store => ({
 *       bar: store.state.b,
 *     })
 *   }]
 * });
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

    childContextTypes: {
      flux: PropTypes.instanceOf(Flux),
    },

    getChildContext() {
      return {
        flux: this.flux
      };
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
     * Connect component to stores, get the combined initial state, and
     * subscribe to future changes. There are three ways to call it. The
     * simplest is to pass a single store key and, optionally, a state getter.
     * The state getter is a function that takes the store as a parameter and
     * returns the state that should be passed to the component's `setState()`.
     * If no state getter is specified, the default getter is used, which simply
     * returns the entire store state.
     *
     * The second form accepts an array of store keys. With this form, every
     * store uses the default state getter.
     *
     * The last form accepts an object of store keys mapped to state getters. As
     * a shortcut, you can pass `null` as a state getter to use the default
     * state getter.
     *
     * Returns the combined initial state of all specified stores.
     *
     * This way you can write all the initialization and update logic in a single
     * location, without having to mess with adding/removing listeners.
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

        storeStateGetter = storeStateGetter.bind(this);

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
