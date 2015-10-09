(function () {
	var mods = {'require': require, 'exports': {}, 'module': module};
	var produce = function (id, args) {
		args = args.reverse();
		var i = 0;
		var factory = args[i++];
		var dependencies = i < args.length && Array.isArray(args[i])? args[i++] : ['require', 'exports', 'module'];
		id = i < args.length? args[i++] : id;
		mods[id] = (function () {
			if (typeof factory === "function") {
				return factory.apply(this, dependencies.map(function (v) { return mods[v]; }));
			} else {
				return factory;
			}
		})();
	};
	var define;
	define = function () {
		produce('regjson/parser', Array.prototype.slice.call(arguments));
	};
	// #include "target/parser.js"
	define = function () {
		produce('regjson/standard-validators', Array.prototype.slice.call(arguments));
	};
	// #include "src/standard-validators.js"
	define = function () {
		produce('regjson/generate-validator-collection', Array.prototype.slice.call(arguments));
	};
	// #include "src/generate-validator-collection.js"
	define = function () {
		produce('regjson/module', Array.prototype.slice.call(arguments));
	};
	mods['exports'] = exports;
	// #include "src/module.js"
})();

function validate() {
	var fs = require('fs');
	var v = exports.standardValidators;
	var i;
	for (i = 0; i != arguments.length; ++i) {
		var fn = arguments[i];

		if (/\.js$/.test(fn)) {
			var definition = new Function('defineValidators' ,fs.readFileSync(fn).toString());
			definition(function (factory) {
				v = factory(v);
			})
		} else if (/\.rjsd$/.test(fn)) {
			v = exports.generateValidatorCollection(v, fs.readFileSync(fn).toString());
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
	console.log(JSON.stringify(exports.parse(fs.readFileSync(schemaFilename).toString()), false, null));
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
