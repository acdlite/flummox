'use strict';

jest.dontMock('../Flux');

describe('Flux', function() {
  var flux;
  var store;
  var actions;
  var constants;

  beforeEach(function() {
    flux = require('../Flux');
  });

  it('should return singleton instance', function() {
    var flux2 = require('../Flux');
    expect(flux2).toBe(flux);
  });

  it('should allow for creation of separate named instances', function() {
    var fluxFoo = flux.create('foo');
    var fluxFoo2 = flux.get('foo');

    expect(fluxFoo).not.toBe(flux);
    expect(fluxFoo2).toBe(fluxFoo);
  });
});
