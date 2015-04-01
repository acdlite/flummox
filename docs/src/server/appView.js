// Render React app
import React from 'react';
import Router from 'react-router';
import FluxComponent from 'flummox/component';
import Flux from '../shared/Flux';
import routes from '../shared/routes';
import performRouteHandlerStaticMethod from '../shared/utils/performRouteHandlerStaticMethod';
import nunjucks from 'nunjucks';

nunjucks.configure('views', {
  autoescape: true,
});

export default function(app) {
  app.use(function *() {
    const router = Router.create({
      routes: routes,
      location: this.url,
      onError: error => {
        throw error;
      },
      onAbort: abortReason => {
        const error = new Error();

        if (abortReason.constructor.name === 'Redirect') {
          const { to, params, query } = abortReason;
          const url = router.makePath(to, params, query);
          error.redirect = url;
        }

        throw error;
      }
    });

    const flux = new Flux();

    let appString;

    try {
      const { Handler, state } = yield new Promise((resolve, reject) => {
        router.run((_Handler, _state) =>
          resolve({ Handler: _Handler, state: _state })
        );
      });

      const routeHandlerInfo = { state, flux };

      try {
        yield performRouteHandlerStaticMethod(state.routes, 'routerWillRun', routeHandlerInfo);
      } catch (error) {}


      appString = React.renderToString(
        <FluxComponent flux={flux}>
          <Handler {...state} />
        </FluxComponent>
      );
    } catch (error) {
      if (error.redirect) {
        return this.redirect(error.redirect);
      }

      throw error;
    }

    this.body = nunjucks.render('index.html', {
      appString,
      env: process.env,
    });
  });
}
