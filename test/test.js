fs = require('fs');
util = require('util');

withModule = function (filenames, task) {
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

withModule(['target/parser.js', 'src/generate-validator-collection.js'],function (parser, generateValidatorCollection) {
	var schema = fs.readFileSync(process.argv[2] + '/schema.regjson').toString();
	var ast = parser.parse(schema);
	var validators = generateValidatorCollection(ast);
	var cases = JSON.parse(fs.readFileSync(process.argv[2] + '/cases.json').toString());
	cases.forEach(function (v) {
		if (v[0] != validators[v[1]](v[2])) {
			console.error('Schema:');
			console.error(util.inspect(ast, false, null));
			console.error(JSON.stringify(v[2]) + ' is expected ' + (v[0]? 'to' : 'not to') + ' pass the validation.');
			process.exit(1);
		}
	});
	process.exit(0);
});
