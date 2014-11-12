'use strict';

module.exports = function() {
  var del = require('del');
  del(['./dist/*']);
};
