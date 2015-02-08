6TO5_CMD = node_modules/.bin/6to5
MOCHA_CMD = node_modules/.bin/mocha
WEBPACK_CMD = node_modules/.bin/webpack

6TO5_ARGS = --experimental --source-maps-inline

SRC_JS = $(shell find src -name "*.js")
LIB_JS = $(patsubst src/%.js,lib/%.js,$(SRC_JS))

# Build application
build: js

clean:
	rm -rf lib/
	rm -rf dist/

# Test
test: js
	@NODE_ENV=test $(MOCHA_CMD) --harmony --require lib/test-init.js lib/**/__tests__/*-test.js

# Build application quickly
# Faster on first build, but not after that
fast-build: fast-js build

# Transpile JavaScript using 6to5
js: $(LIB_JS)

$(LIB_JS): lib/%.js: src/%.js
	mkdir -p $(dir $@)
	$(6TO5_CMD) $< -o $@ $(6TO5_ARGS)

fast-js:
	$(6TO5_CMD) src -d lib $(6TO5_ARGS)

watch-js:
	$(6TO5_CMD) src -d lib $(6TO5_ARGS) -w

browser: $(SRC_JS)
	mkdir -p dist
	$(WEBPACK_CMD) src/Flux.js dist/flummox.js
	COMPRESS=true $(WEBPACK_CMD) src/Flux.js dist/flummox.min.js

.PHONY: build clean test fast-build js fast-js watch-js
