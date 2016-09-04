'use strict';
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry: './client/script/src/index.es6',
    output: {
        path: './client/',
        filename: 'script/main.js'
    },
    module: {
        loaders: [
            // { test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css!autoprefixer!sass') },
            { test: /\.es6$/, loader: 'babel-loader' }
        ]
    },
    // plugins: [
    //     new ExtractTextPlugin('style/main.css')
    // ]
};

// TODO: uncomment these lines when styling is added
