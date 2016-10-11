import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

import del from 'del';
import runSequence from 'run-sequence';
import webpack from 'webpack';
import browserSync from 'browser-sync';
import through2 from 'through2';
import merge from 'merge-stream';
import metalsmithMarkdown from 'metalsmith-markdownit';
import md5 from 'md5';

const $ = gulpLoadPlugins();
const md = metalsmithMarkdown({
	breaks: true,
	typographer: true,
	html: true
});

const siteConfig = require('./site.config.json');

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('metalsmith', () => {
	return gulp.src([
		'contents/**/*.{html,md}'
	])
		.pipe($.metalsmith({
			use: [
				require('metalsmith-define')({
					site: siteConfig,
					console: console,
					md5: md5,
					objectKeys: Object.keys
				}),
				require('metalsmith-collections')({
					projects: {
						pattern: 'projects/**/*',
						sortBy: 'date',
						reverse: true
					},
					people: {
						pattern: 'people/**/*',
						sortBy: 'name'
					}
				}),
				md,
				require('metalsmith-ignore')([
					'projects/*',
					'people/*'
				]),
				require('metalsmith-permalinks')(),
				require('metalsmith-in-place')({
					engine: 'nunjucks',
					rename: true,
					settings: {
						views: {
							noCache: true
						}
					}
				}),
				require('metalsmith-hyphenate')({
					elements: ['p', 'figcaption', 'li', 'ol']
				})
			]
		}))
		.pipe(gulp.dest('dist'));
});

const webpackConfig = require('./webpack.config');

gulp.task('scripts', cb => {
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
		.pipe($.sassGlob())
		.pipe($.sourcemaps.init())
		.pipe($.if('bundle.scss', $.insert.prepend(`$site-brand-color: ${siteConfig.brandColor};`)))
		.pipe($.sass.sync({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['./node_modules']
		}).on('error', $.sass.logError))
		.pipe($.postcss([require('autoprefixer')]))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('dist/css/'));
});

gulp.task('copy:root', () => {
	return gulp.src([
		'root/**/*'
	])
	.pipe(gulp.dest('dist'));
});

gulp.task('copy:images', () => {
	return gulp.src([
		'images/**/*'
	])
	.pipe(gulp.dest('dist/images'));
});

gulp.task('copy', ['copy:root', 'copy:images']);

gulp.task('sitemap', function () {
	return gulp.src('dist/**/*.html', {
		read: false
	})
	.pipe($.filter([
		'**',
		'!dist/thanks/*.html'
	]))
	// .pipe($.print())
	.pipe($.sitemap({
		siteUrl: siteConfig.baseUrl,
		lastmod: false,
		changefreq: 'weekly',
		priority: 0.5
	}))
	.pipe(gulp.dest('./dist'));
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

gulp.task('useref', () => {
	const userefConfig = {
		searchPath: ['dist', '.']
	};

	return gulp.src('dist/**/*.html')
		.pipe($.useref(userefConfig))
		.pipe($.if('*.js', $.uglify()))
		.pipe($.if('*.css', $.cssnano()))
		.pipe($.if('*.html', $.htmlmin({
			removeComments: true,
			cleanConditionalComment: false,
			collapseWhitespace: true,
			conservativeCollapse: true,
			collapseBooleanAttributes: true
		})))
		.pipe(gulp.dest('dist'));
});

gulp.task('assets-rev', () => {
	return gulp.src([
		'./dist/images/*',
		'./dist/scripts/*.js',
		'./dist/css/*.css'
	], {base: './dist/'})
	.pipe($.rev())
	.pipe(gulp.dest('./dist/'))
	.pipe($.rev.manifest())
	.pipe(gulp.dest('./dist/'))
	.pipe(through2.obj((file, enc, next) => {
		let manifest = require(file.path);
		let paths = Object.keys(manifest).map(x => './dist/' + x);

		del.sync(paths);

		next(null, file);
	}));
});

gulp.task('assets-rev-replace', ['assets-rev'], () => {
	let manifest = gulp.src('./dist/rev-manifest.json');

	return gulp.src([
		'./dist/**'
	])
	.pipe($.revReplace({
		manifest: manifest,
		replaceInExtensions: ['.js', '.css', '.html', '.xml']
	}))
	.pipe(gulp.dest('dist'));
});

gulp.task('build-core', cb => {
	return runSequence(
		['metalsmith', 'scripts', 'stylesheets', 'copy'],
		cb
	);
});

gulp.task('postbuild:cleanup', () => {
	return del.sync(['./dist/rev-manifest.json']);
});

gulp.task('size', () => {
	const scriptSize = gulp.src('dist/scripts/*')
		.pipe($.size({
			title: 'scripts',
			gzip: true,
			showFiles: true,
			showTotal: false
		}));

	const stylesheetSize = gulp.src('dist/css/*')
		.pipe($.size({
			title: 'scripts',
			gzip: true,
			showFiles: true,
			showTotal: false
		}));

	const totalBuildSize = gulp.src('dist/**/*')
		.pipe($.size({
			title: 'build',
			gzip: true
		}));

	return merge(scriptSize, stylesheetSize, totalBuildSize);
});

gulp.task('serve', ['build-core'], () => {
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
		],
		reloadDelay: 500
	});

	gulp.watch([
		'contents/**/*.md',
		'contents/**/*.html',
		'includes/**/*.html',
		'macros/**/*.html',
		'layouts/**/*.html'
	], ['metalsmith']);

	gulp.watch([
		'images/**/*',
		'root/**/*'
	], ['copy']);

	gulp.watch([
		'scripts/**/*.js',
		'gulpfile.babel.js'
	], ['lint:scripts', 'scripts']);

	gulp.watch('scss/**/*.scss', ['stylesheets', 'lint:stylesheets']);

	gulp.watch([
		'dist/**/*'
	]).on('change', browserSync.reload);
});

gulp.task('build', cb => {
	return runSequence(
		['clean', 'lint'],
		['build-core'],
		['sitemap'],
		['useref'],
		['assets-rev-replace'],
		['postbuild:cleanup'],
		['size'],
		cb
	);
});

gulp.task('default', () => {
	gulp.start('build');
});
