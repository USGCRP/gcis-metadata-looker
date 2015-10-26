requirejs.config({
	'baseUrl': '.',
	'shim': {
		'bootstrap': { deps: ['jquery'] },
		'matchHeight': { deps: ['jquery'] },
		'handlebars': { exports: 'Handlebars' },
		'GCIS_reference': { deps: ['citeproc'] },
		'citeproc': { deps: ['xmldom'], exports: 'CSL' }
	},
	'paths': {
		'jquery': 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min',
		'bootstrap': 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min',
		'handlebars': 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.2/handlebars.min',
		'matchHeight': 'https://cdnjs.cloudflare.com/ajax/libs/jquery.matchHeight/0.6.0/jquery.matchHeight-min',
		'blockUI': 'jquery.blockUI',
		'GCIS': 'GCIS',
		'GCIS_viewer': 'GCIS_viewer',
		'GCIS_reference': 'GCIS_reference',
		'GCIS_finding': 'GCIS_finding',
		'citeproc': 'citeproc',
		'xmldom': 'xmldom',
		'text': 'text',
		'css': 'css'
	}
});

/*
    Define string trim for IE8
*/
if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
    	return this.replace(/^\s+|\s+$/g, ''); 
    }
}

function gcis_show_figure(uuid) {
    require([ 'GCIS_viewer' ], function(GCIS_viewer) {
	var sect = "";
	var g = new GCIS_viewer();
	g.show_figure(uuid, sect);
    });
}

function gcis_show_image(uuid) {
    require([ 'GCIS_viewer' ], function(GCIS_viewer) {
	var sect = "";
	var g = new GCIS_viewer();
	g.show_image(uuid, sect);
    });
}

function gcis_show_reference(uuid, div) {
    require([ 'GCIS_reference' ], function(GCIS_reference) {
	var r = new GCIS_reference();
	var html = r.show(uuid);
	jQuery(div).html(html);
    });
}

function gcis_get_reference(uuid) {
    require([ 'jquery', 'GCIS_reference' ], function($, GCIS_reference) {
	var r = new GCIS_reference();
	return(r.show(uuid));
    });
}

function gcis_show_finding(uuid, modal_id) {
    require([ 'jquery', 'GCIS_finding' ], function($, GCIS_finding) {
	var f = new GCIS_finding();
	var h = f.show(uuid);
	$(modal_id + " .modal-body").html(h);
	$(modal_id + " .modal-body").find(".confidence-level-td").matchHeight();
    });
}

