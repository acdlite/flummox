import React from 'react';
import { Link } from 'react-router';
import connectToStores from 'flummox/connect';
import View from './View';
import { rhythm, color, zIndex } from '../theme';
import StyleSheet from 'react-style';

const navColor = color('blue');

const styles = StyleSheet.create({
  navWrapper: {
    backgroundColor: navColor,
    position: 'fixed',
    width: '100%',
    zIndex: zIndex('AppNav'),
  },

  subNav: {
    display: 'none',
    backgroundColor: navColor,
    position: 'absolute',
    right: 0,
    top: '100%',
    width: '16em',
    textAlign: 'right',
  },

  text: {
    padding: `${rhythm(1 / 4)} ${rhythm(1 / 2)}`,
    color: '#fff',
    width: '100%',
    textDecoration: 'none',
    border: 'inherit solid 1px',
  }
});

class AppNav extends React.Component {
  render() {
    return (
      <View style={{ height: rhythm(1.5) }}>
        <View styles={[styles.navWrapper]}>
          <View>
            <AppNavLink title="Flummox" href="/" />
          </View>
          <View justifyContent="flex-end" flexGrow>
            <AppNavLink title="Guides" href="/flummox/docs/guides">
              <AppNavLink title="Quick Start" href="/flummox/docs/guides/quick-start" />
              <AppNavLink title="React Integration" href="/flummox/docs/guides/react-integration" />
              <AppNavLink title="Why FluxComponent > fluxMixin" href="/flummox/docs/guides/why-flux-component-is-better-than-flux-mixin" />
            </AppNavLink>
            <AppNavLink title="API" href="/flummox/docs/api">
              <AppNavLink title="Store" href="/flummox/docs/api/store" />
              <AppNavLink title="Flux" href="/flummox/docs/api/flux" />
              <AppNavLink title="Actions" href="/flummox/docs/api/actions" />
              <AppNavLink title="FluxComponent" href="/flummox/docs/api/fluxcomponent" />
              <AppNavLink title="Higher-order component" href="/flummox/docs/api/higher-order-component" />
              <AppNavLink title="fluxMixin" href="/flummox/docs/api/fluxmixin" />
            </AppNavLink>
            <AppNavLink title="GitHub" href="https://github.com/acdlite/flummox" />
          </View>
        </View>
      </View>
    );
  }
}

AppNav = connectToStores(AppNav, 'docs');

class AppNavLink extends React.Component {
  constructor() {
    super();

    this.state = {
      hover: false,
    };
  }

  render() {
    const { children, title, href, level, ...props } = this.props;

    let subNav;
    if (children) {

      const dynamicStyles = {
        display: this.state.hover ? null : 'none'
      };

      subNav = (
        <View
          flexDirectionColumn
          styles={[ styles.subNav, dynamicStyles ]}
        >
          {children}
        </View>
      );
    }

    const dynamicInlineLinkStyles = {
      backgroundColor: this.state.hover ? color('darkBlue') : null,
      borderColor: this.state.hover ? color('blue') : null,
    };

    return (
      <View
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        {...props}
      >
        <a href={href} styles={[styles.text, dynamicInlineLinkStyles]}>
          {title}
        </a>
        {subNav}
      </View>
    );
  }
}

AppNavLink.defaultProps = {
  level: 1,
};

export default AppNav;
