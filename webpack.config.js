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
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.coffee', '.html'],
    alias: {
      jquery: './jquery'
    }
  }
};
