Documentation
=============

The docs are built by pre-rendering an isomorphic React + Flummox app. Naturally, it also serves as a demo app.

- The docs are written as a tree of Markdown files in `/docs` (probably should rename to distinguish from top-level docs folder).
- A script converts the Markdown into JSON files, which can be served statically and fetched via AJAX.
- A React app renders the site.
- The app is served by iojs/koa, then converted to static files using wget.
- The static files are committed into version control, then pushed to the `gh-pages` branch.

View the site here: [http://acdlite.github.io/flummox](http://acdlite.github.io/flummox)

For purposes of illustration, it's a bit over-engineered in some places. For instance, data is fetched via AJAX, even though it would be easier to just embed the payload directly in the HTML source.

Right now the docs themselves have mostly just been copied over from the old `docs` directory that this replaces. Many of these docs are in need of an overhaul, and some are missing. (The `connectToStores` higher-order component isn't documented at all!) Going forward, docs should link heavily to source of this app to provide examples when appropriate.

Pull requests welcome :)

Tools and libraries used
------------------------

- [React](http://facebook.github.io/react/)
- [Flummox](http://acdlite.github.io/flummox)
- [iojs](http://iojs.org)
- [koa](http://koajs.com/)
- [Sass/libsass](http://sass-lang.com)
- [React Router](https://github.com/rackt/react-router)
- [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
- [React Hot Loader](http://gaearon.github.io/react-hot-loader/getstarted/)
- [Remarkable](https://github.com/jonschlinkert/remarkable)
- [front-matter](https://github.com/jxson/front-matter)

...and more.
