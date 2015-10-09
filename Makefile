all: target/regjson.js

OBJS+= target/parser.js
target/parser.js: src/parser/regjson.jison src/parser/regjson.jisonlex
	jison -o $@ -m amd $^

OBJS+= target/regjson.js
target/regjson.js: src/commonjs-wrapper.js target/parser.js src/standard-validators.js src/generate-validator-collection.js src/module.js
	preprocess $< >$@

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
