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
