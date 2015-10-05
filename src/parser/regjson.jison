%%
spec
	: class_definition_list
		{
			return $1;
		}
	;

class_definition_list
	: class_definition_list ";" class_definition
		{
			$$ = $1;
			if ($3 !== null) {
				$$[$3.key] = $3.spec;
			}
		}
	| class_definition
		{
			$$ = {};
			if ($1 !== null) {
				$$[$1.key] = $1.spec;
			}
		}
	;

class_definition
	: KEY "::" value_template
		{
			$$ = {};
			$$.key = $1;
			$$.spec = $3;
		}
	|
		{
			$$ = null;
		}
	;

object_template
	: "{" field_list_template "}"
		{
			$$ = { type: "object" };
			$$.namedFields = $2.namedFields;
			$$.otherFields = $2.otherFields;
		}
	;

field_list_template
	:
		{
			$$ = {
				namedFields: {},
				otherFields: []
			};
		}
	| "..."
		{
			$$ = $1;
			$$.otherFields.push({ type: "any" });
		}
	| concrete_field_list_template
		{
			$$ = $1;
		}
	| concrete_field_list_template "," "..."
		{
			$$ = $1;
			$$.otherFields.push({ type: "any" });
		}
	;


concrete_field_list_template
	: concrete_field_list_template "," field_template
		{
			$$ = $1;
			if ($3.key === null) {
				$$.otherFields.push($3.spec);
			} else {
				$$.namedFields[$3.key] = $3.spec;
			}
		}
	| field_template
		{
			$$ = {
				namedFields: {},
				otherFields: []
			};
			if ($1.key === null) {
				$$.otherFields.push($1.spec);
			} else {
				$$.namedFields[$1.key] = $1.spec;
			}
		}
	;

field_template
	: STRING ":" value_template
		{
			$$ = {};
			$$.key = eval($1);
			$$.spec = {
				fieldType: "required",
				form: $3
			};
		}
	| "?" STRING ":" value_template
		{
			$$ = {};
			$$.key = eval($2);
			$$.spec = {
				fieldType: "optional",
				form: $4
			};
		}
	| "*" placeholder ":" value_template
		{
			$$ = {};
			$$.key = null;
			$$.spec = $4;
			$$.spec.description = $2;
		}
	;

array_template
	: "[" element_list_template "]"
		{
			$$ = { type: "array" };
			$$.elements = $2.elements;
			$$.allowOthers = $2.allowOthers;
		}
	;

element_list_template
	:
		{
			$$ = {};
			$$.elements = [];
			$$.allowOthers = false;
		}
	| "..."
		{
			$$ = {};
			$$.elements = [];
			$$.allowOthers = true;
		}
	| concrete_element_list_template
		{
			$$ = {};
			$$.elements = $1;
			$$.allowOthers = false;
		}
	| concrete_element_list_template "," "..."
		{
			$$ = {};
			$$.elements = $1;
			$$.allowOthers = true;
		}
	;

concrete_element_list_template
	: concrete_element_list_template "," element_template
		{
			$$ = $1;
			$$.push($3);
		}
	| element_template
		{
			$$ = [$1];
		}
	;

element_template
	: value_template
		{
			$$ = {
				quantifier: [1, 1],
				spec: $1
			};
		}
	| "?" value_template
		{
			$$ = {
				quantifier: [0, 1],
				spec: $2
			};
		}
	| "*" value_template
		{
			$$ = {
				quantifier: [0, -1],
				spec: $2
			};
		}
	| "+" value_template
		{
			$$ = {
				quantifier: [1, -1],
				spec: $2
			};
		}
	| "{" NUMBER "," "}" value_template
		{
			$$ = {
				quantifier: [eval($2), -1],
				spec: $5
			};
		}
	| "{" NUMBER "," NUMBER "}" value_template
		{
			$$ = {
				quantifier: [eval($2), eval($4)],
				spec: $6
			};
		}
	;

value_template
	: value_template_with_branches
		{
			$$ = $1;
		}
	| atomic_value_template
		{
			$$ = $1;
		}
	;

value_template_with_branches
	: value_template_with_branches "|" atomic_value_template
		{
			$$ = $1;
			$$.branches.push($3);
		}
	| atomic_value_template "|" atomic_value_template
		{
			$$ = {
				type: "choice"
			};
			$$.branches = [$1, $3];
		}
	;

atomic_value_template
	: simple_value
		{
			$$ = {
				type: "value",
				value: $1
			};
		}
	| object_template
		{ $$ = $1; }
	| array_template
		{ $$ = $1; }
	| "<" KEY ">"
		{
			$$ = {
				type: "instance",
				name: $2
			};
		}
	| placeholder
		{
			$$ = {
				type: "any",
				description: $1
			};
		}
	;

simple_value
	: STRING
		{ $$ = eval($1); }
	| NUMBER
		{ $$ = eval($1); }
	| CONST_LITERAL
		{ $$ = eval($1); }
	;

placeholder
	: PLACEHOLDER
		{
			$$ = $1.slice(2, -2)
		}
	;

