/**
 * fluxMixin
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
 *   mixins: [fluxMixin({
 *     storeA: store => ({
 *       foo: store.state.a,
 *     }),
 *     storeB: store => ({
 *       bar: store.state.b,
 *     })
 *   }]
 * });
 */

import { PropTypes } from 'react';
import { Flux } from '../Flux';
import assign from 'object-assign';
import shallowEqual from 'react/lib/shallowEqual';

export default function fluxMixin(...args) {

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
      this._fluxStateGetters = [];
      this._fluxListeners = {};
      this._fluxDidSyncStoreState = false;
      this.flux = this.props.flux || this.context.flux;

      if (!(this.flux instanceof Flux)) {
        // TODO: print the actual class name here
        throw new Error(
          `fluxMixin: Could not find Flux instance. Ensure that your component `
        + `has either \`this.context.flux\` or \`this.props.flux\`.`
        );
      }

      return this.connectToStores(...args);
    },

    componentWillUnmount() {
      for (let key in this._fluxListeners) {
        if (!this._fluxListeners.hasOwnProperty(key)) continue;

        let store = this.flux.getStore(key);
        if (typeof store === 'undefined') continue;

        let listener = this._fluxListeners[key];

        store.removeListener('change', listener);
      }
    },

    componentDidUpdate(prevProps) {
      if (!shallowEqual(prevProps, this.props)) {
        this.updateStores();
      }
    },

    updateStores() {
      let state = this.getStoreState();
      this.setState(state);
    },

    getStoreState() {
      return this._fluxStateGetters.reduce(
        (result, stateGetter) => assign(result, stateGetter.getter(stateGetter.stores)),
        {}
      );
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
     * The second form accepts an array of store keys. With this form, the state
     * getter is called once with an array of store instances (in the same order
     * as the store keys). the default getter performance a reduce on the entire
     * state for each store.
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
    connectToStores(stateGetterMap = {}, stateGetter = null) {
      let getStore = (key) => {
        let store = this.flux.getStore(key);

        if (typeof store === 'undefined') {
          throw new Error(
            `connectToStores(): Store with key '${key}' does not exist.`
          );
        }

        return store;
      };

      if (typeof stateGetterMap === 'string') {
        let key = stateGetterMap;
        let store = getStore(key);
        let getter = stateGetter || defaultStateGetter;

        getter = getter.bind(this);

        this._fluxStateGetters.push({ stores: store, getter });
        let listener = createStoreListener(this, store, getter)
            .bind(this);

        store.addListener('change', listener);
        this._fluxListeners[key] = listener;
      } else if (Array.isArray(stateGetterMap)) {
        let stores = stateGetterMap.map(getStore);
        let getter = stateGetter || defaultReduceStateGetter;

        getter = getter.bind(this);

        this._fluxStateGetters.push({ stores, getter });

        let listener = createStoreListener(this, stores, getter)
            .bind(this);

        stateGetterMap.forEach((key, index) => {
          let store = stores[index];
          store.addListener('change', listener);
          this._fluxListeners[key] = listener;
        });

      } else {
        for (let key in stateGetterMap) {
          let store = getStore(key);
          let getter = stateGetterMap[key] || defaultStateGetter;

          getter = getter.bind(this);

          this._fluxStateGetters.push({ stores: store, getter });

          let listener = createStoreListener(this, store, getter)
            .bind(this);

          store.addListener('change', listener);
          this._fluxListeners[key] = listener;
        }
      }

      return this.getStoreState();
    }

  };

};

function createStoreListener(component, store, storeStateGetter) {
  return function() {
    if (this.isMounted()) {
      let state = storeStateGetter(store);
      this.setState(state);
    }
  };
}

function defaultStateGetter(store) {
  return store.state;
}

function defaultReduceStateGetter(stores) {
  return stores.reduce(
    (result, store) => assign(result, store.state),
    {}
  );
}
