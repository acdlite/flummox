/**
 * Flux Component
 *
 * Component form of fluxMixin. Uses fluxMixin as part of its implementation,
 * so requires a flux instance to be provided as either context or a prop.
 *
 * Like fluxMixin, children are given access to the flux instance via
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
 * The component has an optional prop `connectToStores`, which is -- you guessed
 * it -- passed directly to fluxMixin's `connectToStores()` function and
 * set as the initial state. The component's state is injected as props to
 * child components.
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

import React from 'react/addons';
import { instanceMethods, staticProperties } from './reactComponentMethods';
import assign from 'object-assign';

class FluxComponent extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.initialize();

    this.state = this.connectToStores(props.connectToStores, props.stateGetter);

    this.wrapChild = this.wrapChild.bind(this);
  }

  wrapChild(child) {
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
      stateGetter,
      flux,
      ...extraProps } = this.props;

    return assign(
      { flux: this.getFlux() },
      this.state,
      extraProps
    );
  }

  render() {
    const { children, render } = this.props;

    if (typeof render === 'function') {
      return render(this.getChildProps(), this.getFlux());
    }

    if (!children) return null;

    if (!Array.isArray(children)) {
      const child = children;
      return this.wrapChild(child);
    } else {
      return <span>{React.Children.map(children, this.wrapChild)}</span>;
    }
  }
}

assign(
  FluxComponent.prototype,
  instanceMethods
);

assign(FluxComponent, staticProperties);

export default FluxComponent;
