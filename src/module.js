define(['regjson/parser', 'regjson/standard-validators', 'regjson/generate-validator-collection', 'exports'], function (parser, standardValidators, generateValidatorCollection, exports) {
	exports.parse = function () { return parser.parse.apply(parser, arguments); };
	exports.standardValidators = standardValidators;
	exports.generateValidatorCollection = function () {
		var conv = function (v) {
			if (typeof v === 'string') {
				return parser.parse(v)
			} else {
				return v;
			}
		};

		var args = [];
		if (arguments.length == 1) {
			args.push(conv(arguments[0]));
		} else {
			args.push(arguments[0]);
			args.push(conv(arguments[1]));
		}

		return generateValidatorCollection.apply(this, args);
	};
});
