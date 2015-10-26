define(['jquery', 'GCIS_reference'], function($, GCIS_reference) {
    function GCIS() {
	/* Set to 1 output all fields */
	this.dump_empty_fields = 1;

	if ((typeof Drupal !== 'undefined') && (typeof Drupal.settings.gcis_url !== 'undefined')) {
	    this.server = Drupal.settings.gcis_url;
	}
	else {
	    /* CICS GCIS */
	    this.server = "https://gcis.cicsnc.org";

	    /* production GCIS server */
	    //this.server = "https://data.globalchange.gov";
	}
    }

    GCIS.prototype = {
	getServer: function() {
	    return this.server;
	},

	setServer: function(server) {
	    this.server = server;
	},

	showImages: function(id) {
	    var server = this.server;
	    var url = server + "/image/" + id;
	    var out = "";

	    jQuery.ajax({
		dataType: "json",
		async: false,
		url: url + ".json",
		success: function(d) {
		    var ob = "";
		    var l = d.files.length;

		    if (l) {
			for (i=0; i<l; i++) {
			    var fileURL = server + d.files[i].url;
			    var fileHREF = 'javascript:gcis_show_image("' + id + '");';

			    ob += "<div class='metadata-img'><div class='thumbnail'><a href='" + fileHREF + "'><img src='" + fileURL + "' ></a></div><div class='view-options'><a href='" + fileURL + "' class='img-zoom zoom'><span class='icon'></span> Zoom</a><a href='" + fileHREF + "' class='img-meta'><span class='icon'></span> Metadata</a></div></div>";
			}
		    }
		    else {
			var fileURL = "";
			var fileHREF = 'javascript:gcis_show_image("' + id + '");';

			ob += "<div class='metadata-img'><div class='thumbnail'><a href='" + fileHREF + "'><img src='" + fileURL + "' style='width:60px; height=60px;'  ></a></div><div class='view-options'><a href='" + fileURL + "' class='img-zoom zoom'><span class='icon'></span> Zoom</a><a href='" + fileHREF + "' class='img-meta'><span class='icon'></span> Metadata</a></div></div>";
		    }
		    out = ob;
		} 
	    });
	    return(out);
	},

	/*
	    Dump an array of values
	*/
	showArray: function(what, arr, icon, tooltip) {
	    var out = "";

	    out += "<div class='row'>";
	    out += "<div class='td-l'>";

	    /*
		Fontawesome icons
	    */
	    if (icon) {
		out += '<i class="fa fa-' + icon + '">';
		out += '&nbsp;' // Need this else CKEDITOR drops the tag
		out += '</i> ';
	    }
	    out += what + "</div>";;
	    out += "<div class='td-r'>";
	    if (arr.len) {
		for (var i=0; i<arr.len; i++) {
		    if (i) {
			out += '<br/>';
		    }
		    out += arr[i];
		}
	    }
	    else {
		out += "&nbsp;";
	    }
	    out += "</div>";
	    out += "</div>";
	    return(out);
	},

	showKeywords: function(what, keywords, icon, tooltip) {
	    var out = "";

	    out += "<div class='row'>";
	    out += "<div class='td-l'>";

	    /*
		Fontawesome icons
	    */
	    if (icon) {
		out += '<i class="fa fa-' + icon + '">';
		out += '&nbsp;' // Need this else CKEDITOR drops the tag
		out += '</i> ';
	    }
	    out += what + "</div>";
	    out += "<div class='td-r'>";
	    if (keywords.length) {
		for (var i=0; i<keywords.length; i++) {
		    if (i) {
			out += '<br/>';
		    }
		    out += keywords[i].label;
		    out += "&nbsp;" + this.createTooltip(keywords[i].definition);
		}
	    }
	    else {
		out += "&nbsp;";
	    }
	    out += "</div>";
	    out += "</div>";
	    return(out);
	},

	showKeywords2: function(what, keywords, icon, tooltip) {
	    var out;

	    out = "<dt>";

	    /*
		Fontawesome icons
	    */
	    if (icon) {
		out += '<i class="fa fa-' + icon + '">';
		out += '&nbsp;' // Need this else CKEDITOR drops the tag
		out += '</i> ';
	    }
	    out += what;
	    out += "</dt><dd>";
	    for (var i=0; i<keywords.length; i++) {
		if (i) {
		    out += '<br/>';
		}
		out += keywords[i].label;
		out += "&nbsp;" + this.createTooltip(keywords[i].definition);
	    }
	    out += "</dd>";
	    return(out);
	},

	showArray2: function(what, arr, icon, tooltip) {
	    var out;

	    out = "<p>";

	    /*
		Fontawesome icons
	    */
	    if (icon) {
		out += '<i class="fa fa-' + icon + '">';
		out += '&nbsp;' // Need this else CKEDITOR drops the tag
		out += '</i> ';
	    }
	    out += "<strong>" + what + "</strong>";
	    for (var i=0; i<arr.len; i++) {
		if (i) {
		    out += '<br/>';
		}
		out += arr[i];
	    }
	    out += "</p>";
	    return(out);
	},

	showLatLon: function(d) {
	    var lat, lon;
	    var lmin, lmax;
	    var latlon = "";

	    lmin = (d.lat_min == null || d_lat_min == "null") ? "" : (d.lat_min + "&deg;");
	    lmax = (d.lat_max == null || d_lat_max == "null") ? "" : (d.lat_max + "&deg;");
	    lat = lmin + "/" + lmax;
	    if (lat != "/") {
		latlon = "Lat(min/max): " + lat + "<br>";
	    }
	    lmin = (d.lon_min == null || d_lon_min == "null") ? "" : (d.lon_min + "&deg;");
	    lmax = (d.lon_max == null || d_lon_max == "null") ? "" : (d.lon_max + "&deg;");
	    lon = lmin + "/" + lmax;
	    if (lon != "/") {
		latlon += "Lon(min/max): " + lon;
	    }
	    return(this.showVar("Region", latlon, "", ""));
	},

	showLatLon2: function(lat_min, lat_max, lon_min, lon_max) {
	    var lat, lon;
	    var lmin, lmax;
	    var latlon = "";

	    lmin = (lat_min == null || lat_min == "null") ? "" : (lat_min + "&deg;");
	    lmax = (lat_max == null || lat_max == "null") ? "" : (lat_max + "&deg;");
	    lat = lmin + "/" + lmax;
	    if (lat != "/") {
		latlon = "Lat (min/max): " + lat + "<br>";
	    }
	    lmin = (lon_min == null || lon_min == "null") ? "" : (lon_min + "&deg;");
	    lmax = (lon_max == null || lon_max == "null") ? "" : (lon_max + "&deg;");
	    lon = lmin + "/" + lmax;
	    if (lon != "/") {
		latlon += "Lon (min/max): " + lon;
	    }
	    return(latlon);
	},


	showTimePeriod: function(startTime, endTime) {
	    var out = "";
	    var st = new Date(startTime);
	    var et = new Date(endTime);

	    out = this.formatDate(st) + "&ndash;" + this.formatDate(et);
	    return(out);
	},

	/*
	    Generate a ranking for this asset: figure
	*/
	rankFigure:function(d) {
	    return(Math.floor(Math.random() * 3) + 1);
	},

	/*
	    Generate a ranking for this asset: image
	*/
	rankImage:function(d) {
	    return(Math.floor(Math.random() * 3) + 1);
	},

	trunc_id:function(id) {
	    return(id.substring(0, id.indexOf("-")));
	},

	/*
	    Generate tooltip string, no HTML please!
	*/
	createTooltip:function(tip) {
	    var out;

	    out = '<a href="#" rel="gcis-tooltip" data-toggle="tooltip" title="' + tip + '"><span class="glyphicon glyphicon-question-sign"></span></a>';
	    return(out);
	},

	/*
	    Re-format output from Javascript Date function
	*/
	formatDate: function(dt) {
	    return(dt.toUTCString().substr(4,12));
	},

	/*
	    Get parameter from query string

	    http://css-tricks.com/snippets/javascript/get-url-variables/
	*/
	getQueryVariable: function(variable) {
	   var query = window.location.search.substring(1);
	   var vars = query.split("&");
	   for (var i=0;i<vars.length;i++) {
		   var pair = vars[i].split("=");
		   if (pair[0] == variable) {
			return pair[1];
		    }
	   }
	   return(false);
	},

	/*
	    Return datasets used by an image
	*/
	get_datasets: function(image_id) {
	    var out = new Array();

	    jQuery.ajax({
	    	context: this,
		dataType: "json",
		async: false,
		url: this.server + "/image/" + image_id + ".json",
		success: function(d) {
		    if (d.parents.length) {
			for (var i=0; i<d.parents.length; i++) {
			    jQuery.ajax({
				dataType: "json",
				async: false,
				url: this.server + d.parents[i].url + ".json",
				success: function(ds) {
				    out.push(ds.identifier);
				}
			    });
			}
		    }
		}
	    });
	    return(out);
	},

	/*
	    Return JSON list of chapters
	*/
	listOfChapters: function(report) {
	    var url = this.server + "/report/" + report + "/chapter/";
	    var j;

	    jQuery.ajax({
		dataType: "json",
		async: false,
		url: url + ".json?all=1",
		success: function(d) {
		    j = d;
		}
	    });
	    return(j);
	},

	/*
	    Return JSON list of figures
	*/
	listOfFigures: function(report, chapter) {
	    var url = this.server + "/report/" + report + "/chapter/" + chapter + "/figure";
	    var j;

	    jQuery.ajax({
		dataType: "json",
		async: false,
		url: url + ".json?all=1",
		success: function(d) {
		    j = d;
		}
	    });
	    return(j);
	},

	get_datasets_names: function(image_id) {
	    var out = new Array();

	    jQuery.ajax({
		context: this,
		dataType: "json",
		async: false,
		url: this.server + "/image/" + image_id + ".json",
		success: function(d) {
		    if (d.parents.length) {
			for (var i=0; i<d.parents.length; i++) {
			    if (d.parents[i].publication_type_identifier == "dataset") {
				jQuery.ajax({
				    dataType: "json",
				    async: false,
				    url: this.server + d.parents[i].url + ".json",
				    success: function(ds) {
					out.push(ds.name);
				    }
				});
			    }
			}
		    }
		}
	    });
	    return(out);
	},

	get_datasets_names_for_images: function(image_id) {
	    var out = new Array();

	    jQuery.ajax({
		context: this,
		dataType: "json",
		async: false,
		url: this.server + "/image/" + image_id + ".json",
		success: function(d) {
		    if (d.parents.length) {
			for (var i=0; i<d.parents.length; i++) {
			    jQuery.ajax({
				dataType: "json",
				async: false,
				url: this.server + d.parents[i].url + ".json",
				success: function(ds) {
				    var href = ds.href.replace(/\.json.*/,'');
				    out.push([ds.name, href]);
				}
			    });
			}
		    }
		}
	    });
	    return(out);
	},

	get_dataset_name_from_url: function(url) {
	    var dbName = "";

	    jQuery.ajax({
		context: this,
		dataType: "json",
		async: false,
		url: this.server + url + ".json",
		success: function(d) {
		    dbName = d.name;
		},
		error: function() {
		    console.log("get_dataset_name_from_url failed");
		}
	    });
	    return(dbName);
	},

	get_reference: function(uuid) {
	    return("GCIS Reference...");
	}
    };
    return GCIS;
});
