const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // entry: ['babel-polyfill', './src/index.js'],
    entry: ['./src/index.js'],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'index.bundle.js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        alias: {
            'svg-baker-runtime': path.resolve(__dirname, 'node_modules/svg-baker-runtime'),
            'svg-sprite-loader/runtime/browser-sprite.build': path.resolve(
                __dirname,
                'node_modules/svg-sprite-loader/runtime/browser-sprite.build.js'
            ),
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ['ts-loader'],
            },
            {
                test: /\.(css|scss)$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /(@spredfast\/ui-icons.*svg|\.svg)/,
                exclude: /ckeditor5-/,
                use: { loader: 'svg-sprite-loader' },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html'),
        }),
    ],
};
