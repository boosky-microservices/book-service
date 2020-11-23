const webpack = require("webpack");

const path = require('path');
const {
    NODE_ENV = 'production',
} = process.env;

module.exports = {
    context: __dirname,
    entry: './app.ts',
    mode: NODE_ENV,
    resolve: {
        extensions: ['.mjs', '.json', '.ts', '.js'],
        symlinks: false,
        cacheWithContext: false,
        modules: ['node_modules']
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js',
    },
    target: 'node',
    //externals: [nodeExternals()],
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.(ts)$/,
                loader: 'ts-loader',
                exclude: [
                    [
                        path.resolve(__dirname, '.webpack'),
                    ],
                ],
                options: {
                    transpileOnly: true,
                    experimentalWatchApi: true,
                },
            },
        ],
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/require_optional/),
    ],
};
