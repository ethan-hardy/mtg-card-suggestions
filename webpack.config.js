'use strict';
// const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './client/script/src/index.es6',
  output: {
    path: './client/',
    filename: 'build/main.js'
  },
  module: {
    loaders: [
      {
        test: /\.(eot|svg|ttf|otf|woff|woff2)$/,
        loader: 'file?name=build/fonts/[name].[ext]'
      },
      { test: /\.css$/, loader: "style-loader!css-loader!autoprefixer-loader" },
      {
        test: /\.es6$/,
        loader: 'babel-loader'
      }
    ]
  },
  devtool: 'source-map'
};
