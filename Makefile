all: target/parser.min.js target/generate-validator-collection.min.js

OBJS+= target/parser.js
target/parser.js: src/parser/regjson.jison src/parser/regjson.jisonlex
	jison -o $@ -m amd $^

OBJS+= target/parser.min.js
target/parser.min.js: target/parser.js
	uglifyjs -o $@ $^

OBJS+= target/generate-validator-collection.min.js
target/%.min.js: src/%.js
	uglifyjs -o $@ $^

test: all
	@echo -n Testing...
	@set -e; \
	for fn in test/*; do \
		if [ -d "$$fn" ]; then \
			node test/test.js "$$fn"; \
		fi; \
	done
	@node test/selfCheck.js test/*/schema.rjsd src/regjsonSchema.rjsd
	@echo ' done.'
clean:
	-rm -f $(OBJS)
.PHONY: all clean
