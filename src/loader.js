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
		status : $("#statusBar"),
		grid   : true,
		undo   : 20
	});

	resizeWrapper();
	$(window).resize(resizeWrapper);
	$(document).bind("contextmenu", function(e) {
		e.preventDefault();
		return false;
	});

	$("#mainPanel").mousewheel(function(e, delta) {
		var scrl = editor.scroller,
			zoom = editor.zoomFactor + (delta = (delta < 0 ? -1 : 1));

		if (zoom < 1 || zoom > 16)
			return;
		else if (editor.pixel.scalers[zoom] === null)
			delta *= 2;

		scrl.zoomTo(scrl.__zoomLevel + delta, false, e.pageX - scrl.__clientLeft, e.pageY - scrl.__clientTop);
		editor.redrawStatusBar(e.pageX, e.pageY);
	});

	$("#mainPanel").mousedown(function(e) {
		if (!e) e = window.event;
		if ((e.which && e.which > 1) || (e.button && e.button > 0)) {
			editor.scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
			mousedown = 2;
		}
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
			editor.handler.mouseDown($.extend(coords, {
				lx: lastPixelX,
				ly: lastPixelY,
				mov: true
			}));

			lastPixelX = coords.x;
			lastPixelY = coords.y;
			mousedown = 1;
		}

		notmoved = true;
	});

	$(document).mousemove(function(e) {
		editor.redrawStatusBar(e.pageX, e.pageY);

		if (mousedown === 0)
			return;
		else if (mousedown == 2) {
			editor.scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
		}
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
			editor.handler.mouseMove($.extend(coords, {
				lx: lastPixelX,
				ly: lastPixelY,
				mov: notmoved
			}));

			lastPixelX = coords.x;
			lastPixelY = coords.y;
		}

		notmoved = false;
	});

	$(document).mouseup(function(e) {
		if (!mousedown)
			return;

		if (!e) e = window.event;
		if ((e.which && e.which > 1) || (e.button && e.button > 0))
			editor.scroller.doTouchEnd(e.timeStamp);
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
			editor.handler.mouseUp($.extend(coords, {
				lx: lastPixelX,
				ly: lastPixelY,
				mov: notmoved
			}));
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
			fr = new window.FileReader();

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
	$('#colors').buttonset();
	$('#drawing-mode').buttonset();
	$('#select-func').buttonset();

	$.each({
		'tool0': 'select',
		'tool1': 'select-grid',
		'tool2': 'pencil',
		'tool3': 'brush',
		'tool4': 'fill',
		'tool5': 'lines',
		'tool6': 'ellipse',
		'tool7': 'rectangle',
		'select0': 'select',
		'select1': 'resize',
		'select2': 'select-cut',
		'select3': 'select-move',
		'select4': 'select-copy',
		'select5': 'select-invert',
		'select6': 'select-flip-x',
		'select7': 'select-flip-y',
		'fillmode': 'fill'
	}, function(index, val) {
		$('#' + index).button({
			icons: { primary: 'ui-icon-' + val },
			text: false
		});
	});

	$('#tool' + editor.editTool).click();
	$('#mode' + editor.editMode).click();
	$('#color' + editor.editColor).click();
	$('#select' + editor.editSelect).click();
	$('#filling-mode').hide();
	$('#select-func').hide();
	editor.selectionCallback(false);

	$("#colors>input:radio").click(function() {
		editor.editColor = parseInt(this.value);
		return false;
	});
	$("#tools>input:radio").click(function() {
		editor.editTool = parseInt(this.value);

		if (editor.editTool > 5)
			$('#filling-mode').show();
		else {
			$('#filling-mode').hide();

			if (editor.editTool < 2) {
				$('#select-func').show();
				$('#drawing-set').hide();
			}
			else {
				$('#select-func').hide();
				$('#drawing-set').show();
			}
		}

		return false;
	});
	$("#drawing-mode>input:radio").click(function() {
		editor.editMode = parseInt(this.value);
		return false;
	});
	$("#select-func>input:radio").click(function() {
		editor.editSelect = parseInt(this.value);

		if (editor.selection.nonEmpty() && editor.editSelect > 0) {
			editor.handler.selectFunction();
			if (editor.editSelect < 3 || editor.editSelect > 4) {
				$('input#select0').click();
				editor.editSelect = 0;
			}
		}

		return false;
	});
	$("#filling-mode>input:checkbox").change(function() {
		editor.editFilled = this.checked;
		return false;
	});
});
