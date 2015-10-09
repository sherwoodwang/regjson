var regjson = require('regjson');

function validate() {
	var fs = require('fs');
	var v = regjson.standardValidators;
	var i;
	for (i = 0; i != arguments.length; ++i) {
		var fn = arguments[i];

		if (/\.js$/.test(fn)) {
			var definition = new Function('defineValidators' ,fs.readFileSync(fn).toString());
			definition(function (factory) {
				v = factory(v);
			})
		} else if (/\.rjsd$/.test(fn)) {
			v = regjson.generateValidatorCollection(v, fs.readFileSync(fn).toString());
		} else {
			break;
		}
	}

	v = v[arguments[i++]];

	for (; i != arguments.length; ++i) {
		var fn = arguments[i];
		if (!v(JSON.parse(fs.readFileSync(fn).toString()))) {
			console.error(fn + " is not validate");
			process.exit(1);
		}
	}

	process.exit(0);
}

function ast(schemaFilename) {
	var fs = require('fs');
	var console = require('console');
	console.log(JSON.stringify(regjson.parse(fs.readFileSync(schemaFilename).toString()), false, null));
}

function main(subcmd) {
	var cmds = {
		'validate': validate,
		'ast': ast
	}
	cmds[subcmd].apply(this, Array.prototype.slice.call(arguments, 1));
}

if (require.main === module && typeof process !== "undefined") {
	main.apply(this, process.argv.slice(2));
}
