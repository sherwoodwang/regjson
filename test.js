console = require('console');
requirejs = require('requirejs');
parser = requirejs('target/parser');
generateValidatorCollection = requirejs('src/generate-validator-collection.js');

validator = generateValidatorCollection(parser.parse('test_class :: {}'));
console.log(validator['test_class']({}));

validator = generateValidatorCollection(parser.parse('test_class :: { "A": "B" }'));
console.log(validator['test_class']({"A": "B"}));
console.log(!validator['test_class']({"A": "B", "C": "D"}));

validator = generateValidatorCollection(parser.parse('test_class :: { "A": "B" | "C" }'));
console.log(validator['test_class']({"A": "C"}));

validator = generateValidatorCollection(parser.parse('test_class :: {}'));
console.log(!validator['test_class']({"A": "B"}));

validator = generateValidatorCollection(parser.parse('test_class :: { ? "A": "B", "C": "D" }'));
console.log(!validator['test_class']({"A": "B"}));
console.log(validator['test_class']({"A": "B", "C": "D"}));
console.log(validator['test_class']({"C": "D"}));

validator = generateValidatorCollection(parser.parse('test_class :: { "A": "B", ... }'));
console.log(validator['test_class']({"A": "B"}));
console.log(validator['test_class']({"A": "B", "C": "D"}));

validator = generateValidatorCollection(parser.parse('test_class :: { "A": <integer> }'));
console.log(!validator['test_class']({"A": "B"}));
console.log(validator['test_class']({"A": 123}));
console.log(!validator['test_class']({"A": 123.4}));

validator = generateValidatorCollection(parser.parse('test_class :: { *<<desc>>: <integer>}'));
console.log(!validator['test_class']({"A": "B"}));
console.log(validator['test_class']({"A": 123}));
console.log(!validator['test_class']({"A": 123.4}));

validator = generateValidatorCollection(parser.parse('test_class :: { "A": "B", *<<desc>>: <integer>}'));
console.log(validator['test_class']({"A": "B"}));
console.log(validator['test_class']({"A": "B", "C": 123}));
console.log(!validator['test_class']({"A": 1234}));

validator = generateValidatorCollection(parser.parse('test_class :: { "A": "B", *<<desc>>: <other_class> }; other_class :: { "C": "D" }'));
console.log(validator['test_class']({"A": "B"}));
console.log(validator['test_class']({"A": "B", "C": {"C": "D"}, "D": {"C": "D"}}));
console.log(!validator['test_class']({"A": "B", "C": {"C": "D"}, "D": "E"}));

validator = generateValidatorCollection(parser.parse('test_class :: [1, 2, 3]'));
console.log(validator['test_class']([1, 2, 3]));

validator = generateValidatorCollection(parser.parse('test_class :: [1, * 2, 3]'));
console.log(validator['test_class']([1, 3]));
console.log(validator['test_class']([1, 2, 3]));
console.log(validator['test_class']([1, 2, 2, 3]));

validator = generateValidatorCollection(parser.parse('test_class :: [1, ? 2, 3]'));
console.log(validator['test_class']([1, 3]));
console.log(validator['test_class']([1, 2, 3]));
console.log(!validator['test_class']([1, 2, 2, 3]));

validator = generateValidatorCollection(parser.parse('test_class :: [1, + 2, 3]'));
console.log(!validator['test_class']([1, 3]));
console.log(validator['test_class']([1, 2, 3]));
console.log(validator['test_class']([1, 2, 2, 3]));

validator = generateValidatorCollection(parser.parse('test_class :: [1, {3, 5} 2, 3]'));
console.log(!validator['test_class']([1, 3]));
console.log(!validator['test_class']([1, 2, 3]));
console.log(!validator['test_class']([1, 2, 2, 3]));
console.log(validator['test_class']([1, 2, 2, 2, 3]));
console.log(validator['test_class']([1, 2, 2, 2, 2, 3]));
console.log(validator['test_class']([1, 2, 2, 2, 2, 2, 3]));
console.log(!validator['test_class']([1, 2, 2, 2, 2, 2, 2, 3]));
console.log(!validator['test_class']([1, 2, 2, 2, 2, 2, 2, 2, 3]));
