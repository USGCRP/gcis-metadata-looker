/*
	vi: ts=4
*/
define([
	'jquery',
	'bootstrap',
	'handlebars',
	'matchHeight',
	'GCIS',
	'text!../templates/metadata-modal-template.html',
	'text!../templates/finding-template.html'
], function(
	$,
	$$,
	Handlebars,
	matchHeight,
	GCIS,
	metadataModalTemplateSrc,
	findingTemplateSrc
) {
    function GCIS_finding() {
		this.uri = "";
		this.finding_template = "";
		gcis = new GCIS();
		this.gcis_server = gcis.getServer();
    }

    GCIS_finding.prototype = {
		/*
			Display a key finding
		*/
		show: function(uri) {
			var url = this.gcis_server;
			url += (uri.indexOf("/") == 0) ? uri : ("/" + uri);
			url += ".json";
			var json = "";

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
			else {
				var h;
				json.statement = this._add_a(json.statement);
				finding_template = Handlebars.compile(findingTemplateSrc);
				h = finding_template(json);
				/*
				$("#metadata-finding-modal .modal-body").html(h);
				$("#metadata-finding-modal h2.modal-title").html("Key Finding");
				$('#metadata-finding-modal').modal();
				$("#metadata-finding-modal  div.modal-body").find(".confidence-level-td").matchHeight();
				*/
				return(h);
			}
		},

		_add_a: function(j) {
			var newj;
			newj = j.replace(/\[/g, '<a class="confidence" data-toggle="qtip" title="Likelyhood & Confindecne" data-div="#likely-confidence-div">[').replace(/\]/g, "]</a>");
			return(newj);
		}
    }
    return GCIS_finding;
});
