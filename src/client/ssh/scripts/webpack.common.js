const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
module.exports = {
  context: path.resolve('__dirname', '../'),
  entry: {
    flimble: './src/js/index.js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      './src/client.htm',
      './src/favicon.ico'
    ]),
    new ExtractTextPlugin('[name].css')
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../public')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader'
            }
          ]
        })
      }
    ]
  }
}
