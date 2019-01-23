let path = require('path')
let webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	mode: 'production', // development, production
	output: {
		path: path.resolve(__dirname, './lib_to_npm'),
//		publicPath: '/lib_to_npm/',
		filename: 'index.js',
		libraryTarget: 'umd',
		library: 'vue-grid-advanced',
		// umdNamedDefined: 'umd'
	},
	module: {
		rules: [{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.css$/,
				use: [
					'vue-style-loader',
					'css-loader'
				]
			},
			{
				test: /\.ts?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					appendTsSuffixTo: [/\.vue$/],
				}
			},
			{
				test: /\.scss$/,
				use: [{
						loader: "style-loader" // creates style nodes from JS strings
					},
					{
						loader: "css-loader" // translates CSS into CommonJS
					},
					{
						loader: "sass-loader" // compiles Sass to CSS
					}
				]
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]?[hash]'
				}
			}
		]
	},
	// externals: {
	// 	jquery: "jquery",
	// 	jqueryui: "jqueryui",
	// 	linq: "linq",
	// 	lodash: "lodash",
	// 	moment: "moment",
	// 	numeral: "numeral",
	// 	ramda: "ramda",
	// 	vue: "vue",
	// 	vuex: "vuex"
	// },
	resolve: {
		extensions: ['.ts', '.js', '.vue', '.json'],
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
	},
	// optimization: {
	// 	minimizer: [new UglifyJsPlugin()]
	// },
	plugins: [
		new VueLoaderPlugin(),
		// new webpack.DefinePlugin({
		// 	'process.env': {
		// 		NODE_ENV: '"production"'
		// 	}
		// }),
		// new webpack.optimize.UglifyJsPlugin({
		// 	sourceMap: true,
		// 	compress: {
		// 		warnings: false
		// 	}
		// }),
		// new webpack.LoaderOptionsPlugin({
		// 	minimize: true
		// })
	] 
}

// if (process.env.NODE_ENV === 'production') {
// 	module.exports.devtool = '#source-map'
// 	// http://vue-loader.vuejs.org/en/workflow/production.html
// 	module.exports.plugins = (module.exports.plugins || []).concat([
// 		new webpack.DefinePlugin({
// 			'process.env': {
// 				NODE_ENV: '"production"'
// 			}
// 		}),
// 		new webpack.optimize.UglifyJsPlugin({
// 			sourceMap: true,
// 			compress: {
// 				warnings: false
// 			}
// 		}),
// 		new webpack.LoaderOptionsPlugin({
// 			minimize: true
// 		})
// 	])
// }


