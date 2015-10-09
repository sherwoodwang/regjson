requirejs = require('requirejs');
requirejs.config({
	map: {
		'*': {
			'regjson/parser': './target/parser.js',
			'regjson/standard-validators':  './src/standard-validators.js',
			'regjson/generate-validator-collection':  './src/generate-validator-collection.js'
		}
	},
	nodeRequire: require
});

define = require('amdefine')(module);

requirejs(['regjson/parser', 'regjson/generate-validator-collection'], function (parser, generateValidatorCollection) {
	var fs = require('fs');
	var util = require('util');
	var schema = fs.readFileSync(process.argv[2] + '/schema.rjsd').toString();
	var ast = parser.parse(schema);
	var validators = generateValidatorCollection(ast);
	var cases = [];

	(function (caseFilename) {
		if (fs.existsSync(caseFilename)) {
			Array.prototype.push.apply(cases, JSON.parse(fs.readFileSync(caseFilename).toString()));
		}
	})(process.argv[2] + '/cases.json');

	(function (caseDirectory) {
		if (fs.existsSync(caseDirectory)) {
			var files = fs.readdirSync(caseDirectory);
			files.forEach(function (fn) {
				if (fn.endsWith('.json')) {
					cases.push(JSON.parse(fs.readFileSync(caseDirectory + '/' + fn).toString()));
				}
			});
		}
	})(process.argv[2] + '/cases');

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
