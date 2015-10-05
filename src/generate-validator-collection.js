define(function () {
	var createValidators = function (spec) {
		var validators = {};

		validators['string'] = function (obj) {
			return typeof obj === 'string';
		};

		validators['number'] = function (obj) {
			return typeof obj === 'number';
		};

		validators['integer'] = function (obj) {
			return typeof obj === 'number' && parseInt(obj) === obj;
		};

		var generatorValidator = function (spec) {
			switch (spec.type) {
				case 'any':
					return function (obj) {
						return true;
					};
				case 'array':
					return (function () {
						var validatorsForElements = [];
						for (var i = 0; i != spec.elements.length; ++i) {
							validatorsForElements.push({
								quantifier: spec.elements[i].quantifier,
								validator: generatorValidator(spec.elements[i].spec)
							});
						}

						var allowOthers = spec.allowOthers;

						return function (obj) {
							if (!Array.isArray(obj)) {
								return false;
							}

							var index = 0;
							for (var i = 0; i != validatorsForElements.length; ++i) {
								var v = validatorsForElements[i];
								var min = v.quantifier[0];
								var max = v.quantifier[1];
								for (var j = 0; j != min; ++j) {
									if (!v.validator(obj[index])) {
										return false;
									}
									++index;
								}
								for (var j = min; j != max; ++j) {
									if (!v.validator(obj[index])) {
										break;
									}
									++index;
								}
							}

							if (!allowOthers && index != obj.length) {
								return false;
							}

							return true;
						};
					})();
				case 'choice':
					return (function () {
						var tests = spec.branches.map(generatorValidator)
						return function (obj) {
							return tests.reduce(function (stat, val) {
								return stat || val(obj);
							}, false)
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
				default:
					return false;
			}
		};

		for (var className in spec) {
			validators[className] = generatorValidator(spec[className]);
		}
		return validators;
	};	
	return createValidators;
});
