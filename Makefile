all: target/regjson.min.js

OBJS+= target/parser.js
target/parser.js: src/parser/regjson.jison src/parser/regjson.jisonlex
	jison -o $@ -m amd $^

OBJS+= target/regjson.js
target/regjson.js: src/commonjs-wrapper.js target/parser.js src/standard-validators.js src/generate-validator-collection.js src/module.js
	preprocess $< >$@

OBJS+= target/regjson.min.js
target/regjson.min.js: target/regjson.js
	uglifyjs -m <$^ >$@

OBJS+= target/cli.min.js
target/cli.min.js: src/cli.js
	{ echo '#!/usr/bin/env node'; uglifyjs -m <$^; } >$@

OBJS+= target/package.json
target/package.json: src/package.json
	cat $^ >$@

OBJS+= target/version
target/version: src/package.json
	node -e 'var package ='"`cat src/package.json`"'; console.log(package.version)' >target/version

OBJS+= target/make.mk
target/make.mk: target/version
	{ \
		echo "OBJS+= regjson-`cat target/version`.tgz";\
		echo "all: regjson-`cat target/version`.tgz";\
		echo "regjson-`cat target/version`.tgz: target/regjson.min.js target/cli.min.js target/package.json";\
		echo "	npm pack target";\
	} >target/make.mk

-include target/make.mk

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
