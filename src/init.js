/*!
 * PMD 85 ColorAce picture editor
 * initialization script
 *
 * Copyright (c) 2012 Martin Borik
 */

var initializer = {
	libraries: [
		'jquery',
		'jqueryui',
		'scroller',
		'app'
	],

	include: function (lib) {
		try {
			document.write('<' + 'script type="text/javascript" language="javascript" src="' + lib + '"><\/script>');
		} catch(e) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = lib;
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	},

	load: function () {
		var i, js = /init\.js(\?.*)?$/, path,
			s, dev = window.location.href.match(/[\?&]dev(.*)$/) ? '.dev' : '',
			a = document.getElementsByTagName('script');

		for (i = 0; i < a.length; i++) {
			s = a[i].getAttribute('src');
			if (s.match(js)) {
				path = s.replace(js, '');
				break;
			}
		}

		for (i in this.libraries)
			this.include(path + this.libraries[i] + dev + '.js');
	}
};

initializer.load();
