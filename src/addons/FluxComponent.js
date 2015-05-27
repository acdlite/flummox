/**
 * Flux Component
 *
 * Component interface to reactComponentMethods module.
 *
 * Children of FluxComponent are given access to the flux instance via
 * `context.flux`. Use this near the top of your app hierarchy and all children
 * will have easy access to the flux instance (including, of course, other
 * Flux components!):
 *
 * <FluxComponent flux={flux}>
 *    ...the rest of your app
 * </FluxComponent>
 *
 * Now any child can access the flux instance again like this:
 *
 * <FluxComponent>
 *    ...children
 * </FluxComponent>
 *
 * We don't need the flux prop this time because flux is already part of
 * the context.
 *
 * Additionally, immediate children are given a `flux` prop.
 *
 * The component has an optional prop `connectToStores`, which is passed to
 * `this.connectToStores` and used to set the initial state. The component's
 * state is injected as props to the child components.
 *
 * The practical upshot of all this is that fluxMixin, state changes, and
 * context are now simply implementation details. Among other things, this means
 * you can write your components as plain ES6 classes. Here's an example:
 *
 * class ParentComponent extends React.Component {
 *
 *   render() {
 *     <FluxComponent connectToStores="fooStore">
 *       <ChildComponent />
 *     </FluxComponent>
 *   }
 *
 * }
 *
 * ChildComponent in this example has prop `flux` containing the flux instance,
 * and props that sync with each of the state keys of fooStore.
 */

import createReactComponentMethods from './reactComponentMethods';
import assign from 'object-assign';

export default (React, PlainWrapperComponent) => {
  const { instanceMethods, staticProperties } = createReactComponentMethods(React);

  class FluxComponent extends React.Component {
    constructor(props, context) {
      super(props, context);

      this.initialize();

      const stores = this._getStoresProp(props);
      this.state = this.connectToStores(stores, props.stateGetter);
    }

    _getActionsProp(props) {
      return props.actions || props.injectActions;
    }

    _getStoresProp(props) {
      return props.stores || props.connectToStores;
    }

    wrapChild = (child) => {
      return React.addons.cloneWithProps(
        child,
        this.getChildProps()
      );
    }

    getChildProps() {
      const {
        children,
        render,
        connectToStores,
        stores,
        injectActions,
        actions: _actions,
        stateGetter,
        flux,
        ...extraProps } = this.props;

      const actions = this._getActionsProp(this.props);

      return assign(
        { flux: this.getFlux() }, // TODO: remove in next major version
        this.collectActions(actions),
        this.state,
        extraProps
      );
    }

    render() {
      const { children, render } = this.props;

      if (typeof render === 'function') {
        const actions = this._getActionsProp(this.props);

        return render(
          this.state,
          this.collectActions(actions),
          this.getFlux()
        );
      }

      if (!children) return null;

      if (!Array.isArray(children)) {
        const child = children;
        return this.wrapChild(child);
      } else {
        return (
          <PlainWrapperComponent>
            {React.Children.map(children, this.wrapChild)}
          </PlainWrapperComponent>
        );
      }
    }
  }

  assign(
    FluxComponent.prototype,
    instanceMethods
  );

  assign(FluxComponent, staticProperties);

  return FluxComponent;
}
