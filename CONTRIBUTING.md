# Contributing

## File organization

All code is written in next-generation JavaScript and transpiled using Babel, including tests. Source files are located in `src` and transpiled to `lib`, which is gitignored. `dist` is for browser builds, and is not ignored. Add-ons (modules that are not part of core) are located in `src/addons`.

Tests for a module should be placed in a `__tests__` subdirectory and named with a `-test.js` suffix. For example, the test suite for the module at `foo/bar.js` should be located at `foo/__tests__/bar-test.js`.


## Building

Babel is used for transpilation, but refrain from using any features that require an ES6 or above polyfill, as this will increase the bundled size of the library — e.g. async/await or symbols. This does not apply to tests, however, as they do not affect the bundle size.

To transpile the source files:

```
make js
```

(If it's the first time you're building the `lib` directory, or if you've just run the clean task, you should run `make fast-js` to transpile all the files at once. Subsequent builds should use `make js`.)

Browser builds, one uncompressed and one compressed, are built using webpack. These should only be built right before a new release, not on every commit. These are not recommended for actual use — use a module bundler like webpack or browserify instead. They exist primarily so we can keep an eye on the overall size of the library.

To build for the browser:

```
make browser
```

To transpile and build for browser:

```
make build
```

To clean all generated files

```
make clean
```

## Tests

To run the test suite:

```
make test
```

(As in the previous section, you should run `make fast-js` for the first run. You can chain make tasks on the command line like so: `make fast-js test`).

Tests are run on the transpiled code, not the source files. If you rename or delete a source file, make sure the transpiled file is also deleted. You can always run `make clean` to clear out all generated files.

Tests are written using mocha and chai. chai-as-promised and async/await should be used for testing asynchronous operations. A browser environment is provided for React tests via jsdom. Continuous integration tests are run on Travis CI.

## Code style

Code is linted using ESLint and babel-eslint. Rules are located in `.eslintrc`. Even if linting passes, please do your best to maintain the existing code style.

Linting is always run before testing. To run the lint task separately:

```
make lint
```
