const webpack = require('webpack');
const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties'
                        ]
                    }
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader'
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack']
            },
            {
                test: /\.(jpg|JPG|jpeg|png|gif|mp3|ttf|woff2|woff|eot)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // limit: 8000, // Convert images < 8kb to base64 strings
                            name: 'images/[hash]-[name].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.m?jsx?$/,
                resolve: {
                    fullySpecified: false
                },
            }
        ]
    },
    output: {
        publicPath: 'auto',
        path: path.resolve(__dirname, '../static/'),
    },
    // Server Configuration options
    devServer: {
        host: '0.0.0.0',
        port: 3001,
        disableHostCheck: true,
        historyApiFallback: true,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-id, Content-Length, X-Requested-With',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
            }
        }),
        new ModuleFederationPlugin({
            name: 'auth',
            library: { type: 'var', name: 'auth' },
            filename: 'remoteEntry.js',
            exposes: {
                index: './src/index',
            },
            shared: {
                ...deps
            }
        }),
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.mjs']
    },
};
