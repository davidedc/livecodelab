/* global process, require, module, __dirname */

const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src/lcl.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /jquery.*\.js/,
          /coffee-script\.js/,
          /codemirror/,
        ],
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: [
                    'safari >= 8',
                    'chrome >= 49',
                    'firefox >= 50',
                    'ie >= 11',
                    'last 1 edge version',
                  ],
                },
              },
            ],
          ],
        },
      },
      { test: /\.coffee$/, loader: 'coffee-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.html$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /\.ttf$|\.eot$/,
        loader: 'file-loader',
        options: {
          name: 'font/[hash].[ext]',
        },
      },
      {
        test: /\.(mp3|ogg)$/,
        loader: 'file-loader',
        options: {
          name: 'sound/[hash][name].[ext]',
        },
      },
      { test: /\.(png|jpg|svg)$/, loader: 'url-loader?limit=8192' },
      { test: /\.pegjs$/, loader: 'pegjs-loader' },
      { test: /\.lcl\.yaml$/, loader: 'lcl-program-loader' },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  },
  resolve: {
    extensions: [
      '.js',
      '.coffee',
      '.html',
      '.pegjs',
      '.mp3',
      '.ogg',
      '.lcl.yaml',
    ],
    alias: {
      jquery: './jquery',
    },
  },
  resolveLoader: {
    modules: ['./webpack', './node_modules'],
  },
  plugins: [
    new webpack.DefinePlugin({
      LANGUAGE: JSON.stringify(
        process.env.LCLANG === 'v2' ? 'livelangv2' : 'livelangv1'
      ),
    }),
  ],
  devServer: {
    host: '0.0.0.0',
    port: 8080,
  },
};
