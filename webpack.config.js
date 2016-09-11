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
              test: /\.css$/,
              loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader')
            },
            {
              test: /\.es6$/,
              loader: 'babel-loader'
            },
            {
              test: /\.(eot|svg|ttf|otf|woff|woff2)$/,
              loader: 'file?name=fonts/[name].[ext]'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('build/main.css')
    ],
    // postcss: [ autoprefixer({ browsers: ['last 2 versions'] })],
    devtool: 'source-map'
};
