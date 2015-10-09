define({
	'boolean': function (obj) {
		return typeof obj === 'boolean';
	},
	'string': function (obj) {
		return typeof obj === 'string';
	},
	'number': function (obj) {
		return typeof obj === 'number';
	},
	'integer': function (obj) {
		return typeof obj === 'number' && parseInt(obj) === obj;
	}
});
