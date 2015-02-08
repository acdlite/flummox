6TO5_CMD = node_modules/.bin/6to5
MOCHA_CMD = node_modules/.bin/mocha

6TO5_ARGS = --experimental --source-maps-inline

SRC_JS = $(shell find src -name "*.js")
LIB_JS = $(patsubst src/%.js,lib/%.js,$(SRC_JS))

# Build application
build: js

clean:
	rm -rf lib/

# Test
test: js
	@NODE_ENV=test $(MOCHA_CMD) --harmony --require lib/test-init.js lib/**/__tests__/*-test.js

# Build application quickly
# Faster on first build, but not after that
fast-build: fast-js build

# Transpile JavaScript using 6to5
js: $(LIB_JS)

$(LIB_JS): lib/%.js: src/%.js
	mkdir -p $(dir $@) && $(6TO5_CMD) $< -o $@ $(6TO5_ARGS)

fast-js:
	$(6TO5_CMD) src -d lib $(6TO5_ARGS)

watch-js:
	$(6TO5_CMD) src -d lib $(6TO5_ARGS) -w

.PHONY: build test js clean
