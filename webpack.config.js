const path = require('path');
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
    mode: 'development',
    devServer: { contentBase: path.join(__dirname, 'src') },
    devtool: 'inline-source-map',
});
