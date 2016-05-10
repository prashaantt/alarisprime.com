import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

import del from 'del';
import runSequence from 'run-sequence';
import webpack from 'webpack';
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

const webpackConfig = require('./webpack.config');

gulp.task('scripts', (cb) => {
	webpack(webpackConfig, function (err, stats) {
		if (err) {
			throw new $.util.PluginError('webpack', err);
		}

		$.util.log('[webpack]', stats.toString());
		cb();
	});
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
