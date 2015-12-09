# Metadata Looker v2 #

This Javascript package displays the GCIS metadata for a figure in
a Bootstrap modal window.  This package is also able to display a
GCIS reference formatted in the style used in 3rd National Climate
Assessment.

## How To ##

This package defines these external entry points:

	function gcis_show_figure(uuid)

	function gcis_show_image(uuid)

	function gcis_show_reference(uuid, div)

	function gcis_get_reference(uuid)

	function gcis_show_finding(uuid, modal_id)

In your HTML page include this line in the `<head>` section:

	<script data-main="build/looker.js" src="build/require.js"></script>

## GCIS References ##

References are formatted using the
[citeproc-js Citation Processor](https://bitbucket.org/fbennett/citeproc-js/wiki/Home).
The CSL file used is a modified AMS style file used for the
3<sup>rd</sup> National Climate Assessment. The NCA references
are derived from an EndNote library and the mapping from EndNote to
citeproc-js is still being tweaked.

## External Libraries ##

The package uses the following external libraries:

* [require.js](http://requirejs.org)
* [jQuery](http://jquery.com)
* [Bootstrap](http://getbootstrap.com)
* [Handlebars](http://handlebarsjs.com/)
* [citeproc-js](https://bitbucket.org/fbennett/citeproc-js/wiki/Home)
* [matchHeight](https://cdnjs.cloudflare.com/ajax/libs/jquery.matchHeight/0.6.0/jquery.matchHeight-min')

## Optimizing ##

To generate an optimized JS file issue these shell commands from the top level directory.

	% make

It is assumed that `node.js`, `gulp` and `gulp-sass` are already installed. Use `npm` to install
the latter two dependencies.

This creates a directory `build` in the top level directory. The Javascript file is
found here: `build/looker.js`.

## Contact Information ##

For more information please contact the [NCA TSU](mailto:tsu@cicsnc.org).
