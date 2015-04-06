# Changelog

Tags:

- [New Feature]
- [Bug Fix]
- [Breaking Change]
- [Documentation]
- [Internal]
- [Polish]

## 3.5.1
- **Bug Fix**
  - Higher-order component wasn't passing through props [@Blitz2145](https://github.com/Blitz2145)

## 3.5.0
- **New Feature**
  - `Flux#createActions()` will now also accept a plain JavaScript object instead of an Actions class.

## 3.4.0
- **New Feature**
  - `removeActions()` and `removeStore()` [@chicoxyzzy](https://github.com/chicoxyzzy)

## 3.3.3
- **Bug Fix**
  - Squash Chrome `Uncaught (in promise) errors` once and for all (hopefully). Big thanks to [@johanneslumpe](https://github.com/johanneslumpe).

## 3.3.2
- **Bug Fix**
  - Yet another attempt to deal with asynchronous error handling in a sane way. Previously, errors in store handlers were being swallowed. This should fix that problem.

## 3.3.0
- **New Feature**
  - `registerAll()` and `registerAllAsync()` [@hugobessaa](https://github.com/hugobessaa)

## 3.2.1
- **Bug Fix**
  - Fix connectToStores HoC to pass state instead of props.

## 3.2.0
- **New Feature**
  - New higher-order component connectToStores, because why not. It works just like FluxComponent.

## 3.1.2
- **Bugfix**
  - Switch back to using `cloneWithProps()` instead of `cloneElement()` to fix context passing with FluxComponent. See [this issue](https://github.com/acdlite/flummox/issues/111#issuecomment-85172486) for an explanation.

## 3.1.1
- **Bugfix**
  - Add dummy handler to internal promise to prevent false warnings.

## 3.1.0
- **New Feature**
  - Flux is passed as second parameter to custom render function of FluxComponent.
  - New Store method `getStateAsObject()` is used inside default state getters for `connectToStores()`. This should be overridden alongside `Store.assignState()`.
  - New prop `stateGetter` for FluxComponent. ([@tappleby](https://github.com/tappleby))
  - Store no longer warns if `setState()` called outside dispatch handler. There are some valid reasons you may want to do this, primarily tests.
- **Internal**
  - Updated dependencies.

## 3.0.1
- **Bug Fix**
  - Add `Store.assign()` workaround for TypeScript, since it doesn't support extending static methods.  ([@ivw](https://github.com/ivw))

## 3.0.0
- **New Feature**
  - Transactional state updates: `this.setState(state => ({ foo: state.foo + 1 }))`.
  - A new static method `Store.assignState()` can be overridden to customize the top-level state type.
  - Custom rendering in `FluxComponent`. Pass a function as the `render` prop.
- **Breaking Change**
  - FluxComponent and fluxMixin require React 0.13.
  - Stores no longer use empty object as default state. Default state is null, like React.
  - The array form of `connectToStore()` accepts a single state getter as the second parameter, which is passed an array of stores corresponding to the passed keys.
  - State getters are no longer auto-bound to the component. Props are passed as the second parameter.
  - Directly-nested FluxComponents warn about mismatched parent and owner context. Not sure how to fix this yet, but it will work because of prop transfer, anyway. To avoid the warning, use `render` prop instead.
  - `connectToStores()` no longer checks if component is mounted before updating, since `isMounted()` is deprecated in React 0.13. 99% of the time, this shouldn't be a problem, and it's easily worked around using the `render` prop. Let me know if this is a serious issue for you.
  - `FluxComponent` updates in `componentWillReceiveProps()` instead of `componentDidUpdate()`, preventing extra render.
- **Internal**
  - Remove undocumented method `Store#getState()`.
  - Favor `const` over `let`.

Big thanks to [@tappleby](https://github.com/tappleby), [@hugobessaa](https://github.com/hugobessaa), [@gaearon](https://github.com/gaearon), [@emmenko](https://github.com/emmenko), [@ariabuckles](https://github.com/ariabuckles), and everyone else who submitted a PR or an issue or contributed in any way.

## 2.13.1
- **Bug Fix**
  - Small update to async actions so returned promise does not reject due to errors that occur in store handlers.

## 2.13.0
- **New Features**
  - `Store#forceUpdate()` like React

## 2.12.5
- **Bug Fix**
  - Fix requiring normal React instead of React with addons in FluxComponent.

## 2.12.4
- **Bug Fix**
  - Fix bug when single item array is child of FluxComponent. [#53](https://github.com/acdlite/flummox/issues/53)

## 2.12.3
- **Internal**
  - Updated tests to be compatible with React 0.13. Should be ready for final 0.13 release.
  - Lint with eslint and babel-eslint.
- **Polish**
  - Wrapped warnings in environment checks so they can be stripped in production, like React. [#52](https://github.com/acdlite/flummox/issues/52)

## 2.12.2
- **Bug Fix**
  - Performing an action that hasn't been added to a Flux instance now warns instead throwing an error. [#46](https://github.com/acdlite/flummox/issues/46)

## 2.12.0
- **New Features**
  - Flux emits an `error` event when errors occur as the result of an async action. This includes errors that occur inside the actions themselves and errors that occur in response to store state changes -- previously, these were being swallowed by the async action's promise, which made it difficult to debug. [#50](https://github.com/acdlite/flummox/issues/50)
  - Action return values are now returned to the original caller, in addition to being dispatched. [#46](https://github.com/acdlite/flummox/issues/46)

## 2.11.0
- **New Features**
  - TestUtils, for simulating actions to test store handlers. [#44](https://github.com/acdlite/flummox/pull/44)  Thanks, [@tappleby](https://github.com/tappleby)!

## 2.10.0
- **New Features**
  - Flux emits `dispatch` event on dispatch, with payload passed to listeners.

## 2.9.3
- **New Features**
  - `Flux#removeAllStoreListeners()` removes all listeners from all stores.
- **Bug Fix**
  - FluxComponents with multiple children no longer improperly output a string. [#39](https://github.com/acdlite/flummox/pull/39) [@K4orta](https://github.com/K4orta)
- **Internal**
  - Updated Babel to 4.3.0

## 2.9.2
- **Bug Fix**
  - Check if FluxComponent is mounted before updating. [#36](https://github.com/acdlite/flummox/pull/36) [@conradz](https://github.com/conradz)

## 2.9.1
- **New Feature**
  - Extra props set on FluxComponent will be injected into children. This lets you nest FluxComponents, so store getters on an inner FluxComponent can use props retrieved by an outer FluxComponent.
  - FluxComponent no longer wraps a single child in a `span`. It only wraps if there are multiple children.
- [Documentation]
  - Add sections clarifying how to access flux instance (e.g. to perform actions) using fluxMixin/FluxComponent

## 2.8.0
- **New Feature**
  - `getStoreState()` in fluxMixin returns current combined state of connected stores.
- **Bug Fix**
  - fluxMixin/FluxComponent will now updated when a prop change is detected, but not state. [#29](https://github.com/acdlite/flummox/issues/29)
- **Documentation**
  - Add API docs for fluxMixin and FluxComponent. Included section explaining why a "key" prop should be passed to components that implement fluxMixin.

## 2.7.2
- **Bug Fix**
  - Fix React peer dependency version so it works on 0.13

## 2.7.0
- **New Feature**
  - `createActions()` and `createStores()` now return the new Store/Actions instance. [#4](https://github.com/acdlite/flummox/pull/27) [@tappleby](https://github.com/tappleby)

## 2.6.1
- **Bug Fix**
  - Fixes bug with array form of `connectToStores()`. [#4](https://github.com/acdlite/flummox/pull/24)
 Thanks, [@tomusher](https://github.com/tomusher)

## 2.6.0

- **New Feature**
  - `Store#registerAsync()` for doing optimistic updates in response to asynchronous actions
  - FluxComponent and fluxMixin for easy React integration
- **Documentation**
  - React integration guide
  - Minor updates
- **Internal**
  - Updated dependencies
  - Testing on iojs, for jsdom compatibility

Thanks to [@vesparny](https://github.com/vesparny), [@martintietz](https://github.com/martintietz), [@SimonDegraeve](https://github.com/https://github.com/SimonDegraeve) for your input on new features.

## 2.5.1
- **Bug Fix**
  - `Flux#deserialize()` was passing *entire* state string to stores, instead of the state string for each specific store. Thanks [@martintietz](https://github.com/martintietz) for catching this! [#15](https://github.com/acdlite/flummox/issues/15)
- **Internal**
  - Removed file `arrayIncludes.js`, which was no longer being used.

## 2.5.0

- **New Feature**
  - `Store#register()` now accepts either action ids or actions themselves.
- **Internal**
  - Action ids are stored directly on the action instead of in a separate collection.

## 2.4.0

- **New Feature**
  - Added browser build using webpack, mostly just so we can keep an eye on bundle size.
- **Documentation**
  - Updated README.md
  - Added explanation of enforced unidirectional data flow to Actions.md
  - Added recommended libraries section
- **Internal**
  - Removed dependency on ES6 polyfills to reduce bundle size. Library assumes global Promise.
  - Updated Makefile.

## 2.3.0

This release does introduce a few minor breaking changes... I contemplated bumping the version to 3.0, but the affected areas are such edge cases (undocumented and unsupported ones, at that) that I decided against it. The fact that the project is only, like, a week old was also a factor. In the future, as the API stablizes and matures, I'll try to be better about this.

The semver for this project is a little wacky, since the 1.0 version of this library existed for quite a while, but it was only ever used by me and was quite different in many ways. This is all a long-winded, extra cautious, apologetic way of me explaining why you should use (~) (or exact versions) for dependencies in your `package.json` file instead of the default (^) — not just for this package, but for all packages.

(See "Why Semantic Versioning Isn't": https://gist.github.com/jashkenas/cbd2b088e20279ae2c8e)

- **New Feature**
  - Serialization / Deserialization
  - `Store#replaceState()`
  - Added alias `getConstants()` for `getActionIds()`
  - Better warning messages.
- **Breaking Change**
  - Calling an action only return promises if the original action method returns a promise. Before, all actions returned promises, even if they were synchronous.
  - Instantiating a base Store class will now throw an error. This is technically a "breaking" change, since you used to be able to do so, but it's certainly an edge case. More likely to break tests than actual code.
- **Documentation**
  - API docs
- **Internal**
  - Use spies to test warning messages.
