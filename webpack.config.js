
var config = {
  cache: true,
  context: __dirname + '/src',
  entry: './index.es6',
  output: {
    path: __dirname + '/dist',
    filename: 'bplus-index.js',
    libraryTarget: 'umd',
    library: 'BPlusTree'
  },
  module: {
    preLoaders: [
      {
        test: /\.es6$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.es6', '.json']
  }
}

module.exports = config
