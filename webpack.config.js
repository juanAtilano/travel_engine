const path = require('path');

module.exports = {
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
  },
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  }
};