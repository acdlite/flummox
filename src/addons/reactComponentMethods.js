/**
 * React Component methods. These are the primitives used to implement
 * fluxMixin and FluxComponent.
 *
 * Exposes a Flux instance as `this.flux`. This requires that flux be passed as
 * either context or as a prop (prop takes precedence). Children also are given
 * access to flux instance as `context.flux`.
 *
 * It also adds the method `connectToStores()`, which ensures that the component
 * state stays in sync with the specified Flux stores. See the inline docs
 * of `connectToStores` for details.
 */

 import { PropTypes } from 'react';
 import { Flux } from '../Flux';
 import assign from 'object-assign';

 const instanceMethods = {

   getChildContext() {
     let flux = this.getFlux();

     if (!flux) return {};

     return {
       flux: this.getFlux()
     };
   },

   getFlux() {
     return this.props.flux || this.context.flux;
   },

   initialize() {
     this._fluxStateGetters = [];
     this._fluxListeners = {};
     this._fluxDidSyncStoreState = false;
     this.flux = this.getFlux();

     if (!(this.flux instanceof Flux)) {
       // TODO: print the actual class name here
       throw new Error(
         `fluxMixin: Could not find Flux instance. Ensure that your component `
       + `has either \`this.context.flux\` or \`this.props.flux\`.`
       );
     }
   },

   componentWillUnmount() {
     let flux = this.getFlux();

     for (let key in this._fluxListeners) {
       if (!this._fluxListeners.hasOwnProperty(key)) continue;

       let store = flux.getStore(key);
       if (typeof store === 'undefined') continue;

       let listener = this._fluxListeners[key];

       store.removeListener('change', listener);
     }
   },

   componentWillReceiveProps(nextProps) {
     this.updateStores(nextProps);
   },

   updateStores(props = this.props) {
     let state = this.getStoreState(props);
     this.setState(state);
   },

   getStoreState(props = this.props) {
     return this._fluxStateGetters.reduce(
       (result, stateGetter) => {
         const { getter, stores } = stateGetter;
         const stateFromStores = getter(stores, props);
         return assign(result, stateFromStores);
       }, {}
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
     let flux = this.getFlux();

     let getStore = (key) => {
       let store = flux.getStore(key);

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

       this._fluxStateGetters.push({ stores: store, getter });
       let listener = createStoreListener(this, store, getter);

       store.addListener('change', listener);
       this._fluxListeners[key] = listener;
     } else if (Array.isArray(stateGetterMap)) {
       let stores = stateGetterMap.map(getStore);
       let getter = stateGetter || defaultReduceStateGetter;

       this._fluxStateGetters.push({ stores, getter });
       let listener = createStoreListener(this, stores, getter);

       stateGetterMap.forEach((key, index) => {
         let store = stores[index];
         store.addListener('change', listener);
         this._fluxListeners[key] = listener;
       });

     } else {
       for (let key in stateGetterMap) {
         let store = getStore(key);
         let getter = stateGetterMap[key] || defaultStateGetter;

         this._fluxStateGetters.push({ stores: store, getter });
         let listener = createStoreListener(this, store, getter);

         store.addListener('change', listener);
         this._fluxListeners[key] = listener;
       }
     }

     return this.getStoreState();
   }

 };

 const staticProperties = {
   contextTypes: {
     flux: PropTypes.instanceOf(Flux),
   },

   childContextTypes: {
     flux: PropTypes.instanceOf(Flux),
   },
 };

 export { instanceMethods, staticProperties };

 function createStoreListener(component, store, storeStateGetter) {
   return function() {
     if (this.isMounted()) {
       let state = storeStateGetter(store, this.props);
       this.setState(state);
     }
   }.bind(component);
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
