/*
 * PMD 85 ColorAce picture editor
 * onReady initialization and entry point
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

var editor = null, mousedown = 0, notmoved = false,
	lastPixelX = -1, lastPixelY = -1;

//- resizing handler ----------------------------------------------------------
var resizeWrapper = function() {
	var wrapW = $(window).width(), wrapH = $(window).height();
	$('#wrapper').css({ width:  wrapW + 'px', height: wrapH + 'px' });
	$('#leftPanel').css({ height: wrapH + 'px' });
	$("#mainPanel").css({ height: wrapH + 'px' });
	editor.setDimensions($("#mainPanel").width(), wrapH);
};

//-----------------------------------------------------------------------------
$(document).ready(function() {
	editor = new ColorAceEditor({
		canvas : $("#myCanvas")[0],
		grid   : true,
		undo   : 20
	});

	resizeWrapper();
	$(window).resize(resizeWrapper);
	$(document).bind("contextmenu", function(e) {
		e.preventDefault();
		return false
	});

	$("#mainPanel").mousewheel(function(e, delta) {
		var self = editor.scroller;
		self.zoomTo(self.__zoomLevel + (delta < 0 ? -1 : 1), false,
			e.pageX - self.__clientLeft, e.pageY - self.__clientTop);
	});

	$("#mainPanel").mousedown(function(e) {
		if (!e) var e = window.event;
		if ((e.which && e.which > 1) || (e.button && e.button > 0)) {
			editor.scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
			mousedown = 2;
		}
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
			lastPixelX = coords.x;
			lastPixelY = coords.y;
			mousedown = 1;
		}

		notmoved = true;
	});

	$(document).mousemove(function(e) {
		if (mousedown == 0)
			return;
		else if (mousedown == 2) {
			editor.scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
		}
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
			if (lastPixelX != coords.x || lastPixelY != coords.y)
				editor.draw.line(lastPixelX, lastPixelY, coords.x, coords.y, notmoved);

			lastPixelX = coords.x;
			lastPixelY = coords.y;
		}

		notmoved = false;
	});

	$(document).mouseup(function(e) {
		if (!mousedown)
			return;

		if (!e) var e = window.event;
		if ((e.which && e.which > 1) || (e.button && e.button > 0))
			editor.scroller.doTouchEnd(e.timeStamp);
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
			if (notmoved)
				editor.draw.dot(coords.x, coords.y);
			else if (lastPixelX != coords.x || lastPixelY != coords.y)
				editor.draw.line(lastPixelX, lastPixelY, coords.x, coords.y, true);
		}

		lastPixelX = -1; lastPixelY = -1;
		notmoved = false;
		mousedown = 0;
	});

	$('#clear-button').button({
		icons: { primary: "ui-icon-new" },
		text: false
	}).click(function() {
		$(this).blur();
		return false;
	});

	$('#upload-button').button({
		icons: { primary: "ui-icon-load" }
	}).click(function() {
		$('#upload-file:file').click();
		$(this).blur();
		return false;
	});

	$('#upload-file:file').change(function() {
		var file = this.files[0],
			fr = new window.FileReader;

		if (fr && file) try {
			fr.onload = function() {
				var b = new Uint8Array(this.result);
				editor.pixel.readPMD85vram(b);
				editor.scroller.zoomTo(editor.zoomFactor);
			};

			fr.readAsArrayBuffer(file);
		}
		catch(e) { console.error(e); }
	});

	$('#save-button').button({
		icons: { primary: "ui-icon-save" }
	}).click(function() {
		var url = editor.pixel.savePMD85vram(),
			link = $('#save-data')[0];

		link.href = url;
		link.click();

		$(this).blur();
		return false;
	});

	$('#tools').buttonset();
	$('#tool0').button({
		icons: { primary: "ui-icon-select" },
		text: false
	});
	$('#tool1').button({
		icons: { primary: "ui-icon-select-grid" },
		text: false
	});
	$('#tool2').button({
		icons: { primary: "ui-icon-pencil" },
		text: false
	});
	$('#tool3').button({
		icons: { primary: "ui-icon-brush" },
		text: false
	});
	$('#tool4').button({
		icons: { primary: "ui-icon-fill" },
		text: false
	});
	$('#tool5').button({
		icons: { primary: "ui-icon-lines" },
		text: false
	});
	$('#tool6').button({
		icons: { primary: "ui-icon-ellipse" },
		text: false
	});
	$('#tool7').button({
		icons: { primary: "ui-icon-rectangle" },
		text: false
	});

	$('#colors').buttonset();
	$('#drawing-mode').buttonset();

	$("#colors > input:radio").click(function() {
		editor.editColor = parseInt(this.value);
		return false;
	});
	$("#drawing-mode > input:radio").click(function() {
		editor.editMode = parseInt(this.value);
		return false;
	});
});
