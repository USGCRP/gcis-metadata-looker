define([
	'jquery',
	'bootstrap',
	'GCIS',
	'citeproc',
	'text!../templates/metadata-modal-template.html',
	'text!../csl/locales-en-US.xml',
	'text!../csl/nca3.csl'
], function(
	$,
	$$,
	GCIS,
	CSL,
	metadataModalTemplateSrc,
	locale,
	csl
) {
    function GCIS_reference() {
	this.uuid = "";
	this.json = "";
    	this.citeprocSys = {
	    // Given a language tag in RFC-4646 form, this method retrieves the
	    // locale definition file. This method must return a valid *serialized*
	    // CSL locale. (In other words, an blob of XML as an unparsed string. The
	    // processor will fail on a native XML object or buffer).
	    retrieveLocale: function(lang){
		return(locale);
	    },

	    // Given an identifier, this retrieves one citation item.  This method
	    // must return a valid CSL-JSON object.
	    //
	    // We are using a global variable to store the only items
	    //
	    retrieveItem: function(id){
		return(window.GCIS_json);
	    }
	}
	debugger;
	this.citeproc = new CSL.Engine(this.citeprocSys, csl);
	gcis = new GCIS();
	this.gcis_server = gcis.getServer();
    }

    GCIS_reference.prototype = {
	/*
	    Display a formatted reference
	*/
	show: function(uuid) {
	    var url = this.gcis_server + "/reference/" + uuid.trim() + ".json";
	    var json = "";
	    var nj = {};
	    var ids = new Array();

	    if ($("#metadata-summary-modal").length == 0) {
		$("body").append(metadataModalTemplateSrc);
	    }

	    $.ajax({
		url: url,
		dataType: 'json',
		async: false,
		success: function(d) {
		    json = d;
		},
		error: function(request, status, error) {
		    var msg;
		    if (request.status && request.status == 400) {
			msg = request.responseText;
		    }
		    else {
			msg = "Error: " + error;
		    }
		    $("#metadata-alert-modal .modal-body .alert p").html(msg);
		    $("#metadata-alert-modal").modal({
			backdrop: false,
			keyboard: true
		    });
		}
	    });

	    if (json == "") {
	    	return("");
	    }
	    this.uuid = uuid;
	    ja = json.attrs;
	    nj.id = "Item-1";
	    ids.push(nj.id);
	    switch (ja.reftype) {
	      case 'Book':
	      case 'Book Section':
	      case 'Edited Book':
	      case 'Generic':
		nj.type = 'book';
		if (typeof ja["Book Title"] != "undefined") {
		    nj.title = ja["Book Title"];
		}
		else if (typeof ja.Title != "undefined") {
		    nj.title = ja.Title;
		}
		break;
	      case 'Conference Proceedings':
	      case 'Conference Paper':
		nj.type = 'paper-conference';
		nj.title = this._load_maybe(ja, "Title");
		break;
	      case 'Government Document':
	      case 'Report':
	      case 'Legal Rule or Regulation':
		nj.type = 'report';
		nj.title = this._load_maybe(ja, "Title");
		break;
	      case 'Thesis':
		nj.type = 'article-journal';
		nj.title = this._load_maybe(ja, "Title");
		if (typeof ja.University != "undefined") {
		  nj["container-title"] = ja.University;
		}
		break;
	      case 'Magazine Article':
		nj.type = "article-journal";
		if (typeof ja.Magazine != "undefined") {
		  nj["container-title"] = ja.Magazine;
		}
		nj.title = this._load_maybe(ja, "Title");
		break;
	      case 'Newspaper Article':
		nj.type = "article-journal";
		nj.title = this._load_maybe(ja, "Title");
		nj['container-title'] = this._load_maybe(ja, "Newspaper");
		if (typeof ja.Reporter != "undefined") {
		    ja.Author = ja.Reporter;
		}
		break;
	      case 'Journal Article':
		nj.type = "article-journal";
		nj.title = this._load_maybe(ja, "Title");
		nj['container-title'] = this._load_maybe(ja, "Journal");
		break;
	      case 'Electronic Article':
		nj.type = 'webpage';
		nj.title = this._load_maybe(ja, "Title");
		nj["publication-date"] = this._load_maybe(ja, "E - Pub Date");
		nj["container-title"] = this._load_maybe(ja, "Periodical Title");
	        break;
	      case 'Web Page':
		nj.type = 'webpage';
		nj.title = this._load_maybe(ja, "Title");
		break;
	      case 'Film or Broadcast':
	        nj.type = 'motion_picture';
		nj.title = this._load_maybe(ja, "Title");
		if (typeof ja.Director != "undefined") {
		    ja.Author = ja.Director;
		}
		if (typeof ja["Series Title"] != "undefined") {
		   nj["container-title"] = ja["Series Title"];
		}
	        break;
	    }
	    nj.author = this._get_authors(ja);
	    nj.editor = this._load_maybe(ja, "Editor");
	    nj.publisher = this._load_maybe(ja, "Publisher");
	    nj.URL = this._outputURL(this._load_maybe(ja, "URL"));
	    nj.DOI = this._load_maybe(ja, "DOI");
	    if (nj.DOI != "") {
		nj.DOI = "<a href='http://dx.doi.org/" + nj.DOI + "'>" + nj.DOI + "</a>";
	    }
	    nj.volume = this._load_maybe(ja, "Volume");
	    if (typeof ja["Year Released"] != "undefined") {
	    	ja.Year = ja["Year Released"];
	    }
	    nj.issued = this.get_date(ja);
	    nj.issue = this._load_maybe(ja, "Issue");
	    nj.ISBN = this._load_maybe(ja, "ISBN");
	    if (typeof ja.Pages != "undefined") {
		nj.page = this._load_maybe(ja, "Pages");
	    }
	    else if (typeof ja["Number of Pages"] != "undefined") {
		nj.page = nj["number-of-pages"] = this._load_maybe(ja, "Number of Pages");
	    }
	    window.GCIS_json = nj;			// Global variable
	    
	    this.citeproc.updateItems(ids);
	    var bibHTML = this.citeproc.makeBibliography();
	    var bib = bibHTML[1][0].replace(/&#60;/g, "<");
	    bib = bib.replace(/&#62;/g, ">").replace(/href=’/g, "href='");
	    return(bib);
	},

	_get_authors: function(json) {
	    var a = new Array();

	    if (typeof json.Author != "undefined") {
		authors = json.Author.split("\r");
		for (var i=0; i<authors.length; i++) {
		    var aj = {};
		    var c = authors[i].indexOf(",");
		    if (c >= 0) {
			aj.family = c ? authors[i].substring(0, c).trim() : authors[i].substring(0).trim();
			aj.given = authors[i].substring(c+1).trim();
		    }
		    else {
			aj.name = authors[i].trim();
		    }
		    /*
		    aj.name = authors[i];
		    */
		    a.push(aj);
		}
	    }
	    return(a);
	},

	get_date: function(json) {
	    var da = {};
	    var dt = new Array();
	    var ymd = new Array(3);
	    var y = "", m = "", d = "";
	    ymd[0] = ymd[1] = ymd[2] = "";

	    if (json.Year) {
	    	y = json.Year
	    }
	    if (json.Date) {
		ymd = this._parseDate(json.Date);
		if (y == "" && ymd[0] != "") {
		    y = ymd[0];
		}
		if (ymd[1] != "") {
		    m = ymd[1];
		}
		if (ymd[2] != "") {
		    d = ymd[2];
		}
	    }
	    dt.push(y);
	    dt.push(m);
	    if (d != "") {
		dt.push(d);
	    }
	    da["date-parts"] = new Array();
	    da["date-parts"].push(dt);
	    return(da);
	},

	_load_maybe: function(json, what) {
	    if (typeof json[what] !== "undefined") {
	    	return(json[what]);
	    }
	    return("");
	},

	_parseDate: function(ds) {
	    var ms1 = [
			"jan", "feb", "mar", "apr", "may", "jun",
			"jul", "aug", "sep", "oct", "nov", "dec"
		     ];
	    var ms2 = [
			"January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		     ];
	    var y = "";
	    var m = "";
	    var d = "";
	    var matches = new Array();

	    if (ds != "") {
		if (ds.indexOf("/") != -1) {
		    if (matches = ds.match(/(\d+)\/(\d+)\/(\d+)/)) {
			if (matches[1].length == 4) {
			    y = matches[1];
			    m = matches[2];
			    d = matches[3];
			}
			else {
			    m = matches[1];
			    d = matches[2];
			    y = matches[3];
			}
			m = ms2[m-1];
		    }
		}
		else if (ds.indexOf(",") != -1) {
		    matches = ds.match(/(\w+) (\S+), (\w+)/);
		    m = matches[1];
		    d = matches[2];
		    y = matches[3];
		}
		else if (ds.indexOf(" ") != -1) {
		    matches = ds.match(/(\w+) (\w+)/);
		    m = matches[1];
		    if (matches[2].length == 4) {
			y = matches[2];
		    }
		    else {
			d = matches[2];
		    }
		}
		else {
		    m = ds;
		    for (var i=0; i<ms1.length; i++) {
			if (m.toLowerCase() == ms1[i]) {
			    m = ms2[i];
			    break;
			}
		    }
		}
	    }
	    return([y, m, d]);
	},

	_outputURL: function(url) {
	    var s = "";

	    if (url != "") {
		if (url.substring(0,1) != '"' && url.substring(0,1) != "'") {
		    url = "'" + url + "'";
		}
		s = "<a href=" + url + ">URL</a>";
	    }
	    return(s);
	}
    }
    return GCIS_reference;
});
