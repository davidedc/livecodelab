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
    extensions: ['', '.js', '.json', '.coffee'],
    alias: {
      jquery: './jquery'
    }
  }
};
