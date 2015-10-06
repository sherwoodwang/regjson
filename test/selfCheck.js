simpleLoader = require('./simpleLoader.js');

simpleLoader.withModule(['target/parser.js', 'src/generate-validator-collection.js'], function (parser, generateValidatorCollection) {
	var fs = require('fs');
	var console = require('console');
	var util = require('util');
	var regjsonSchemaAst = parser.parse(fs.readFileSync('src/regjsonSchema.rjsd').toString());
	var regjsonSchemaValidators = generateValidatorCollection(regjsonSchemaAst);

	process.argv.slice(2).forEach(function (fn) {
		var ast = parser.parse(fs.readFileSync(fn).toString());
		if (!regjsonSchemaValidators['regjson_schema_ast'](ast)) {
			console.error(util.inspect(ast, false, null));
			console.error('Faild to validate ' + fn);
			process.exit(1);
		}
	});

	process.exit();
});
