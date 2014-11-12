'use strict';

jest.dontMock('../Store');

describe('Store', function() {
  var Store = require('../Store');

  var flux;

  beforeEach(function() {
    flux = require('../Flux');
  });

  it('should be an EventEmitter', function() {
    var store = new Store({ name: 'FooStore' }, flux);
    expect(typeof store.addListener).toBe('function');
    expect(typeof store.removeListener).toBe('function');
    expect(typeof store.emit).toBe('function');
  });

  it('should have a name', function() {
    var store = new Store({ name: 'FooStore' }, flux);
    expect(store.getName()).toBe('FooStore');
  });
});
