require('../shared/init');

import koa from 'koa';
const app = koa();
export default app;

// Serve static assets from `public` directory
import serve from 'koa-static';
app.use(serve('public'));

import appView from './appView';
appView(app);

// Start listening
const port = process.env.PORT || 3000;
app.listen(port);
console.log(`App started listening on port ${port}`);
