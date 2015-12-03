/*
	vi: ts=4
*/
define([
	'jquery',
	'bootstrap',
	'handlebars',
	'GCIS',
	'GCIS_reference',
	'blockUI',
	'text!../templates/metadata-modal-template.html',
	'text!../templates/figure-images-common-template.html',
	'text!../templates/figure-template.html',
	'text!../templates/image-template.html',
	'text!../templates/methods-details-template.html',
	'text!../templates/methods-template.html',
	'css!../css/metadata-looker'
], function(
	$,
	$$,
	Handlebars,
	GCIS,
	GCIS_reference,
	blockUI,
	metadataModalTemplateSrc,
	figureImagesCommonTemplateSrc,
	figureTemplateSrc,
	imageTemplateSrc,
	methodsDetailsTemplateSrc,
	methodsTemplateSrc
) {
    function GCIS_viewer() {
		gcis = new GCIS();
		this.gcis_server = gcis.getServer();
		this.IE8 = gcis.isIE8();
		this.figure_template = '';
		this.figure_images_common_template = '';
		this.image_template = '';
		this.methods_template = '';
		this.methods_details_template = '';
		this.tier2_methods_info_template = '';
		this.t1 = '';
		this.t2 = '';
    }

    GCIS_viewer.prototype = {
		/*
			Display a figure's metadata
		*/
		show_figure: function(uri, sect) {
			/*
				On IE8?
			*/
			if (this.IE8) {
				var url = this.gcis_server;
				url += (uri.indexOf("/") == 0) ? uri : ("/" + uri);
				window.open(url, "_blank", "scrollbars=1,status=1,toolbar=1");
				return;
			}

			/*
				Register Handlebars helpers
			*/
			Handlebars.registerHelper("outputDownloadLink", function(t1) {
				var out = '<p>';
				var bytes;

				if (t1.href != "") {
					out += '<a class="download" href="';
					out += t1.href + "?download=1";
					out += '">Download</a>';

					if (bytes = t1.size) {
					out += ' (';
					if (bytes == 0) {
						out += "0 bytes";
					}
					else {
						var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
						var i = parseInt(Math.floor(Math.log(bytes)/Math.log(1024)));
						out += Math.round(bytes/Math.pow(1024, i), 2) + ' ' + sizes[i];
					}
					out += ')';
					}
				}
				out += "</p>";
				return new Handlebars.SafeString(out);
			});

			Handlebars.registerHelper('output_timePeriod', function(times) {
				var out = "";

				if (times != null) {
					var startTime = times[0];
					var endTime = times[1];
					if (startTime && endTime) {
					out = gcis.showTimePeriod(startTime, endTime);
					}
				}
				if (out == "") {
					out = "&nbsp;";
				}
				return(new Handlebars.SafeString(out));
			});

			Handlebars.registerHelper('output_spatial_extent', function(ll) {
				var latlon = "";

				if (ll != null) {
					var lat_min = ll[0].trim();
					var lat_max = ll[1].trim();
					var lon_min = ll[2].trim();
					var lon_max = ll[3].trim();
					var lmin, lmax;

					lmin = (lat_min) ? ((lat_min === "N/A") ? "" : (lat_min + "&deg;")) : "";
					lmax = (lat_max) ? ((lat_max === "N/A") ? "" : (lat_max + "&deg;")) : "";
					lat = lmin + "/" + lmax;
					if (lat != "/") {
						latlon = "Lat (min/max): " + lat + "<br>";
					}
					lmin = (lon_min) ? ((lon_min === "N/A") ? "" : (lon_min + "&deg;")) : "";
					lmax = (lon_max) ? ((lon_max === "N/A") ? "" : (lon_max + "&deg;")) : "";
					lon = lmin + "/" + lmax;
					if (lon != "/") {
						latlon += "Lon (min/max): " + lon;
					}
					if (latlon == "") {
						latlon = "&nbsp;";
					}
				}
				else {
					latlon = "&nbsp;";
				}
				return(new Handlebars.SafeString(latlon));
			});

			Handlebars.registerHelper('output_origination', function(f) {
				var ob = "";

				if (typeof f.origination != "undefined") {
					ob += f.origination + "<br/>";
					/*
					switch (f.origination) {
					  case 'Directly Cited':
						ob += "Publication Type: " + f.publication.publicationType;
						break;
					  case 'Adapted':
						ob += "Publication Type: " + f.publication.publicationType;
						break;
					  case 'Redrawn':
						ob += "Publication Type: " + f.publication.publicationType;
						break;
					  case 'Original':
						ob += "Agency: " + replaceNL(f.original_agency) + "<br/>";
						ob += "Email: <a href='mailto:" + f.original_email + "'>" + f.original_email + "</a>";
						break;
					}
					*/
				}
				return(new Handlebars.SafeString(ob));
			});

			Handlebars.registerHelper('plus1', function(i) {
				var ob = (i+1).toString();
				return(new Handlebars.SafeString(ob));
			});

			Handlebars.registerHelper('output_methods', function(t1, t2) {
				var images = {}
				var i, j, name, dataset;
				var names = new Array();
				var jsn = new Array();
				var goodImages = new Array();

				// Get image names from Tier 1
				if (t1.same_images == "Yes") {
					goodImages.push(t1.figure.graphics_title);
				}
				else {
					for (i=0; i<t1.images.length; i++) {
						goodImages.push(t1.images[i].graphics_title);
					}
				}

				for (i=0; i<t2.methods.length; i++) {
					name = t2.methods[i].image_name;
					if (t2.methods[i].image_name != "" && $.inArray(name, goodImages) != -1 && $.inArray(t2.methods[i].image_name, names) == -1) {
					names.push(name);
					}
				}

				for (i=0; i<names.length; i++) {
					var jt = {};

					jt["datasets"] = new Array();
					for (j=0; j<t2.methods.length; j++) {
						if (names[i] === t2.methods[j].image_name) {
							if ($.inArray(t2.methods[j].dataset, jt["datasets"]) == -1) {
								jt["datasets"].push(t2.methods[j].dataset);
							}
						}
					}
					jt["name"] = names[i];
					jsn.push(jt);
				}
				return(jsn);
			});

			Handlebars.registerHelper("output-list", function(list) {
				var ob = "";

				for (var i=0; i<list.length; i++) {
					if (list[i] && list[i] !== "") {
						if (ob != "") {
							ob += ", ";
						}
						ob += list[i];
					}
				}
				return(new Handlebars.SafeString(ob));
			});

			Handlebars.registerHelper('output_BR', function(lines) {
				var ob = replaceNL(lines);
				return(new Handlebars.SafeString(ob));
			});

			Handlebars.registerHelper('output_dataset_details_tabs', function(index, image, datasets, t2) {
				var ob = "";

				if (t2) {
					ob += '<div class="tabpanel" style="margin-top: 10px;">';
					ob += '<ul class="nav nav-tabs" role="tablist" data-angel="1">';
					for (var i=0; i<datasets.length; i++) {
						ob += '<li role="presentation"';
						if (i == 0) {
							ob += ' class="active"';
						}
						ob += '><a href="#mb-' + index + '-' + i + '" aria-controls="mb-' + index + '-' + i + '" role="tab" data-toggle="tab">' + (i+1) + '</a></li>';
					}
					ob += "</ul>";
					ob += '<div class="tab-content">';
					for (var i=0; i<datasets.length; i++) {
						ob += '<div role="tabpanel" style="padding: 10px;" class="tab-pane fade in';
						if (i == 0) {
							ob += ' active';
						}
						ob += '" id="mb-' + index + '-' + i + '">';
						if (t2 != "") {
							for (j=0; j<t2.methods.length; j++) {
								if (t2.methods[j].image_name == image && t2.methods[j].dataset == datasets[i]) {
									ob += methods_details_template(t2.methods[j]);
								}
							}
						}
						ob += '</div>';
					}
					ob += '</div></div>';
				}
				return(new Handlebars.SafeString(ob));
			});

			Handlebars.registerPartial("figure-images-common", figureImagesCommonTemplateSrc);

			/*
				Load and compile Handlebars templates
			*/
			figure_template = Handlebars.compile(figureTemplateSrc);
			figure_images_common_template = Handlebars.compile(figureImagesCommonTemplateSrc);
			image_template = Handlebars.compile(imageTemplateSrc);
			methods_template = Handlebars.compile(methodsTemplateSrc);
			methods_details_template = Handlebars.compile(methodsDetailsTemplateSrc);

			/*
				Append all the display DIVs to the body
			*/
			if ($("#metadata-summary-modal").length == 0) {
				$("body").append(metadataModalTemplateSrc);
			}

			/*
				Put up a throbber
			*/
			$.blockUI({
				baseZ: 99999,
				message: $('#throbber') ,
				css: {
					padding: '16px',
					margin: 0,
					width: '64px',
					top: '50%',
					left: '50%',
					textAlign: 'center',
					color: '#000',
					border: 'none',
					background: 'white',
					cursor: 'wait'
				}
			});

			if (uri === "") {
			}
			else {
				var url = this.gcis_server;
				url += (uri.indexOf("/") == 0) ? uri : ("/" + uri);
				$.ajax({
					url: url + ".json?with_gcmd=1",
					dataType: 'json',
					async: true,
					context: this,
					success: function(d) {
						this.t1 = this._makeTier1(url, d);
						this.t2 = this._makeTier2(url, this.t1, d);

						if (this.t1 != null) {
							$('#metadata-summary-modal ul.nav-tabs li.image-tab').show();
							$("#metadata-figure").html(figure_template(this.t1.figure));
							if (this.t1.same_images == "Yes") {
								$('#metadata-summary-modal ul.nav-tabs li.image-tab').hide();
								//$("#metadata-images").html("<h3>Image information is the same as the figure.</h3>");
							}
							else if (typeof this.t1.images != "undefined") {
								$("#metadata-images").html(image_template(this.t1));
							}
							else {
								$("#metadata-images").html("<h3>No Images have been defined.</h3>");
							}
						}
						else {
							$("#metadata-figure").html("<h3>No Metadata has been entered.</h3>");
							$("#metadata-images").html("<h3>No Images have been defined.</h3>");
						}
						if (this.t2 !== null && (typeof this.t2.methods !== 'undefined' && this.t2.methods.length != 0)) {
							var ctx = {
								t1: this.t1,
								t2: this.t2
							};
							$('#metadata-summary-modal ul.nav-tabs li.methods-tab').show();
							$("#metadata-methods").html(methods_template(ctx));
						}
						else {
							$('#metadata-summary-modal ul.nav-tabs li.methods-tab').hide();
							//$("#metadata-methods").html("<h3>No dataset methods have been defined.</h3>");
						}
						$("#metadata-summary-modal h2#metadata-modal-label").html("Figure: " + this.t1.figure.graphics_title);
						$("a.zoom").off("click");
						$("a.zoom").on("click", function() {
							var href= $(this).attr("href");

							$("#metadata-image-zoom-modal .modal-body").html('<img src="' + href + '" style="width: 100%;">');
							$("#metadata-image-zoom-modal").modal({
								backdrop: true,
								keyboard: true
							});
							return false;
						});

						$('#metadata-summary-modal').modal();
						$("#metadata-summary-modal ul.nav-tabs li a:first").tab("show");

						/*
							http://miles-by-motorcycle.com/fv-b-8-670/stacking-bootstrap-dialogs-using-event-callbacks
						*/
						$('.modal').on('hidden.bs.modal', function(event) {
							$(this).removeClass('fv-modal-stack');
							var fvid = $('body').data('fv_open_modals') - 1;
							// Dont know why "overflow" is set to "hidden" but it disable vertical scrolling
							$(".fv-modal-id-" + fvid).css("overflow-y", "auto");
							$('body').data('fv_open_modals', $('body').data('fv_open_modals') - 1);
						});
						$('.modal').off('shown.bs.modal');
						$('.modal').on('shown.bs.modal', function (event) {
							/*
								Make the images thumbnail the same height
							*/
							//$("#tab2-images .metadata-img").matchHeight();

							// keep track of the number of open modals
							if (typeof($('body').data('fv_open_modals')) == 'undefined') {
								$('body').data('fv_open_modals', 0);
							}
								   
							// if the z-index of this modal has been set, ignore.
							if ($(this).hasClass('fv-modal-stack')) {
								return;
							}
								   
							$(this).addClass('fv-modal-stack');
							var fvid = $('body').data('fv_open_modals') + 1;
							$(this).addClass('fv-modal-id-' + fvid);
							$('body').data('fv_open_modals', fvid);
							$(this).css('z-index', 1040 + (10 * $('body').data('fv_open_modals')));
							$('.modal-backdrop').not('.fv-modal-stack')
									.css('z-index', 1039 + (10 * $('body').data('fv_open_modals')));
							$('.modal-backdrop').not('fv-modal-stack')
									.addClass('fv-modal-stack'); 
							$.unblockUI();
						 });
					},
					error: function(request, status, error) {
						var msg = "Error: ";
						if (request.status && request.status == 400) {
							msg += request.responseText;
						}
						else {
							msg += error;
						}
						$("#metadata-alert-modal .modal-body .alert p").html(msg);
							$("#metadata-alert-modal").modal({
								backdrop: false,
								keyboard: true,
							});
							 $("#metadata-summary-modal").off('shown.bs.modal');
							$("#metadata-alert-modal").on('shown.bs.modal', function (e) {
								$.unblockUI();
							});
					}
				});
			}
		},


		/*
			Generate a Tier 1 JSON var from GCIS data
		*/
		_makeTier1: function(url, json) {
			var t1 = {};
			var nImages;

			t1.version = 1;
			t1.figure = {};
			t1.figure.graphics_title = json.title;
			if (json.caption) {
				t1.figure.caption = json.caption;
			}
			t1.figure.thumbnail = json.files[0].thumbnail_href;
			t1.figure.href = json.files[0].href;
			t1.figure.size = json.files[0].size;
			t1.figure.graphics_create_date = this._fixupDate(json.create_dt);
			t1.figure.period_record = new Array();
			t1.figure.period_record.push(this._fixupDate(json.time_start));
			t1.figure.period_record.push(this._fixupDate(json.time_end));
			if (json.lat_min && json.lat_max && json.lon_min && json.lon_max) {
			t1.figure.spatial_extent = new Array();
			t1.figure.spatial_extent.push(json.lat_min);
			t1.figure.spatial_extent.push(json.lat_max);
			t1.figure.spatial_extent.push(json.lon_min);
			t1.figure.spatial_extent.push(json.lon_max);
			}
			if (json.contributors) {
				t1.poc = json.contributors[0].person.first_name;
			if (json.contributors[0].person.middle) {
				t1.poc += " " + json.contributors[0].person.middle;
			}
				t1.poc += " " + json.contributors[0].person.last_name;
			}
			if (json.images) {
				t1.same_images = "No";
				nImages = t1.figure.n_images = json.images.length;
				t1.images = new Array();
				for (var i=0; i<nImages; i++) {
					t1.images.push(this._copyImage(json.images[i]));
				}
			}
			else {
				t1.figure.n_images = 1;
				t1.same_images = "Yes";
				nImages = 1;
			}

			/*
				This is a guess since which origination is not sent to GCIS
			*/
			if (json.parents.length > 0) {
				t1.figure.origination = "Adapted";
				//t1.publication.publicationType = "";
			}
			else {
				t1.figure.origination = "Original";
				if (json.contributors) {
					t1.original_agency = json.contributors[0].name;
				}
				else {
					t1.original_agency = "";
				}
				t1.original_email = "";
			}

			/*
				Generate vector of datasets -> images
			*/
			if (json.images) {
				var ds = new Array();
					for (var ji = 0; ji<json.images.length; ji++) {
					dsj = gcis.get_datasets_names(json.images[ji].identifier);

					/* Loop thru all datasets and make a check for this image */
					if (dsj.length) {
						for (var i=0; i<dsj.length; i++) {
							var name = dsj[i];
							var found = 0;
							for (var j=0; j<ds.length; j++) {
								if (ds[j].dataset_name == name) {
									ds[j].imageSelect[ji] = "On";
									found = 1;
								}
							}
							if (!found) {
								var newI = {};
								newI.dataset_name = name;
								newI.imageSelect = new Array(json.images.length);
								for (var k=0; k<json.images.length; k++) {
									newI.imageSelect[k] = "";
								}
								newI.imageSelect[ji] = "On";
								ds.push(newI);
							}
						}
					}
				}
				t1.datasets = ds;
				t1.n_datasets = t1.datasets.length;
			}
			return(t1);
		},

		/*
			Generate a Tier 2 JSON var from GCIS data
		*/
		_makeTier2: function(url, t1, json) {
			var t2 = {};
			var url;

			if (typeof json.images !== "undefined") {
				t2.methods = new Array();
				for (var i=0; i<json.images.length; i++) {
					var id = json.images[i].identifier;
					url = this.gcis_server + "/image/" + id + ".json";
					$.ajax({
						context: this,
						url: url,
						dataType: 'json',
						async: false,
						success: function(d) {
							var acts = new Array();
							for (var j=0; j<d.parents.length; j++) {
								var t_act;
								if (d.parents[j].activity_uri) {
									var db = gcis.get_dataset_name_from_url(d.parents[j].url);
									var url = gcis.getServer() + d.parents[j].activity_uri + ".json";
									$.ajax({
										dataType: "json",
										async: false,
										url: url,
										success: function(act) {
											t_act = act;
										}
									});
									acts.push({
										db: db,
										act: t_act
									});
									haveMethods = 1;
								}
								else {
									acts.push({
										db: undefined,
										act: undefined,
									});
								}
							}

							for (var a=0; a<acts.length; a++) {
								if (acts[a].act != undefined) {
									var method = {};
									method.version = 1;
									method.image_name = t1.images[i].graphics_title;
									method.dataset = acts[a].db;
									method.dataset_methods_used = acts[a].act.methodology;
									method.dataset_how_visualized = acts[a].act.data_usage;
									method.dataset_software_used = this._listToArray(acts[a].act.software);
									method.dataset_visualization_software = this._listToArray(acts[a].act.visualization_software);
									method.dataset_os_used = acts[a].act.computing_environment;
									method.dataset_creation_time = acts[a].act.duration;

									f = acts[a].act.output_artifacts.split(",");
									method.dataset_output_file = f[0];
									if (f.length > 1) {
										method.dataset_files = new Array(f.length-1);
										for (var fi=1; fi<f.length; fi++) {
											method.dataset_files[fi-1] = f[fi];
										}
									}
									t2.methods.push(method);
								}
							}
						},
						error: function(request, status, error) {
							var msg = "Error: ";
							if (request.status && request.status == 400) {
								msg += request.responseText;
							}
							else {
								msg += error;
							}
							//console.log("Error!: " + url);
							alert(msg);
							$.unblockUI();
						}
					});
				}
			}
			return(t2);
		},

		_listToArray: function(l) {
			f = l.split(",");
			return(f);
		},

		_copyImage: function(fj) {
			var tj = {};

			var id = fj.identifier;
			url = this.gcis_server + "/image/" + id + ".json";
			$.ajax({
				context: this,
				url: url,
				dataType: 'json',
				async: false,
				success: function(d) {
					tj.graphics_title = d.title;
					if (d.files.length > 1) {
						tj.thumbnail = d.files[0].thumbnail_href;
						tj.href = d.files[0].href;
						tj.size = d.files[0].size;
					}
					else {
						tj.thumbnail = "";
						tj.href = "";
						tj.size = 0;
					}
					tj.graphics_create_date = this._fixupDate(d.create_dt);
					tj.period_record = new Array();
					tj.period_record.push(this._fixupDate(d.time_start));
					tj.period_record.push(this._fixupDate(d.time_end));
					if (d.lat_min && d.lat_max && d.lon_min && d.lon_max) {
						tj.spatial_extent = new Array();
						tj.spatial_extent.push(d.lat_min);
						tj.spatial_extent.push(d.lat_max);
						tj.spatial_extent.push(d.lon_min);
						tj.spatial_extent.push(d.lon_max);
					}
				},
				error: function(d) {
					tj = undefined;
				}
			});
			return(tj);
		},

		_fixupDate: function(dt) {
			return(dt ? dt.substring(0, 10) : "");
		},

		replaceNL: function(s) {
			var r = s;
			s = s.replace(/\n/g, "<br>");
			return(s);
		}

		// From https://gist.github.com/ChrisCinelli/5688048
		/*
		truncText: function(text, maxLength, ellipseText) {
			ellipseText = ellipseText || '&hellip;';
			   
			if (text.length < maxLength) 
			return text;

			//Find the last piece of string that contain a series of not A-Za-z0-9_ followed by A-Za-z0-9_ starting from maxLength
			var m = text.substr(0, maxLength).match(/([^A-Za-z0-9_]*)[A-Za-z0-9_]*$/);
			if (!m)
				return ellipseText;
			
			//Position of last output character
			var lastCharPosition = maxLength-m[0].length;
			
			//If it is a space or "[" or "(" or "{" then stop one before. 
			if (/[\s\(\[\{]/.test(text[lastCharPosition]))
				lastCharPosition--;
			
			//Make sure we do not just return a letter..
			return (lastCharPosition ? text.substr(0, lastCharPosition+1) : '') + ellipseText;
		},

		syntaxHighlightJSON: function(json) {
			json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
				var cls = 'number';
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = 'key';
					}
					else {
						cls = 'string';
					}
				}
				else if (/true|false/.test(match)) {
					cls = 'boolean';
				}
				else if (/null/.test(match)) {
					cls = 'null';
				}
				return '<span class="' + cls + '">' + match + '</span>';
			});
		},

		sortJSONobject: function(obj) {
			var keys = [];
			for (var key in obj) {
				keys.push(key);
			}
			keys.sort();
			var tempObj = new Object();

			for (var i=0; i < keys.length; i++) {
				for (var key in obj) {
					if (keys[i] == key) {
						tempObj[key] = (typeof obj[key] == 'object') ? sortJSONobject(obj[key]) : obj[key];
					}
				}
			}
			return tempObj;
		},

		// http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
		bytesToSize: function(bytes) {
		   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		   if (bytes == 0) return '0 Bytes';
		   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		},
		*/
    };
    return GCIS_viewer;
});
