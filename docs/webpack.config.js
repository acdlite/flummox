'use strict';

var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/client/app',
  output: {
    path: path.join(__dirname, '/public/flummox/js/'),
    filename: 'app.min.js',
    publicPath: '/flummox/js/'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
          warnings: false
      }
    }),
  ],
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loaders: ['babel-loader?experimental&externalHelpers'], exclude: /node_modules/ }
    ]
  }
};
