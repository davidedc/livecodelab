/* global process, require, module, __dirname */

var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill', './src/coffee/lcl-init.coffee'],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: './app.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /jquery.*\.js/,
          /coffee-script\.js/,
          /codemirror/
        ],
        loader: 'babel-loader'
      },
      { test: /\.coffee$/, loader: 'coffee-loader' },
      { test: /\.css$/, loader: ['style-loader', 'css-loader'] },
      {
        test: /\.html$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.ttf$|\.eot$/,
        loader: 'file-loader',
        query: {
          name: 'font/[hash].[ext]'
        }
      },
      {
        test: /\.(mp3|ogg)$/,
        loader: 'file-loader',
        query: {
          name: 'sound/[hash][name].[ext]'
        }
      },
      { test: /\.(png|jpg|svg)$/, loader: 'url-loader?limit=8192' },
      { test: /\.pegjs$/, loader: 'pegjs-loader' },
      { test: /\.lcl\.yaml$/, loader: 'lcl-program-loader' }
    ]
  },
  resolve: {
    extensions: [
      '.js',
      '.coffee',
      '.html',
      '.pegjs',
      '.mp3',
      '.ogg',
      '.lcl.yaml'
    ],
    alias: {
      jquery: './jquery'
    }
  },
  resolveLoader: {
    modules: ['./webpack', './node_modules']
  },
  plugins: [
    new webpack.DefinePlugin({
      LANGUAGE: JSON.stringify(
        process.env.LCLANG === 'v2' ? 'livelangv2' : 'livelangv1'
      )
    })
  ]
};
