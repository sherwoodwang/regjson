if (typeof exports !== "undefined") {
	exports.withModule = function (filenames, task) {
		var fs = require('fs');
		var modules = filenames.map(function (v) { return null; });
		var loaded = 0;
		for (var i = 0; i != filenames.length; ++i) {
			(function (i) {
				fs.readFile(filenames[i], function (err, data) {
					var loader = new Function('define', data);
					loader(function (factory) {
						modules[i] = factory();
						++loaded;
						if (loaded == filenames.length) {
							task.apply(undefined, modules);
						}
					});
				});
			})(i);
		}
	};
}
