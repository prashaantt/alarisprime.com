module.exports = {
	entry: './scripts/entry.js',
	output: {
		path: './dist/scripts/',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loaders: ['babel-loader']
			},
			{
				test: require.resolve('turbolinks'),
				loader: 'imports?this=>window'
			}
		]
	}
};
