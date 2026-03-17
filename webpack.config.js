const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: './frontend/index.js',
  output: {
    path: path.resolve(__dirname, 'public/assets/js'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/bundle.css' // Vai gerar em public/assets/css/bundle.css
    })
  ],
  devtool: 'source-map'
};