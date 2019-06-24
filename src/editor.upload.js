/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Uploader - processing of uploaded file
 *
 * Copyright (c) 2019 Martin Borik
 */

ColorAceEditor.Uploader = function(editor, canvas) {
	if (!$(canvas).is("canvas"))
		throw "ColorAceEditor: Image render canvas element not defined!";

	var ctx = canvas.getContext("2d");
	var getPixelValue = function(x, y) {
		var pix = ctx.getImageData(x, y, 1, 1).data;
		return Math.round((
			Math.round(pix[0] * 299) +
			Math.round(pix[1] * 587) +
			Math.round(pix[2] * 114)
		) / 1000);
	};

	return function(file, callback) {
		if (!file)
			return;

		try {
			var fr = new window.FileReader();

			if (typeof file.type === 'string' && file.type.indexOf('image/') === 0) {
				fr.onload = function() {
					var img = new Image();

					img.onload = function() {
						if (img.width > 288 || img.height > 256)
							callback({ error: 'invalid image dimensions' });

						canvas.width = img.width;
						canvas.height = img.height;
						ctx.drawImage(img, 0, 0);

						for (var y = 0; y < img.height; y++) {
							for (var x = 0; x < img.width; x++) {
								editor.pixel.surface[(y * 288) + x] = getPixelValue(x, y) ? 7 : 0;
							}
						}

						editor.scroller.zoomTo(editor.zoomFactor);

						img = null;
						callback({ success: true });
					};

					img.src = this.result;
				};

				fr.readAsDataURL(file);
			}
			else if (file.size === 16384) {
				fr.onload = function() {
					var b = new Uint8Array(this.result);
					editor.pixel.readPMD85vram(b);
					editor.scroller.zoomTo(editor.zoomFactor);

					callback({ success: true });
				};

				fr.readAsArrayBuffer(file);
			}
			else callback({ error: 'not an image file or PMD-85 screen' });
		}
		catch (e) { console.error(e); }
	};
};
