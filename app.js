var http = require('http'),
	path = require('path'),
	url = require('url'),
	fs = require('fs');

var port = parseInt(process.argv[2], 10) || 80,
	mimeTypes = {
		'.html': 'text/html',
		'.png': 'image/png',
		'.gif': 'image/gif',
		'.js': 'text/javascript',
		'.css': 'text/css'
	};

function processRequest(request, response) {
	"use strict";

	var uri = url.parse(request.url).pathname;
	if (uri.substr(-1) == '/')
		uri += 'index.html';

	var filename = path.join(process.cwd() + '/build', uri);
	fs.exists(filename, function(exists) {
		if (exists && uri.match(/^\/[\w\/\-\.]*$/)) {
			var fileStream, extension = path.extname(filename),
				mimeType = mimeTypes[extension] || 'application/octet-stream';

			response.writeHead(200, { 'Content-Type': mimeType });
			console.log('200: ' + uri + ' [' + mimeType + ']');

			fileStream = fs.createReadStream(filename);
			fileStream.pipe(response);
		}
		else {
			console.log('404: ' + uri);
			response.writeHead(404, { 'Content-Type': 'text/plain' });
			response.write('404 Not Found\n');
			response.end();
		}
	});
}

http.createServer(processRequest).listen(port);
console.log("listening on " + port);
