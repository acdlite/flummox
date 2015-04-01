import React from 'react/addons';
import { RouteHandler } from 'react-router';
import AppNav from './AppNav';

const { CSSTransitionGroup } = React.addons;

class AppHandler extends React.Component {
  static willTransitionTo(transition) {
    const { path } = transition;

    if (path !== '/' && path.endsWith('/')) {
      transition.redirect(path.substring(0, path.length - 1));
    }
  }

  // Fetch all docs on start up, since there aren't that many
  static async routerWillRun({ flux }) {
    const docActions = flux.getActions('docs');
    return await docActions.getAllDocs();
  }

  render() {
    return (
      <div>
        <AppNav />
        <CSSTransitionGroup transitionName="RouteTransition">
          <RouteHandler {...this.props} key={this.props.pathname} />
        </CSSTransitionGroup>
      </div>
    );
  }
}

export default AppHandler;
