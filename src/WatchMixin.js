'use strict';

function watchMixin(flux, storeNames, listener) {
  if (!Array.isArray(storeNames)) storeNames = [storeNames];
  var stores = storeNames.map(name => flux.getStore(name));

  return {
    componentDidMount() {
      stores.forEach(store => {
        store.addListener('change', this.storeDidChange);
      });
    },

    componentWillUnmount() {
      stores.forEach(store => {
        store.removeListener('change', this.storeDidChange);
      });
    }
  };
}

module.exports = watchMixin;
