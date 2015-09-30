%%
\s+							/* space */
"//[^\n]*\n"						/* comment */
"..."							return "..."
"::"							return "::"
";"							return ";"
"{"							return "{"
"}"							return "}"
"["							return "["
"]"							return "]"
":"							return ":"
","							return ","
"|"							return "|"
"?"							return "?"
"*"							return "*"
"+"							return "+"
"<<".*?">>"						return "PLACEHOLDER"
"<"							return "<"
">"							return ">"
\"([^\\"]|\\(["\\/bfnrt]|u[0-9a-fA-F]{4}))*\"		return "STRING"
(-)?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+\-]?[0-9]+)?	return "NUMBER"
true|false|null						return "CONST_LITERAL"
[a-zA-Z_][a-zA-Z0-9_]*					return "KEY"
