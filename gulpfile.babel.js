import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

import del from 'del';
import runSequence from 'run-sequence';
import webpack from 'webpack-stream';
import browserSync from 'browser-sync';

const $ = gulpLoadPlugins();

const siteConfig = require('./site.config.json');

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('metalsmith', () => {
	return gulp.src('pages/**/*.njk')
		.pipe($.metalsmith({
			use: [
				require('metalsmith-define')({
					site: siteConfig
				}),
				require('metalsmith-in-place')({
					engine: 'nunjucks',
					rename: true
				}),
				require('metalsmith-permalinks')()
			]
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('scripts', () => {
	// In future use http://webpack.github.io/docs/usage-with-gulp.html#normal-compilation
	// the source script is not use. Webpack uses webpack.config.js
	return gulp.src('scripts/entry.js')
		.pipe($.plumber())
		.pipe(webpack(require('./webpack.config.js')))
		.pipe(gulp.dest('dist/scripts/'));
});

gulp.task('stylesheets', () => {
	return gulp.src('scss/**/*.scss')
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['./node_modules']
		}).on('error', $.sass.logError))
		.pipe($.postcss([require('autoprefixer')]))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('dist/css/'));
});

gulp.task('copyStatic', () => {
	return gulp.src([
		'images/**/*',
		'root/**/*'
	])
	.pipe(gulp.dest('dist'));
});

gulp.task('lint:scripts', () => {
	return gulp.src([
		'scripts/**/*.js',
		'./*.js'
	])
	.pipe($.xo());
});

gulp.task('lint:stylesheets', () => {
	return gulp.src([
		'scss/**/*.scss'
	])
	.pipe($.sassLint())
  .pipe($.sassLint.format());
});

gulp.task('lint', ['lint:scripts', 'lint:stylesheets']);

gulp.task('build', cb => {
	return runSequence(
		['clean', 'lint'],
		['metalsmith', 'scripts', 'stylesheets', 'copyStatic'],
		cb
	);
});

gulp.task('serve', ['build'], () => {
	browserSync({
		server: {
			baseDir: ['dist/'],
			routes: {
				'/node_modules': 'node_modules'
			}
		},
		rewriteRules: [
			{
				match: /<body/g,
				fn: function () {
					return '<body data-turbolinks="false"';
				}
			}
		]
	});

	gulp.watch([
		'pages/**/*.njk',
		'includes/**/*.njk',
		'layouts/**/*.njk'
	], ['metalsmith']);

	gulp.watch([
		'images/**/*',
		'root/**/*'
	], ['copyStatic']);

	gulp.watch([
		'scripts/**/*.js',
		'gulpfile.babel.js'
	], ['lint:scripts', 'scripts']);

	gulp.watch('scss/**/*.scss', ['stylesheets', 'lint:stylesheets']);

	gulp.watch([
		'dist/**/*'
	]).on('change', browserSync.reload);
});

gulp.task('default', () => {
	gulp.start('build');
});
