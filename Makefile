BABEL_CMD = node_modules/.bin/babel
MOCHA_CMD = node_modules/.bin/mocha
ISTANBUL_CMD = node_modules/.bin/istanbul
ESLINT_CMD = node_modules/.bin/eslint
WEBPACK_CMD = node_modules/.bin/webpack

SRC_JS = $(shell find src -name "*.js")
LIB_JS = $(patsubst src/%.js,lib/%.js,$(SRC_JS))
TEST_JS = $(shell find lib -name "*-test.js")

BABEL_ARGS = --stage 0 --loose all --source-maps-inline
MOCHA_ARGS = --harmony --require lib/test/init.js $(TEST_JS)

# Build application
build: js browser

clean:
	rm -rf lib/
	rm -rf dist/

# Test
test: lint js
	@NODE_ENV=test $(MOCHA_CMD) $(MOCHA_ARGS)

test-cov: js
	@NODE_ENV=test $(ISTANBUL_CMD) cover node_modules/.bin/_mocha -- $(MOCHA_ARGS)

lint:
	$(ESLINT_CMD) $(SRC_JS)


# Build application quickly
# Faster on first build, but not after that
fast-build: fast-js build

# Publish docs to GitHub Pages
publish-docs:
	git subtree push --prefix docs/dist/flummox origin gh-pages

# Transpile JavaScript using Babel
js: $(LIB_JS)

$(LIB_JS): lib/%.js: src/%.js
	mkdir -p $(dir $@)
	$(BABEL_CMD) $< -o $@ $(BABEL_ARGS)

fast-js:
	$(BABEL_CMD) src -d lib $(BABEL_ARGS)

watch-js:
	$(BABEL_CMD) src -d lib $(BABEL_ARGS) -w

browser: $(SRC_JS)
	mkdir -p dist
	$(WEBPACK_CMD) src/Flux.js dist/flummox.js
	NODE_ENV=production $(WEBPACK_CMD) src/Flux.js dist/flummox.min.js

.PHONY: build clean test test-cov lin fast-build js fast-js watch-js browser
