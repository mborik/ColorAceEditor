module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner:
			'/*\n' +
			' * <%= pkg.name %> v<%= pkg.version %>\n' +
			' * <%= pkg.description %>\n' +
			' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
			' */\n',

		jshint: {
			files: [
				'src/editor.js',
				'src/editor.pixel.js',
				'src/editor.draw.js',
				'src/editor.handler.js',
				'src/loader.js'
			]
		},
		copy: {
			dist: {
				files: [
					{
						src: 'src/index.html',
						dest: 'build/index.html'
					},
					{
						src: 'src/init.js',
						dest: 'build/init.dev.js'
					},
					{
						src: 'bower_components/scroller/src/Scroller.js',
						dest: 'build/scroller.dev.js'
					},
					{
						expand: true,
						cwd: 'jqueryui_theme/images/',
						src: '**',
						dest: 'build/images/',
						flatten: true,
						filter: 'isFile'
					}
				]
			}
		},
		concat: {
			options: {
				separator: '\n'
			},
			"app": {
				src: [
					'src/editor.js',
					'src/editor.pixel.js',
					'src/editor.draw.js',
					'src/editor.handler.js',
					'src/loader.js'
				],
				dest: 'build/app.dev.js'
			},
			"jquery": {
				src: [
					'bower_components/jquery/jquery.js',
					'bower_components/jquery-mousewheel/jquery.mousewheel.js'
				],
				dest: 'build/jquery.dev.js'
			},
			"jqueryuijs": {
				options: {
					separator: '\n',
					stripBanners: true
				},
				src: [
					'bower_components/jqueryui/ui/jquery.ui.core.js',
					'bower_components/jqueryui/ui/jquery.ui.widget.js',
					'bower_components/jqueryui/ui/jquery.ui.mouse.js',
					'bower_components/jqueryui/ui/jquery.ui.button.js',
					'bower_components/jqueryui/ui/jquery.ui.position.js',
					'bower_components/jqueryui/ui/jquery.ui.dialog.js',
					'bower_components/jqueryui/ui/jquery.ui.slider.js'
				],
				dest: 'build/jqueryui.dev.js'
			},
			"jqueryuicss": {
				options: {
					separator: '\n',
					stripBanners: true
				},
				src: [
					'bower_components/jqueryui/themes/base/jquery.ui.core.css',
					'bower_components/jqueryui/themes/base/jquery.ui.button.css',
					'bower_components/jqueryui/themes/base/jquery.ui.dialog.css',
					'bower_components/jqueryui/themes/base/jquery.ui.slider.css',
					'jqueryui_theme/jquery-ui.theme.css'
				],
				dest: 'jqueryui_theme/jquery-ui.css'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				files: [
					{
						src: 'build/app.dev.js',
						dest: 'build/app.js'
					},
					{
						src: 'build/jquery.dev.js',
						dest: 'build/jquery.js'
					},
					{
						src: 'build/jqueryui.dev.js',
						dest: 'build/jqueryui.js'
					},
					{
						src: 'build/init.dev.js',
						dest: 'build/init.js'
					},
					{
						src: 'bower_components/scroller/src/Scroller.js',
						dest: 'build/scroller.js'
					}
				]
			}
		},
		cssmin: {
			'styles': {
				options: {
					banner: '<%= banner %>\n' +
						'@import url("jqueryui.css");'
				},
				files: {
					'build/styles.css': [
						'src/styles.css'
					]
				}
			},
			'jqueryui': {
				files: {
					'build/jqueryui.css': [
						'jqueryui_theme/jquery-ui.css'
					]
				}
			}
		}
	});

	// Default line endings
	grunt.util.linefeed = '\n';

	// Load required modules
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	// Task definitions
	grunt.registerTask('default', [ 'jshint', 'copy', 'concat', 'uglify', 'cssmin' ]);
	grunt.registerTask('test', [ 'jshint' ]);
};