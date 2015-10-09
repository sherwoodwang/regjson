define(['regjson/standard-validators'], function (standatdValidators) {
	var addValidators = function (base, spec) {
		var validators = {};

		for (var clazz in base) {
			validators[clazz] = base[clazz];
		}

		var generatorValidator = function (spec) {
			switch (spec.type) {
				case 'any':
					return function (obj) {
						return true;
					};
				case 'array':
					return (function () {
						var elements = [];
						for (var i = 0; i != spec.elements.length; ++i) {
							elements.push({
								quantifier: spec.elements[i].quantifier,
								validator: generatorValidator(spec.elements[i].spec)
							});
						}

						var allowOthers = spec.allowOthers;

						return function (obj) {
							if (!Array.isArray(obj)) {
								return false;
							}

							var statuses = [[0, 0, 0]];
							var matched = false;

							while (statuses.length != 0) {
								statuses = Array.prototype.concat.apply([], statuses.map(function (v) {
									var mass = obj[v[0]];
									var e = elements[v[1]];
									var min = e.quantifier[0];
									var max = e.quantifier[1];
									var counter = v[2];
									if (counter < min) {
										if (!e.validator(mass)) {
											return [];
										} else {
											return [[v[0] + 1, v[1], v[2] + 1]]
										}
									} else {
										if (!e.validator(mass)) {
											return [[v[0], v[1] + 1, 0]];
										} else {
											return [[v[0], v[1] + 1, 0], [v[0] + 1, v[1] + 1, 0], [v[0] + 1, v[1], v[2] + 1]]
										}
									}
								}));
								statuses = statuses.map(function (v) {
									if (v[1] < elements.length && v[2] == elements[v[1]].quantifier[1]) {
										return [v[0], v[1] + 1, 0];
									} else {
										return v;
									}
								});
								statuses = Array.prototype.concat.apply([], statuses.map(function (v) {
									if (v[1] == elements.length) {
										matched = matched || allowOthers || v[0] == obj.length;
										return [];
									} else if (v[0] == obj.length) {
										return [];
									} else {
										return [v];
									}
								}));
								if (matched) {
									return matched;
								}
							}

							return matched;
						};
					})();
				case 'choice':
					return (function () {
						var tests = spec.branches.map(generatorValidator)
						return function (obj) {
							return tests.reduce(function (stat, val) {
								return stat || val(obj);
							}, false);
						};
					})();
				case 'instance':
					return (function () {
						var name = spec.name;
						return function (obj) {
							return validators[name](obj);
						};
					})();
				case 'object':
					return (function () {
						var requiredFields = [];
						for (name in spec.namedFields) {
							switch (spec.namedFields[name].fieldType) {
								case 'required':
									requiredFields.push(name);
									break;
							}
						}

						var validatorsForNamedFields = {};
						for (name in spec.namedFields) {
							validatorsForNamedFields[name] = generatorValidator(spec.namedFields[name].form);
						}

						var validatorsForOtherFields = [];
						for (var i = 0; i != spec.otherFields.length; ++i) {
							validatorsForOtherFields.push(generatorValidator(spec.otherFields[i]));
						}

						return function (obj) {
							if (typeof obj !== "object") {
								return false;
							}

							var fieldRecords = {};

							if (!requiredFields.reduce(function (prev, name) {
								return prev && (name in obj);
							}, true)) {
								return false;
							}

							for (name in obj) {
								if (name in validatorsForNamedFields) {
									if (!validatorsForNamedFields[name](obj[name])) {
										return false;
									}
								} else {
									var ok = false;

									for (var i = 0; i != validatorsForOtherFields.length; ++i) {
										if (validatorsForOtherFields[i](obj[name])) {
											ok = true;
											break;
										}
									}

									if (!ok) {
										return false;
									}
								}
							}

							return true;
						};
					})();
				case 'value':
					return (function () {
						var value = spec.value;
						return function (obj) {
							return obj === value;
						};
					})();
			}
		};

		for (var className in spec) {
			validators[className] = generatorValidator(spec[className]);
		}
		return validators;
	};

	var generateValidatorCollection = function () {
		var base, spec;

		if (arguments.length == 1) {
			base = standatdValidators;
			spec = arguments[0];
		} else {
			base = arguments[0];
			spec = arguments[1];
		}

		return addValidators(base, spec);
	};

	return generateValidatorCollection;
});
