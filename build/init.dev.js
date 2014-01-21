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
		var i, js = /init\.js(\?.*)?$/, path, dev = '', m,
			a = document.getElementsByTagName('script');

		for (i = 0; i < a.length; i++) {
			var s = a[i].getAttribute('src');
			if (m = s.match(js)) {
				if (m[1] && m[1].indexOf('?dev') == 0)
					dev = '.dev';
				path = s.replace(js, '');
				break;
			}
		}

		for (i in this.libraries)
			this.include(path + this.libraries[i] + dev + '.js');
	}
};

initializer.load();
