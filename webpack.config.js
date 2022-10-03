const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const PackageJsonPlugin = require('pkg.json-webpack-plugin');
const optimizeConstEnum = require('ts-transformer-optimize-const-enum').default;

const baseConfig = require("@blueprintjs/webpack-build-scripts/webpack.config.base");

const webpackConfig = Object.assign({}, baseConfig, {
	entry: {
		"app": [
			// environment polyfills
			"dom4",
			"./polyfill.js",
			// bundle entry points
			"./src/index.tsx",
		],
	},

	devServer: {
		historyApiFallback: true,
		open: false,
		client: {
			logging: 'log',
			overlay: {
				warnings: true,
				errors: true,
			},
		},
		static: [
			path.resolve(__dirname, "src"),
			path.resolve(__dirname, "public")
		],
		port: 3000,
	},

	output: {
		filename: "[name].js",
		publicPath: "",
		path: path.resolve(__dirname, "./dist"),
	},

	plugins: baseConfig.plugins.concat([
		new CopyWebpackPlugin({
			patterns: [
				// to: is relative to dist/
				{ from: "src/index.html", to: "." },
				{ from: "public/*", to: "." },
			],
		}),
		new PackageJsonPlugin({
			key: 'package',
			include: ['version', 'releaseYear'],
		})
	]),

	module: {
		rules: baseConfig.module.rules.map(rule => {
			const { test, options } = rule
			if (test && test.test('.ts')) {
				return {
					...rule,
					options: {
						...options,
						getCustomTransformers: program => ({
							before: [
								optimizeConstEnum(program),
							],
							afterDeclarations: [
								optimizeConstEnum(program),
							],
						}),
					}
				}
			}
			return rule
		})
	},

	target: 'browserslist'
});

module.exports = webpackConfig;
