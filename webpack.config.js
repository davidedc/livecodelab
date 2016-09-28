module.exports = {
  entry: './src/coffee/lcl-init.coffee',
  output: {
    filename: './dist/app.js'
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: 'coffee-loader' }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.coffee'],
    alias: {
      jquery: './jquery'
    }
  }
};
