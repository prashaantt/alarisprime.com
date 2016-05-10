module.exports = {
	entry: './scripts/entry.js',
	output: {
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{test: /\.js$/, loaders: ['babel-loader']},
			{test: require.resolve('turbolinks'), loader: 'imports?this=>window'}
		]
	}
};
