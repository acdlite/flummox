# Changelog

Tags:

- [New Feature]
- [Bug Fix]
- [Breaking Change]
- [Documentation]
- [Internal]
- [Polish]

## Pending release
- **New Features**
  - `Flux#removeAllStoreListeners()` removes all listeners from all stores.
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
  - Add sections clarifying how to access flux instance (e.g. to perform actions) using FluxMixin/FluxComponent

## 2.8.0
- **New Feature**
  - `getStoreState()` in FluxMixin returns current combined state of connected stores.
- **Bug Fix**
  - FluxMixin/FluxComponent will now updated when a prop change is detected, but not state. [#29](https://github.com/acdlite/flummox/issues/29)
- **Documentation**
  - Add API docs for FluxMixin and FluxComponent. Included section explaining why a "key" prop should be passed to components that implement FluxMixin.

## 2.7.2
- **Bugfix**
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
  - FluxComponent and FluxMixin for easy React integration
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
