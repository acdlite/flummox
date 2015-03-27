'use strict';

var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:8081',
    'webpack/hot/only-dev-server',
    './public/flummox/css/app.css',
    './src/client/app',
  ],
  output: {
    path: path.join(__dirname, '/public/flummox/js/'),
    filename: 'app.js',
    publicPath: 'http://localhost:8081/flummox/js/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL),
    }),
  ],
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loaders: ['react-hot', 'babel-loader?experimental&externalHelpers'], exclude: /node_modules/ },
      { test: /\.css/, loader: "style-loader!css-loader" },
    ]
  }
};
