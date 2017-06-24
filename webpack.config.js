/* global process */

var webpack = require('webpack');

module.exports = {
  entry: './src/coffee/lcl-init.coffee',
  output: {
    path: './dist',
    filename: './app.js'
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: 'coffee-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.html$/,
        loader: 'file',
        query: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.ttf$|\.eot$/,
        loader: 'file',
        query: {
          name: 'font/[hash].[ext]'
        }
      },
      {
        test: /\.(mp3|ogg)$/,
        loader: 'file',
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
    extensions: ['', '.js', '.json', '.coffee', '.html', '.pegjs', '.mp3', '.ogg', '.lcl.yaml'],
    alias: {
      jquery: './jquery'
    }
  },
  resolveLoader: {
    modulesDirectories: [
      './webpack', './node_modules'
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      LANGUAGE: JSON.stringify(process.env.LCLANG === 'v2' ? 'livelangv2' : 'livelangv1')
    }),
  ]
};
